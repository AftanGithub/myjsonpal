/**
 * Privacy-first Secret Key Auto-Hide & Sanitization Studio.
 *
 * Pure, dependency-free detection + redaction logic, exported so it can be
 * unit-tested and reused on the main thread, plus a thin Web Worker bridge.
 * Heavy scans run off the main thread via `new Worker(new URL(..., import.meta.url))`.
 */

export type SecretKind =
  | 'api_key'
  | 'password'
  | 'email'
  | 'phone'
  | 'credit_card'
  | 'ssn'
  | 'ip_address'
  | 'address'
  | 'jwt'
  | 'service_key'
  | 'connection_string'
  | 'high_entropy'
  | 'custom';

export interface Redaction {
  path: string;
  kind: SecretKind;
  sample: unknown;
}

export interface SanitizeRequest {
  data: unknown;
  /** Master switch for automatic detection (system keys, patterns, entropy). */
  enabled: boolean;
  /** User-defined key rules: /regex/, `*`-wildcards, or plain substrings. */
  customRules: string[];
  /** Per-key user overrides: 'redact' forces masking, 'raw' forces showing raw. */
  overrides: Record<string, 'redact' | 'raw'>;
}

export interface SanitizeResult {
  data: unknown;
  redactions: Redaction[];
  error?: string;
}

/* ------------------------------ key rules ------------------------------ */

const SECRET_KEYWORDS = [
  'api_key',
  'apikey',
  'secret',
  'access_token',
  'auth_token',
  'bearer',
  'private_key',
  'passwd',
  'password',
  'client_secret',
  'credential',
  'token',
  'connection_string',
  'private',
  'header',
  'cookie',
  'session',
  'signing_key',
];

// `author` / `authenticate` / `authorize` are not secrets, but `auth`,
// `auth_*`, `authToken`, `authtoken` and `authorization` are. `^auth[^oe]`
// catches camelCase/lowercase composites (`authToken` → `authtoken`) while
// skipping the `autho`/`authe` word families.
const AUTH_PATTERN = /(?:^|[-_.])auth(?:$|[-_.])|^auth[^oe]|authorization/i;

const PASSWORD_KEYWORDS = ['password', 'passwd', 'secret', 'client_secret'];
const CONN_KEYWORDS = ['connection_string', 'connectionstring', 'database_url', 'db_url', 'dsn'];

interface PiiRule {
  kind: SecretKind;
  re: RegExp;
}

const PII_RULES: PiiRule[] = [
  { kind: 'email', re: /email|mail|contact/ },
  { kind: 'phone', re: /phone|mobile|telephone|cell/ },
  { kind: 'credit_card', re: /card_?number|cardno|cc_?number|credit_card|pan/ },
  { kind: 'ssn', re: /\bssn\b|social_security|national_id|tax_id|ein/i },
  { kind: 'ip_address', re: /\bip\b|ip_address|ipv4|ipv6/ },
  { kind: 'address', re: /address|street|zip|postal/ },
];

const NUMERIC_SECRET_RE =
  /\bcvv\b|\bcvc\b|\bpin\b|pin_?code|card_?number|cardno|cc_?number|credit_card|\bssn\b|social_security|tax_id/i;

interface KeyClass {
  kind: SecretKind;
  numeric: boolean;
}

export function classifyKey(key: string): KeyClass | null {
  const k = key.toLowerCase();
  if (AUTH_PATTERN.test(k)) return { kind: 'api_key', numeric: false };
  if (CONN_KEYWORDS.some((w) => k.includes(w))) return { kind: 'connection_string', numeric: false };
  for (const rule of PII_RULES) {
    if (rule.re.test(k)) return { kind: rule.kind, numeric: NUMERIC_SECRET_RE.test(k) };
  }
  if (NUMERIC_SECRET_RE.test(k)) return { kind: 'ssn', numeric: true };
  if (PASSWORD_KEYWORDS.some((w) => k.includes(w))) return { kind: 'password', numeric: false };
  if (SECRET_KEYWORDS.some((w) => k.includes(w))) return { kind: 'api_key', numeric: false };
  return null;
}

/* --------------------------- known key formats -------------------------- */

const KNOWN_PATTERNS: { kind: SecretKind; re: RegExp }[] = [
  { kind: 'jwt', re: /^eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}$/ },
  { kind: 'service_key', re: /^sk_(test|live)_[A-Za-z0-9]{16,}$/ }, // Stripe
  { kind: 'service_key', re: /^AIza[0-9A-Za-z_-]{35}$/ }, // Google
  { kind: 'service_key', re: /^ghp_[A-Za-z0-9]{36}$/ }, // GitHub
  { kind: 'service_key', re: /^AKIA[0-9A-Z]{16}$/ }, // AWS
  { kind: 'service_key', re: /^sk-[A-Za-z0-9]{20,}$/ }, // OpenAI
  { kind: 'service_key', re: /^xox[baprs]-[A-Za-z0-9-]{10,}$/ }, // Slack
  { kind: 'service_key', re: /^sbp_[0-9A-Za-z]{32,}$/ }, // Supabase
  { kind: 'service_key', re: /^sb_secret_[0-9A-Za-z]+$/ }, // Supabase
  { kind: 'service_key', re: /^sk-ant-[A-Za-z0-9-]{10,}$/ }, // Anthropic
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i;

