import { describe, it, expect } from 'vitest';
import {
  sanitizeJson,
  flattenKeys,
  detectKeys,
  classifyKey,
  matchesRule,
  shannonEntropy,
  redactConnectionString,
  type SanitizeRequest,
} from './sanitizerWorker';

function run(data: unknown, overrides: Partial<SanitizeRequest> = {}) {
  return sanitizeJson({
    data,
    enabled: true,
    customRules: [],
    overrides: {},
    ...overrides,
  });
}

const valueAt = (obj: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], obj);

describe('system key rules', () => {
  it('detects secrets case-insensitively with substring matching', () => {
    const res = run({ API_KEY: 'abc123', userToken: 'xyz', Password: 'hunter2' });
    expect(valueAt(res.data, 'API_KEY')).toBe('REDACTED_API_KEY_SAMPLE');
    expect(valueAt(res.data, 'userToken')).toBe('REDACTED_API_KEY_SAMPLE');
    expect(valueAt(res.data, 'Password')).toBe('REDACTED_PASSWORD_SAMPLE');
  });

  it('does not misclassify author/authentication keys', () => {
    const res = run({ author: 'Ada', authentication: 'completed', authorize: true });
    expect(res.redactions).toHaveLength(0);
    expect(res.data).toEqual({ author: 'Ada', authentication: 'completed', authorize: true });
  });

  it('classifies auth composites but not autho/authe words', () => {
    for (const k of ['author', 'authentication', 'authenticator', 'authorize']) {
      expect(classifyKey(k)).toBeNull();
    }
    for (const k of ['auth', 'auth_token', 'authToken', 'authtoken', 'authorization']) {
      expect(classifyKey(k)).toEqual({ kind: 'api_key', numeric: false });
    }
  });

  it('redacts PII keys with matching sample values', () => {
    const res = run({
      email: 'ada@example.com',
      phone: '+1-555-0100',
      card_number: '4111111111111111',
      ip_address: '192.168.0.1',
      address: '1 Main St',
    });
    expect(valueAt(res.data, 'email')).toBe('user@example.com');
    expect(valueAt(res.data, 'phone')).toBe('+1-550-0199');
    expect(valueAt(res.data, 'card_number')).toBe('4111-XXXX-XXXX-1111');
    expect(valueAt(res.data, 'ip_address')).toBe('0.0.0.0');
    expect(valueAt(res.data, 'address')).toBe('REDACTED_ADDRESS_SAMPLE');
  });

  it('zeroes numeric secrets while leaving plain numbers alone', () => {
    const res = run({ ssn: 123456789, cvv: 123, port: 5432, count: 42 });
    expect(valueAt(res.data, 'ssn')).toBe(0);
    expect(valueAt(res.data, 'cvv')).toBe(0);
    expect(valueAt(res.data, 'port')).toBe(5432);
    expect(valueAt(res.data, 'count')).toBe(42);
  });
});

describe('nested structures', () => {
  it('redacts values inside nested arrays and objects', () => {
    const res = run({
      users: [{ email: 'a@example.com' }, { email: 'b@example.com' }],
      meta: { session: { token: 't0k3n' } },
    });
    expect(valueAt(res.data, 'users.0.email')).toBe('user@example.com');
    expect(valueAt(res.data, 'users.1.email')).toBe('user@example.com');
    expect(valueAt(res.data, 'meta.session.token')).toBe('REDACTED_API_KEY_SAMPLE');
    expect(res.redactions.map((r) => r.path)).toEqual([
      'users.0.email',
      'users.1.email',
      'meta.session.token',
    ]);
  });

  it('flattens keys with dot paths', () => {
    const keys = flattenKeys({ user: { auth: { id: 1 } }, items: [{ sku: 'a' }] });
    expect(keys).toEqual(['user.auth.id', 'items.0.sku']);
  });

  it('detects auto-detected keys for the modal', () => {
    const detected = detectKeys({ token: 'x', name: 'Ada' }, []);
    expect(detected).toEqual(['token']);
  });
});

