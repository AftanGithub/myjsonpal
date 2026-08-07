import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  sanitizeJson,
  flattenKeys,
  detectKeys,
  type SanitizeRequest,
  type SanitizeResult,
} from '@/workers/sanitizerWorker';

const STORAGE_KEY = 'myjsonpal.sanitizer.v1';

interface PersistedState {
  enabled: boolean;
  customRules: string[];
  overrides: Record<string, 'redact' | 'raw'>;
}

function loadPersisted(defaultEnabled: boolean): PersistedState {
  if (typeof window === 'undefined') return { enabled: defaultEnabled, customRules: [], overrides: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: defaultEnabled, customRules: [], overrides: {} };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      enabled: parsed.enabled ?? defaultEnabled,
      customRules: Array.isArray(parsed.customRules) ? parsed.customRules : [],
      overrides: parsed.overrides ?? {},
    };
  } catch {
    return { enabled: defaultEnabled, customRules: [], overrides: {} };
  }
}

function createWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  try {
    return new Worker(new URL('../workers/sanitizerWorker.ts', import.meta.url), {
      type: 'module',
    });
  } catch {
    return null;
  }
}

export interface SanitizerState {
  enabled: boolean;
  customRules: string[];
  overrides: Record<string, 'redact' | 'raw'>;
  rawData: unknown;
  sanitizedData: unknown;
  sanitizedJson: string | null;
  redactionMap: Record<string, unknown>;
  redactionCount: number;
  keys: string[];
  autoDetected: Set<string>;
  banner: boolean;
  reverted: boolean;
  pending: boolean;
  error: string | null;
  setEnabled: (value: boolean) => void;
  togglePath: (path: string) => void;
  commit: (overrides: Record<string, 'redact' | 'raw'>, rules: string[]) => void;
  undo: () => void;
  runSanitize: (json: string, compact?: boolean) => void;
}

export function useSanitizer(defaultEnabled = false): SanitizerState {
  const initial = useRef(loadPersisted(defaultEnabled));
  const [enabled, setEnabled] = useState(initial.current.enabled);
  const [customRules, setCustomRules] = useState<string[]>(initial.current.customRules);
  const [overrides, setOverrides] = useState<Record<string, 'redact' | 'raw'>>(
    initial.current.overrides,
  );

  const [source, setSource] = useState<{ json: string; compact: boolean } | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);
  const [sanitizedData, setSanitizedData] = useState<unknown>(null);
  const [sanitizedJson, setSanitizedJson] = useState<string | null>(null);
  const [redactionMap, setRedactionMap] = useState<Record<string, unknown>>({});
  const [redactionCount, setRedactionCount] = useState(0);
  const [banner, setBanner] = useState(false);
  const [reverted, setReverted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, (r: SanitizeResult) => void>());
  const idRef = useRef(0);
  const redactionMapRef = useRef<Record<string, unknown>>({});
  useEffect(() => {
    redactionMapRef.current = redactionMap;
  }, [redactionMap]);

  const runInWorker = useCallback((payload: SanitizeRequest): Promise<SanitizeResult> => {
    return new Promise((resolve) => {
      let w = workerRef.current;
      if (!w) {
        w = createWorker();
        if (w) {
          w.onmessage = (event: MessageEvent<{ id: number; result: SanitizeResult }>) => {
            const entry = pendingRef.current.get(event.data.id);
            if (entry) {
              pendingRef.current.delete(event.data.id);
              entry(event.data.result);
            }
          };
          w.onerror = () => {
            const entries = Array.from(pendingRef.current.values());
            pendingRef.current.clear();
            workerRef.current = null;
            for (const entry of entries) {
              try {
                entry(sanitizeJson(payload));
              } catch (err) {
                entry({
                  data: payload.data,
                  redactions: [],
                  error: err instanceof Error ? err.message : String(err),
                });
              }
            }
          };
          workerRef.current = w;
        }
      }
      if (!w) {
        try {
          resolve(sanitizeJson(payload));
        } catch (err) {
          resolve({
            data: payload.data,
            redactions: [],
            error: err instanceof Error ? err.message : String(err),
          });
        }
        return;
      }
      const id = idRef.current++;
      pendingRef.current.set(id, resolve);
      w.postMessage({ id, payload });
    });
  }, []);

  const persist = useCallback((e: boolean, rules: string[], ov: Record<string, 'redact' | 'raw'>) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ enabled: e, customRules: rules, overrides: ov }),
      );
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    persist(enabled, customRules, overrides);
  }, [persist, enabled, customRules, overrides]);

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setPending(true);
    setError(null);

    let data: unknown;
    try {
      data = JSON.parse(source.json);
    } catch {
      setRawData(null);
      setSanitizedData(null);
      setSanitizedJson(null);
      setRedactionMap({});
      setRedactionCount(0);
      setBanner(false);
      setPending(false);
      return;
    }
    setRawData(data);

    const payload: SanitizeRequest = { data, enabled, customRules, overrides };
    runInWorker(payload).then((result) => {
      if (cancelled) return;
      const map: Record<string, unknown> = {};
      for (const r of result.redactions) map[r.path] = r.sample;
      setRedactionMap(map);
      setRedactionCount(result.redactions.length);
      setSanitizedData(result.data);
      setSanitizedJson(
        source.compact
          ? JSON.stringify(result.data)
          : JSON.stringify(result.data, null, 2),
      );
      setBanner(result.redactions.length > 0);
      setReverted(false);
      setError(result.error ?? null);
      setPending(false);
    });

    return () => {
      cancelled = true;
    };
  }, [source, enabled, customRules, overrides, runInWorker]);

  const keys = useMemo(
    () => (rawData === null ? [] : flattenKeys(rawData)),
    [rawData],
  );

  const autoDetected = useMemo(() => {
    const detected = new Set<string>(
      rawData === null ? [] : detectKeys(rawData, customRules),
    );
    for (const [path, ov] of Object.entries(overrides)) {
      if (ov === 'redact') detected.add(path);
      else if (ov === 'raw') detected.delete(path);
    }
    return detected;
  }, [rawData, customRules, overrides]);

  const runSanitize = useCallback((json: string, compact = false) => {
    setSource({ json, compact });
    setReverted(false);
  }, []);

  const togglePath = useCallback((path: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const masked = redactionMapRef.current[path] !== undefined;
      if (masked) next[path] = 'raw';
      else if (prev[path] === 'raw') delete next[path];
      else next[path] = 'redact';
      return next;
    });
  }, []);

  const commit = useCallback(
    (ov: Record<string, 'redact' | 'raw'>, rules: string[]) => {
      setOverrides(ov);
      setCustomRules(rules);
    },
    [],
  );

  const undo = useCallback(() => setReverted(true), []);
  const setEnabledCb = useCallback((v: boolean) => setEnabled(v), []);

  return {
    enabled,
    customRules,
    overrides,
    rawData,
    sanitizedData,
    sanitizedJson,
    redactionMap,
    redactionCount,
    keys,
    autoDetected,
    banner,
    reverted,
    pending,
    error,
    setEnabled: setEnabledCb,
    togglePath,
    commit,
    undo,
    runSanitize,
  };
}