// 32–128 hex chars (MD5, SHA-1/SHA-256/SHA-512 hashes). Hex entropy caps at
// log2(16) ≈ 4.0, so hashes never trip the >4.5 entropy branch — match them here.
const HEX_HASH_RE = /^[a-fA-F0-9]{32,128}$/;

/* -------------------------- connection strings -------------------------- */

const CONN_SCHEMES = new Set([
  'postgres',
  'postgresql',
  'mysql',
  'mariadb',
  'mongodb',
  'mongodb+srv',
  'redis',
  'rediss',
  'amqp',
  'amqps',
  'rabbitmq',
  'mssql',
]);

const TOKEN_QUERY_KEYS = [
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'apikey',
  'key',
  'password',
  'pwd',
  'secret',
  'signature',
  'x-amz-signature',
  'session',
];

/**
 * Redacts embedded credentials in a connection string while keeping the
 * protocol, user, host, port and database path intact. Returns null when the
 * value is not a recognized connection string (or has no credentials to hide).
 */
export function redactConnectionString(value: string): string | null {
  const m = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([/?#].*)?$/i.exec(value);
  if (!m) return null;
  const scheme = m[1].toLowerCase();
  if (!CONN_SCHEMES.has(scheme)) return null;

  let authority = m[2];
  const rest = m[3] ?? '';
  let changed = false;

  const at = authority.lastIndexOf('@');
  if (at > 0) {
    const userinfo = authority.slice(0, at);
    const host = authority.slice(at + 1);
    const colon = userinfo.indexOf(':');
    if (colon >= 0 && userinfo.slice(colon + 1) !== '') {
      const user = userinfo.slice(0, colon);
      authority = `${user}:REDACTED_PASSWORD@${host}`;
      changed = true;
    }
  }

  if (rest.includes('?')) {
    const qIndex = rest.indexOf('?');
    const path = rest.slice(0, qIndex);
    const query = rest.slice(qIndex + 1);
    const params = query
      .split('&')
      .map((pair) => {
        const eq = pair.indexOf('=');
        if (eq <= 0) return pair;
        const key = pair.slice(0, eq);
        if (TOKEN_QUERY_KEYS.includes(key.toLowerCase())) {
          changed = true;
          return `${key}=REDACTED`;
        }
        return pair;
      })
      .join('&');
    return changed ? `${scheme}://${authority}${path}?${params}` : null;
  }

  return changed ? `${scheme}://${authority}${rest}` : null;
}

/* ------------------------------ entropy --------------------------------- */

export function shannonEntropy(s: string): number {
  const counts = new Map<string, number>();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let h = 0;
  for (const c of counts.values()) {
    const p = c / s.length;
    h -= p * Math.log2(p);
  }
  return h;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isHighEntropy(s: string): boolean {
  if (s.length <= 16) return false;
  if (UUID_RE.test(s)) return false;
  // ponytail: space/URL/JSON guards keep prose & structural values out of the
  // entropy net; real tokens are whitespace-free. Add an allowlist if needed.
  if (/\s/.test(s)) return false;
  if (/^https?:\/\//.test(s)) return false;
  if (/^[[{]/.test(s)) return false;
  return shannonEntropy(s) > 4.5;
}

/* --------------------------- custom rules ------------------------------- */

export function matchesRule(value: string, rule: string): boolean {
  const r = rule.trim();
  if (!r) return false;
  const re = r.match(/^\/(.*)\/([a-z]*)$/i);
  if (re) {
    try {
      return new RegExp(re[1], re[2]).test(value);
    } catch {
      return false;
    }
  }
  if (r.includes('*')) {
    const pattern = r
      .split('*')
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');
    try {
      return new RegExp(pattern, 'i').test(value);
    } catch {
      return false;
    }
  }
  return value.toLowerCase().includes(r.toLowerCase());
}

/* --------------------------- sample values ------------------------------ */

function sampleFor(value: unknown, kind: SecretKind): unknown {
  // Numeric secrets (CVV/SSN/…) become `0` — `000` is not valid JSON, so a
  // number stays a number.
  if (typeof value === 'number') return 0;
  switch (kind) {
    case 'password':
      return 'REDACTED_PASSWORD_SAMPLE';
    case 'email':
      return 'user@example.com';
    case 'phone':
      return '+1-550-0199';
    case 'credit_card':
      return '4111-XXXX-XXXX-1111';
    case 'ssn':
      return '000';
    case 'ip_address':
      return '0.0.0.0';
    case 'address':
      return 'REDACTED_ADDRESS_SAMPLE';
    case 'jwt':
      return 'eyJhbGciOi...[REDACTED_JWT_SAMPLE]';
    case 'connection_string': {
      const redacted = typeof value === 'string' ? redactConnectionString(value) : null;
      return redacted ?? 'postgresql://user:REDACTED_PASSWORD@localhost:5432/dbname';
    }
    case 'high_entropy':
      return 'REDACTED_HIGH_ENTROPY_STRING';
    default:
      return 'REDACTED_API_KEY_SAMPLE';
  }
}

/* --------------------------- traversal ---------------------------------- */

interface WalkCtx {
  enabled: boolean;
  customRules: string[];
  overrides: Record<string, 'redact' | 'raw'>;
  redactions: Redaction[];
  clone: boolean;
}

/** Value-shape detection: connection string → known prefix → email → entropy. */
function detectValueKind(value: string): { kind: SecretKind; sample: unknown } | null {
  if (redactConnectionString(value) !== null) {
    return { kind: 'connection_string', sample: sampleFor(value, 'connection_string') };
  }
  for (const rule of KNOWN_PATTERNS) {
    if (rule.re.test(value)) return { kind: rule.kind, sample: sampleFor(value, rule.kind) };
  }
  if (EMAIL_RE.test(value) && !URL_SCHEME_RE.test(value)) {
    return { kind: 'email', sample: 'user@example.com' };
  }
  if (HEX_HASH_RE.test(value)) {
    return { kind: 'high_entropy', sample: 'REDACTED_HIGH_ENTROPY_STRING' };
  }
  if (isHighEntropy(value)) {
    return { kind: 'high_entropy', sample: 'REDACTED_HIGH_ENTROPY_STRING' };
  }
  return null;
}

function decide(value: unknown, path: string, ctx: WalkCtx): Redaction | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const override = ctx.overrides[path];
  if (override === 'raw') return null;

  const leaf = path.split('.').pop() ?? '';
  const matchedRule = ctx.customRules.some((rule) => matchesRule(path, rule));

  if (!ctx.enabled) return null;

  if (override === 'redact' || matchedRule) {
    return { path, kind: 'custom', sample: sampleFor(value, 'api_key') };
  }

  const keyClass = classifyKey(leaf);
  const valueHit = typeof value === 'string' ? detectValueKind(value) : null;

  if (keyClass) {
    if (typeof value !== 'string' && !keyClass.numeric) return null;
    // Generic `api_key` keys yield to value patterns, which pin the sample
    // more precisely (a JWT under `token` gets the JWT placeholder).
    if (keyClass.kind === 'api_key' && valueHit) {
      return { path, kind: valueHit.kind, sample: valueHit.sample };
    }
    return { path, kind: keyClass.kind, sample: sampleFor(value, keyClass.kind) };
  }
  if (valueHit) return { path, kind: valueHit.kind, sample: valueHit.sample };
  return null;
}

function walk(node: unknown, path: string, ctx: WalkCtx): unknown {
  if (Array.isArray(node)) {
    const out: unknown[] = [];
    for (let i = 0; i < node.length; i += 1) {
      const child = walk(node[i], `${path}.${i}`, ctx);
      if (ctx.clone) out.push(child);
    }
    return out;
  }
  if (node !== null && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      const childPath = path ? `${path}.${k}` : k;
      const child = walk(v, childPath, ctx);
      if (ctx.clone) out[k] = child;
    }
    return out;
  }
  const r = decide(node, path, ctx);
  if (r) {
    ctx.redactions.push(r);
    return r.sample;
  }
  return node;
}

export function sanitizeJson(req: SanitizeRequest): SanitizeResult {
  const ctx: WalkCtx = {
    enabled: req.enabled,
    customRules: req.customRules,
    overrides: req.overrides,
    redactions: [],
    clone: true,
  };
  const data = walk(req.data, '', ctx);
  return { data, redactions: ctx.redactions };
}

/** Unique leaf dot-paths in a document (used by the key-management modal). */
export function flattenKeys(data: unknown, prefix = ''): string[] {
  const keys = new Set<string>();
  const visit = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((v, i) => visit(v, `${path}.${i}`));
    } else if (node !== null && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) visit(v, path ? `${path}.${k}` : k);
    } else {
      keys.add(path);
    }
  };
  visit(data, prefix);
  return Array.from(keys);
}

/** Leaf paths the automatic engine would redact (system rules + custom rules). */
export function detectKeys(data: unknown, customRules: string[]): string[] {
  const ctx: WalkCtx = {
    enabled: true,
    customRules,
    overrides: {},
    redactions: [],
    clone: false,
  };
  walk(data, '', ctx);
  return ctx.redactions.map((r) => r.path);
}

/* ------------------------------ worker glue ----------------------------- */

const scope = globalThis as unknown as {
  window?: unknown;
  postMessage?: (message: unknown) => void;
  onmessage?: (event: MessageEvent) => void;
};

// Register only inside a Web Worker (no `window`); the module stays importable
// on the main thread and in Node tests without side effects.
if (typeof scope.postMessage === 'function' && scope.window === undefined) {
  scope.onmessage = (event: MessageEvent<{ id: number; payload: SanitizeRequest }>) => {
    const { id, payload } = event.data;
    let result: SanitizeResult;
    try {
      result = sanitizeJson(payload);
    } catch (err) {
      result = {
        data: payload.data,
        redactions: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
    scope.postMessage?.({ id, result });
  };
}