describe('known service key formats', () => {
  const cases: [string, string][] = [
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.9fK3jVcXmQ7pLzB1rWnT4sY6uI8oA0eCg', 'eyJhbGciOi...[REDACTED_JWT_SAMPLE]'],
    ['sk_live_abcdefghijklmnopqrstuvwxyz0123456789', 'REDACTED_API_KEY_SAMPLE'],
    ['AIzaSyA1234567890123456789012345678901234', 'REDACTED_API_KEY_SAMPLE'],
    ['ghp_abcdefghijklmnopqrstuvwxyz0123456789', 'REDACTED_API_KEY_SAMPLE'],
    ['AKIAIOSFODNN7EXAMPLE', 'REDACTED_API_KEY_SAMPLE'],
    ['sk-0123456789abcdefghijklmnop', 'REDACTED_API_KEY_SAMPLE'],
    ['xoxb-123456789012-1234567890123-abcdefghijk', 'REDACTED_API_KEY_SAMPLE'],
    ['sbp_abcdefghijklmnopqrstuvwxyz0123456789', 'REDACTED_API_KEY_SAMPLE'],
    ['sk-ant-api03-abcdefghijklmnopqrstuvwx', 'REDACTED_API_KEY_SAMPLE'],
  ];

  for (const [value, sample] of cases) {
    it(`redacts ${value.slice(0, 12)}…`, () => {
      const res = run({ token: value });
      expect(valueAt(res.data, 'token')).toBe(sample);
    });
  }
});

describe('connection strings', () => {
  it('redacts the password but keeps host/protocol/db', () => {
    const res = run({ databaseUrl: 'postgres://app:supersecret@localhost:5432/mydb' });
    expect(valueAt(res.data, 'databaseUrl')).toBe(
      'postgres://app:REDACTED_PASSWORD@localhost:5432/mydb',
    );
  });

  it('redacts token query params in mongodb URIs', () => {
    const redacted = redactConnectionString(
      'mongodb+srv://u:pass@cluster.mongodb.net/db?retryWrites=true&token=abc123',
    );
    expect(redacted).toBe(
      'mongodb+srv://u:REDACTED_PASSWORD@cluster.mongodb.net/db?retryWrites=true&token=REDACTED',
    );
  });

  it('handles password-less redis auth with empty user', () => {
    expect(redactConnectionString('redis://:secret@localhost:6379/0')).toBe(
      'redis://:REDACTED_PASSWORD@localhost:6379/0',
    );
  });

  it('does not flag connection strings without credentials', () => {
    expect(redactConnectionString('postgres://app@localhost/db')).toBeNull();
  });

  it('does not flag plain https URLs', () => {
    expect(redactConnectionString('https://user:pass@example.com/path')).toBeNull();
    const res = run({ url: 'https://user:pass@example.com/path' });
    expect(valueAt(res.data, 'url')).toBe('https://user:pass@example.com/path');
  });
});

