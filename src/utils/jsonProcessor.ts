import { stringify } from 'yaml';
import { autoFixJson, isValidJson, type FixReport } from './jsonFixer';

export type OutputFormat = 'json' | 'csv' | 'yaml' | 'typescript' | 'sql' | 'minified';
export type TaskKind = 'format' | 'minify' | 'fix' | 'convert';

export interface TaskInput {
  kind: TaskKind;
  format: OutputFormat;
  text: string;
  tableName?: string;
}

export interface TaskResult {
  ok: boolean;
  output?: string;
  /** When set, the input editor should be replaced with this (e.g. fixed text). */
  input?: string;
  changes?: string[];
  valid?: boolean;
  message?: string;
  error?: string;
}

/* ----------------------------- helpers ----------------------------- */

function parse(text: string): unknown {
  return JSON.parse(text);
}

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function minifyJson(data: unknown): string {
  return JSON.stringify(data);
}

/* ------------------------------- CSV ------------------------------- */

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(data: unknown): string {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return '';

  if (rows.every((r) => r === null || typeof r !== 'object')) {
    return rows.map(csvCell).join('\n');
  }

  const objects: Record<string, unknown>[] = rows.map((r) =>
    r !== null && typeof r === 'object' ? { ...(r as Record<string, unknown>) } : { value: r },
  );
  const columns = Array.from(new Set(objects.flatMap((o) => Object.keys(o))));
  const header = columns.map(csvCell).join(',');
  const lines = objects.map((o) => columns.map((c) => csvCell(o[c])).join(','));
  return [header, ...lines].join('\n');
}

/* ------------------------------- YAML ------------------------------ */

function toYaml(data: unknown): string {
  return stringify(data, { indent: 2, lineWidth: 0, defaultStringType: 'PLAIN' });
}

/* --------------------------- TypeScript ---------------------------- */

const RESERVED = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
  'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
]);

function isValidIdentifier(key: string): boolean {
  return /^[A-Za-z_$][\w$]*$/.test(key) && !RESERVED.has(key);
}

function pascalCase(name: string): string {
  const parts = name.split(/[^A-Za-z0-9$]+/).filter(Boolean);
  const joined = parts
    .map((p) => p.replace(/^[\d]+/, '').charAt(0).toUpperCase() + p.slice(1))
    .join('');
  return joined || '';
}

function toTypescript(data: unknown, rootName = 'JsonRoot'): string {
  const interfaces: string[] = [];
  const usedNames = new Set<string>();
  const registered = new Set<string>();

  const uniqueName = (raw: string): string => {
    let name = raw || rootName;
    let n = 1;
    while (usedNames.has(name)) {
      name = `${raw}${n}`;
      n += 1;
    }
    usedNames.add(name);
    return name;
  };

  const typeOf = (value: unknown, nameHint: string): string => {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]';
      return `${typeOf(value[0], `${nameHint}Item`)}[]`;
    }
    if (value === null) return 'null';
    switch (typeof value) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object': {
        const entries = Object.entries(value as Record<string, unknown>);
        if (entries.length === 0) return 'Record<string, unknown>';
        const name = uniqueName(pascalCase(nameHint));
        registered.add(name);
        const body = entries.map(([k, v]) => {
          const field = isValidIdentifier(k) ? k : JSON.stringify(k);
          const type = typeOf(v, name + pascalCase(k));
          return `  ${field}: ${type};`;
        });
        interfaces.push(`export interface ${name} {\n${body.join('\n')}\n}`);
        return name;
      }
      default:
        return 'unknown';
    }
  };

  const rootType = typeOf(data, rootName);
  if (!registered.has(rootName) && rootType !== 'unknown') {
    interfaces.unshift(`export type ${rootName} = ${rootType};`);
  }
  return interfaces.join('\n\n');
}

/* -------------------------------- SQL ------------------------------ */

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'object') return sqlLiteral(JSON.stringify(value));
  return `'${String(value).replace(/'/g, "''")}'`;
}

function toSql(data: unknown, tableName = 'records'): string {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return '';
  const objects: Record<string, unknown>[] = rows.map((r) =>
    r !== null && typeof r === 'object' ? { ...(r as Record<string, unknown>) } : { value: r },
  );
  const columns = Array.from(new Set(objects.flatMap((o) => Object.keys(o))));
  const safeTable = tableName.replace(/[^A-Za-z0-9_]/g, '_') || 'records';
  const colList = columns.map(quoteIdent).join(', ');
  const values = objects.map((o) => `(${columns.map((c) => sqlLiteral(o[c])).join(', ')})`);
  return `INSERT INTO ${safeTable} (${colList})\nVALUES\n${values.join(',\n')};`;
}

/* --------------------------- dispatch ------------------------------ */

export function runTask(task: TaskInput): TaskResult {
  const { kind, format, text } = task;

  if (kind === 'fix') {
    const report: FixReport = autoFixJson(text);
    if (report.valid) {
      const data = parse(report.fixed);
      return {
        ok: true,
        output: formatJson(data),
        input: report.fixed,
        changes: report.changes,
        valid: true,
        message: 'Repaired successfully',
      };
    }
    return {
      ok: true,
      output: report.fixed,
      input: report.fixed,
      changes: report.changes,
      valid: false,
      message: 'Repaired what I could — some errors remain',
      error: report.error,
    };
  }

  try {
    const data = parse(text);

    if (kind === 'minify' || format === 'minified') {
      return { ok: true, output: minifyJson(data) };
    }
    if (format === 'csv') return { ok: true, output: toCsv(data) };
    if (format === 'yaml') return { ok: true, output: toYaml(data) };
    if (format === 'typescript') return { ok: true, output: toTypescript(data) };
    if (format === 'sql') return { ok: true, output: toSql(data, task.tableName) };

    return { ok: true, output: formatJson(data) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const probe = isValidJson(text);
    return {
      ok: false,
      error: probe.error ? `${probe.error} — ${message}` : message,
    };
  }
}
