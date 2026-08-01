/**
 * Magic Auto-Repair Engine.
 *
 * Pure, regex-based heuristics that repair the most common "dirty JSON"
 * mistakes in a single pass. Runs on the main thread for small payloads and
 * inside the Web Worker for large ones. Every step is conservative: it only
 * makes changes that are unambiguous, and it reports exactly what it did.
 */

export interface FixReport {
  /** The repaired text (may still be invalid if repair is impossible). */
  fixed: string;
  /** Whether the repaired text parses as valid JSON. */
  valid: boolean;
  /** Human-readable list of changes made. */
  changes: string[];
  /** Remaining parse error, if the repaired text is still invalid. */
  error?: string;
}

/** Strip the UTF-8 BOM and normalize line endings. */
function normalize(raw: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  let text = raw.replace(/^\uFEFF/, '');
  if (text !== raw) changes.push('Removed UTF-8 byte order mark');

  const unified = text.replace(/\r\n?/g, '\n');
  if (unified !== text) {
    text = unified;
    changes.push('Normalized line endings to \\n');
  }
  return { text, changes };
}

/** Remove // and # line comments and /* *​/ block comments (best effort, string-safe heuristics). */
function stripComments(text: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  const blockBefore = text;
  const blockStripped = blockBefore.replace(/\/\*[\s\S]*?\*\//g, '');
  if (blockStripped !== blockBefore) changes.push('Removed block comments');

  // Line comments: only when preceded by start-of-line, whitespace, or a structural token.
  let stripped = blockStripped
    .replace(/(^|[\s,{[[])\/\/.*$/gm, '$1')
    .replace(/(^|[\s,{[[])#.*$/gm, '$1');

  if (stripped !== blockStripped) changes.push('Removed line comments');
  return { text: stripped, changes };
}

/** Convert Python single-quoted strings to JSON double-quoted strings, escaping inner quotes. */
function convertSingleQuotes(text: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  let count = 0;
  const converted = text.replace(
    /'((?:\\.|[^'\\])*)'/g,
    (_, inner) => {
      count += 1;
      return '"' + inner.replace(/\\'/g, "'").replace(/"/g, '\\"') + '"';
    },
  );
  if (count > 0) {
    changes.push(
      `Replaced ${count} single-quoted string${count === 1 ? '' : 's'} with double quotes`,
    );
  }
  return { text: converted, changes };
}

/** Wrap unquoted object keys in double quotes. */
function quoteUnquotedKeys(text: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  let count = 0;
  const quoted = text.replace(
    /([{,]\s*)([A-Za-z_$][\w$-]*)(\s*:)/g,
    (_, pre, key, colon) => {
      count += 1;
      return `${pre}"${key}"${colon}`;
    },
  );
  if (count > 0) {
    changes.push(`Quoted ${count} unquoted key${count === 1 ? '' : 's'}`);
  }
  return { text: quoted, changes };
}

/** Remove trailing commas before closing braces/brackets. */
function removeTrailingCommas(text: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  let count = 0;
  const cleaned = text.replace(/,\s*([}\]])/g, (_, close) => {
    count += 1;
    return close;
  });
  if (count > 0) {
    changes.push(`Removed ${count} trailing comma${count === 1 ? '' : 's'}`);
  }
  return { text: cleaned, changes };
}

/** Coerce Python / JS-ish literals into JSON-compatible tokens. */
function normalizeLiterals(text: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  const before = text;

  let bools = 0;
  let nulls = 0;
  const coerced = before.replace(
    /\b(?:True|False|None|Null|Undefined|NaN|Infinity)\b/g,
    (token: string) => {
      if (token === 'True' || token === 'False') {
        bools += 1;
        return token === 'True' ? 'true' : 'false';
      }
      nulls += 1;
      return 'null';
    },
  );

  if (bools > 0) {
    changes.push(`Converted ${bools} Python boolean${bools === 1 ? '' : 's'} to true/false`);
  }
  if (nulls > 0) {
    changes.push(`Converted ${nulls} null-like literal${nulls === 1 ? '' : 's'} to null`);
  }
  return { text: coerced, changes };
}

/** Attempt to parse; extract a friendly line/column from V8 error messages. */
function isValidJson(text: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const position = message.match(/position (\d+)/)?.[1];
    if (position) {
      const pos = Number(position);
      const before = text.slice(0, pos);
      const lines = before.split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1]?.length ?? 0;
      return { valid: false, error: `Syntax error on line ${line}, column ${col}` };
    }
    return { valid: false, error: message };
  }
}

export function autoFixJson(raw: string): FixReport {
  const { text: normalized, changes } = normalize(raw);
  const comments = stripComments(normalized);
  const quotes = convertSingleQuotes(comments.text);
  const keys = quoteUnquotedKeys(quotes.text);
  const commas = removeTrailingCommas(keys.text);
  const literals = normalizeLiterals(commas.text);

  const allChanges = [
    ...changes,
    ...comments.changes,
    ...quotes.changes,
    ...keys.changes,
    ...commas.changes,
    ...literals.changes,
  ];

  const result = isValidJson(literals.text);
  return {
    fixed: literals.text,
    valid: result.valid,
    changes: allChanges,
    ...(result.error ? { error: result.error } : {}),
  };
}

/** Re-exported for the processor/UI to surface remaining errors. */
export { isValidJson };