describe('high-entropy detection', () => {
  const token = 'k9Qm2XvB7tN4LpR1wZf3Hj8Yc5Dg7Sb';

  it('flags high-entropy whitespace-free strings >16 chars', () => {
    expect(shannonEntropy(token)).toBeGreaterThan(4.5);
    const res = run({ clientId: token });
    expect(valueAt(res.data, 'clientId')).toBe('REDACTED_HIGH_ENTROPY_STRING');
  });

  it('does not flag UUIDs', () => {
    const res = run({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' });
    expect(res.redactions).toHaveLength(0);
  });

  it('does not flag short strings', () => {
    const res = run({ code: 'aB3xQ9z' });
    expect(res.redactions).toHaveLength(0);
  });

  it('flags hex hashes even though hex entropy stays under 4.5', () => {
    const md5 = 'd41d8cd98f00b204e9800998ecf8427e';
    expect(shannonEntropy(md5)).toBeLessThan(4.5);
    const res = run({ checksum: md5 });
    expect(valueAt(res.data, 'checksum')).toBe('REDACTED_HIGH_ENTROPY_STRING');
  });

  it('flags a 64-char SHA-256 and a 128-char hex hash', () => {
    const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(valueAt(run({ digest: sha256 }).data, 'digest')).toBe('REDACTED_HIGH_ENTROPY_STRING');
    const long = `${sha256}${sha256}`;
    expect(valueAt(run({ digest: long }).data, 'digest')).toBe('REDACTED_HIGH_ENTROPY_STRING');
  });

  it('does not flag hex outside the 32-128 length range', () => {
    const short = run({ hex: 'd41d8cd9' });
    expect(short.redactions).toHaveLength(0);
    const nonHex = run({ hex: 'g41d8cd98f00b204e9800998ecf8427e' });
    expect(nonHex.redactions).toHaveLength(0);
  });
});

describe('false positives', () => {
  it('does not redact normal prose descriptions', () => {
    const text =
      'This is a completely normal description of the weather in the city today. ' +
      'It is reasonably long and full of ordinary English words and spaces.';
    const res = run({ description: text });
    expect(res.redactions).toHaveLength(0);
    expect(valueAt(res.data, 'description')).toBe(text);
  });

  it('does not redact ISO timestamps or version strings', () => {
    const res = run({ timestamp: '2026-08-01T10:15:30Z', version: '2.1.0' });
    expect(res.redactions).toHaveLength(0);
  });

  it('leaves booleans, nulls and nested data untouched', () => {
    const res = run({ active: true, notes: null, headers: { 'Content-Type': 'application/json' } });
    expect(res.redactions).toHaveLength(0);
  });
});

describe('custom rules & overrides', () => {
  it('supports wildcard rules', () => {
    expect(matchesRule('user.auth_token', '*_token')).toBe(true);
    expect(matchesRule('username', '*_token')).toBe(false);
  });

  it('supports regex rules', () => {
    expect(matchesRule('sk-abcdef', '/^sk-/')).toBe(true);
    expect(matchesRule('skills', '/^sk-/')).toBe(false);
  });

  it('supports plain substring rules', () => {
    expect(matchesRule('myAppAuthKey', 'myAppAuth')).toBe(true);
  });

  it('only applies custom rules when the auto toggle is on', () => {
    const res = run({ apiKey: 'x', myAppAuth: 'y' }, { customRules: ['myAppAuth'], enabled: false });
    expect(valueAt(res.data, 'apiKey')).toBe('x');
    expect(valueAt(res.data, 'myAppAuth')).toBe('y');
    const on = run({ myAppAuth: 'y' }, { customRules: ['myAppAuth'] });
    expect(valueAt(on.data, 'myAppAuth')).toBe('REDACTED_API_KEY_SAMPLE');
  });

  it('only honors a redact override when the auto toggle is on', () => {
    const res = run({ nickname: 'Ada' }, { overrides: { nickname: 'redact' }, enabled: false });
    expect(valueAt(res.data, 'nickname')).toBe('Ada');
    expect(res.redactions).toHaveLength(0);
  });

  it('honors an explicit redact override for a non-detected key', () => {
    const res = run({ nickname: 'Ada' }, { overrides: { nickname: 'redact' } });
    expect(valueAt(res.data, 'nickname')).toBe('REDACTED_API_KEY_SAMPLE');
  });

  it('honors a raw override that beats auto-detection', () => {
    const res = run({ password: 'hunter2' }, { overrides: { password: 'raw' } });
    expect(valueAt(res.data, 'password')).toBe('hunter2');
    expect(res.redactions).toHaveLength(0);
  });

  it('does nothing automatically when disabled', () => {
    const res = run({ token: 'abc', email: 'a@b.com' }, { enabled: false });
    expect(res.redactions).toHaveLength(0);
  });
});
