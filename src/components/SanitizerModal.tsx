import { useEffect, useMemo, useState } from 'react';
import { Lock, Plus, Search, X } from 'lucide-react';
import { matchesRule } from '@/workers/sanitizerWorker';

interface SanitizerModalProps {
  open: boolean;
  onClose: () => void;
  /** All unique leaf keys in the active document. */
  keys: string[];
  /** Keys the detection engine flags automatically. */
  autoDetected: Set<string>;
  /** Current effective redactions (path -> sample value). */
  redactionMap: Record<string, unknown>;
  customRules: string[];
  onApply: (overrides: Record<string, 'redact' | 'raw'>, rules: string[]) => void;
}

export default function SanitizerModal({
  open,
  onClose,
  keys,
  autoDetected,
  redactionMap,
  customRules,
  onApply,
}: SanitizerModalProps) {
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [draftRules, setDraftRules] = useState<string[]>(customRules);
  const [ruleInput, setRuleInput] = useState('');

  useEffect(() => {
    if (!open) return;
    const initial: Record<string, boolean> = {};
    for (const k of keys) initial[k] = redactionMap[k] !== undefined;
    setSelection(initial);
    setDraftRules(customRules);
    setSearch('');
    setRuleInput('');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const liveMatches = useMemo(() => {
    const rule = ruleInput.trim();
    if (!rule) return new Set<string>();
    return new Set(keys.filter((k) => matchesRule(k, rule)));
  }, [ruleInput, keys]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? keys.filter((k) => k.toLowerCase().includes(q)) : keys;
  }, [keys, search]);

  const autoGroup = useMemo(() => filtered.filter((k) => autoDetected.has(k)), [filtered, autoDetected]);
  const otherGroup = useMemo(() => filtered.filter((k) => !autoDetected.has(k)), [filtered, autoDetected]);

  const toggle = (k: string) => {
    setSelection((prev) => ({ ...prev, [k]: prev[k] === true ? false : true }));
  };

  const addRule = () => {
    const r = ruleInput.trim();
    if (!r) return;
    setDraftRules((prev) => (prev.includes(r) ? prev : [...prev, r]));
    setRuleInput('');
  };

  const removeRule = (r: string) => {
    setDraftRules((prev) => prev.filter((x) => x !== r));
  };

  const selectedCount = keys.filter((k) => selection[k] === true).length;

  const apply = () => {
    const overrides: Record<string, 'redact' | 'raw'> = {};
    for (const k of keys) {
      const checked = selection[k] === true;
      const isAuto = autoDetected.has(k);
      if (checked && !isAuto) overrides[k] = 'redact';
      else if (!checked && isAuto) overrides[k] = 'raw';
    }
    onApply(overrides, draftRules);
    onClose();
  };

  if (!open) return null;

  const renderGroup = (title: string, group: string[], emoji: string) => (
    <div>
      <p className="px-1 pb-1 pt-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
        {emoji} {title} <span className="text-faint">({group.length})</span>
      </p>
      {group.length === 0 ? (
        <p className="px-1 pb-1 text-xs text-faint">No matching keys.</p>
      ) : (
        group.map((k) => (
          <label
            key={k}
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-1 py-1 hover:bg-elevated-2"
          >
            <input
              type="checkbox"
              checked={selection[k] === true}
              onChange={() => toggle(k)}
              className="h-3.5 w-3.5 shrink-0 accent-accent"
            />
            <span
              className={`min-w-0 flex-1 truncate font-mono text-xs ${
                selection[k] === true ? 'text-ink' : 'text-body'
              }`}
              title={k}
            >
              {k}
            </span>
            {liveMatches.has(k) && (
              <span className="shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent-strong dark:text-accent">
                match
              </span>
            )}
            {redactionMap[k] !== undefined && (
              <Lock className="h-3 w-3 shrink-0 text-warning" aria-label="redacted" />
            )}
          </label>
        ))
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Manage sensitive keys"
    >
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-hairline bg-elevated shadow-[0_8px_24px_-4px_rgba(0,0,0,0.24)] animate-toast-in">
        <div className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Manage Sensitive Keys</h2>
            <p className="text-xs text-mute">
              Choose keys to redact; custom rules &amp; selection persist across sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon h-8 w-8"
            aria-label="Close"
            title="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3">
          <label className="relative block">
            <span className="sr-only">Search keys</span>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keys…"
              className="h-8 w-full rounded-sm border border-hairline bg-elevated pl-8 pr-3 text-xs text-ink placeholder:text-faint focus-visible:outline-accent"
            />
          </label>

          {renderGroup('Auto-Detected Secrets', autoGroup, '\u{1F534}')}
          {renderGroup('Other Parsed Keys', otherGroup, '\u26AA')}

          <div className="mt-3 border-t border-hairline pt-3">
            <label htmlFor="custom-rule" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
              Custom Key Rules
            </label>
            <div className="mt-1.5 flex gap-1.5">
              <input
                id="custom-rule"
                type="text"
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addRule();
                }}
                placeholder='e.g. *_token · /apiKey$/ · myAppAuth'
                className="h-8 min-w-0 flex-1 rounded-sm border border-hairline bg-elevated px-2.5 font-mono text-xs text-ink placeholder:text-faint focus-visible:outline-accent"
              />
              <button
                type="button"
                onClick={addRule}
                disabled={!ruleInput.trim()}
                className="btn-ghost h-8 w-8 shrink-0 px-0"
                aria-label="Add rule"
                title="Add rule"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 text-xs text-mute" role="status">
              Wildcards (<code className="font-mono text-accent-strong dark:text-accent">*_token</code>),
              regex (<code className="font-mono text-accent-strong dark:text-accent">/token$/</code>) or
              plain substrings.
              {liveMatches.size > 0 && (
                <span className="font-medium text-accent-strong dark:text-accent">
                  {' '}
                  Matches {liveMatches.size} key{liveMatches.size === 1 ? '' : 's'} now.
                </span>
              )}
            </p>
            {draftRules.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {draftRules.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-full border border-hairline bg-elevated-2 px-2 py-0.5 font-mono text-[11px] text-ink"
                  >
                    {r}
                    <button
                      type="button"
                      onClick={() => removeRule(r)}
                      className="text-mute hover:text-error"
                      aria-label={`Remove rule ${r}`}
                      title="Remove rule"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-hairline bg-canvas px-4 py-3">
          <span className="text-xs text-mute">
            {selectedCount} selected · {draftRules.length} rule
            {draftRules.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn-ghost h-8 px-3 text-xs">
              Cancel
            </button>
            <button type="button" onClick={apply} className="btn-primary h-8 px-4 text-xs">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
