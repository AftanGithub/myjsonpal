import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CmEditor from './CmEditor';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import type { Extension } from '@codemirror/state';
import { lintGutter, linter } from '@codemirror/lint';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
} from '@codemirror/view';
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
} from '@codemirror/language';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  ArrowDownUp,
  ArrowLeftRight,
  Braces,
  Check,
  ChevronDown,
  Clipboard,
  ClipboardPaste,
  Download,
  Eraser,
  FileCode2,
  FileJson,
  Loader2,
  Minimize2,
  Network,
  Play,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { editorHighlight, editorTheme } from '@/utils/cmTheme';
import { runTaskAsync } from '@/utils/workerClient';
import { TOOLS, type ToolConfig } from '@/config/tools';
import type { OutputFormat, TaskKind } from '@/utils/jsonProcessor';
import JsonTree from './JsonTree';

interface EditorWorkspaceProps {
  toolId: string;
}

const EXT: Record<OutputFormat, string> = {
  json: 'json',
  minified: 'min.json',
  csv: 'csv',
  csvjson: 'json',
  yaml: 'yaml',
  yamljson: 'json',
  typescript: 'ts',
  zod: 'ts',
  sql: 'sql',
};

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'json', label: 'JSON · Formatted' },
  { value: 'minified', label: 'JSON · Minified' },
  { value: 'csv', label: 'JSON ➔ CSV' },
  { value: 'csvjson', label: 'CSV ➔ JSON' },
  { value: 'yaml', label: 'JSON ➔ YAML' },
  { value: 'yamljson', label: 'YAML ➔ JSON' },
  { value: 'typescript', label: 'JSON ➔ TypeScript' },
  { value: 'zod', label: 'JSON ➔ Zod Schema' },
  { value: 'sql', label: 'JSON ➔ SQL' },
];

const INVERSE: Partial<Record<OutputFormat, OutputFormat>> = {
  csv: 'csvjson',
  csvjson: 'csv',
  yaml: 'yamljson',
  yamljson: 'yaml',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function kindFor(format: OutputFormat): TaskKind {
  if (format === 'minified') return 'minify';
  if (format === 'json') return 'format';
  return 'convert';
}

const CONVERT_LABELS: Partial<Record<OutputFormat, string>> = {
  csv: 'Convert to CSV',
  csvjson: 'Convert to JSON',
  yaml: 'Convert to YAML',
  yamljson: 'Convert to JSON',
  typescript: 'Convert to TS',
  zod: 'Convert to Zod',
  sql: 'Convert to SQL',
};

export default function EditorWorkspace({ toolId }: EditorWorkspaceProps) {
  const tool: ToolConfig = TOOLS[toolId];

  const [input, setInput] = useState(tool.sample);
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<OutputFormat>(tool.defaultFormat);
  const [viewMode, setViewMode] = useState<'raw' | 'tree'>('raw');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tableName, setTableName] = useState('records');
  const [outputLang, setOutputLang] = useState<Extension | undefined>(undefined);
  const [inputLang, setInputLang] = useState<Extension | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const canTree = format === 'json' || format === 'minified' || format === 'csvjson' || format === 'yamljson';
  const effectiveView = canTree ? viewMode : 'raw';
  const isConverter = kindFor(tool.defaultFormat) === 'convert';
  const isCsvInput = format === 'csvjson';
  const isYamlInput = format === 'yamljson';
  const isNonJsonInput = isCsvInput || isYamlInput;
  const isConvertFormat = format !== 'json' && format !== 'minified';
  const primarySpec = isConvertFormat
    ? {
        label: CONVERT_LABELS[format] ?? 'Convert',
        title: `Convert the input to ${(CONVERT_LABELS[format] ?? '').replace('Convert to ', '')}`,
        icon: ArrowDownUp,
      }
    : format === 'json'
      ? { label: 'Format', title: 'Pretty-print JSON', icon: Braces }
      : { label: 'Minify', title: 'Compress JSON', icon: Minimize2 };
  const disabledFormats =
    isCsvInput
      ? new Set<OutputFormat>(FORMAT_OPTIONS.filter((o) => o.value !== 'csvjson').map((o) => o.value))
      : isYamlInput
        ? new Set<OutputFormat>(FORMAT_OPTIONS.filter((o) => o.value !== 'yamljson').map((o) => o.value))
        : new Set<OutputFormat>(['csvjson', 'yamljson']);

  const process = useCallback(
    async (
      kind: TaskKind,
      textOverride?: string,
      formatOverride?: OutputFormat,
      tableOverride?: string,
    ) => {
      const fmt = formatOverride ?? format;
      const text = textOverride ?? input;
      setBusy(true);
      setError(null);
      setMessage(null);
      try {
        const res = await runTaskAsync({
          kind,
          format: fmt,
          text,
          tableName: tableOverride ?? tableName,
        });
        if (!res.ok) {
          setError(res.error ?? 'Could not process the input.');
          return;
        }
        if (res.input !== undefined) setInput(res.input);
        if (res.output !== undefined) setOutput(res.output);
        setValid(res.valid !== false);
        const changesSummary =
          res.changes && res.changes.length ? res.changes.join(' · ') : null;
        if (res.valid === false) {
          setError(res.error ?? 'The input still contains syntax errors.');
        } else if (changesSummary) {
          setMessage(`✓ ${changesSummary}`);
        } else if (res.message) {
          setMessage(`✓ ${res.message}`);
        } else if (fmt === 'json') {
          setMessage('✓ Formatted');
        } else if (fmt === 'minified') {
          setMessage('✓ Minified');
        } else {
          const target = (CONVERT_LABELS[fmt] ?? 'target format').replace('Convert to ', '');
          setMessage(`✓ Converted to ${target}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [format, input, tableName],
  );

  const runDefault = useCallback(
    (text: string) => {
      const kind = tool.defaultAction === 'minify' ? 'minify' : tool.defaultAction;
      setFormat(tool.defaultFormat);
      process(kind, text, tool.defaultFormat);
    },
    [process, tool.defaultAction, tool.defaultFormat],
  );

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    runDefault(tool.sample);
  }, [runDefault, tool.sample]);

  useEffect(() => {
    setInputLang(undefined);
    setOutputLang(undefined);
    if (format === 'yaml') {
      import('@codemirror/lang-yaml').then((m) => setOutputLang(m.yaml()));
    } else if (format === 'yamljson') {
      import('@codemirror/lang-yaml').then((m) => setInputLang(m.yaml()));
    } else if (format === 'sql') {
      import('@codemirror/lang-sql').then((m) => setOutputLang(m.sql()));
    } else if (format === 'typescript' || format === 'zod') {
      import('@codemirror/lang-javascript').then((m) =>
        setOutputLang(m.javascript({ typescript: true, jsx: false })),
      );
    }
  }, [format]);

  const handleFix = () => process('fix');
  const handleFormat = () => {
    setFormat('json');
    process('format', undefined, 'json');
  };
  const handleMinify = () => {
    setFormat('minified');
    process('minify', undefined, 'minified');
  };

  const handleFormatChange = (next: OutputFormat) => {
    setFormat(next);
    process(kindFor(next), undefined, next);
  };

  const handleSwap = () => {
    const inv = INVERSE[format];
    if (!inv || !output) return;
    const swappedInput = output;
    setInput(swappedInput);
    setFormat(inv);
    process(kindFor(inv), swappedInput, inv);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        process('format', text);
      }
    } catch {
      setError('Clipboard access is blocked — paste with Ctrl+V instead.');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setMessage(null);
    setValid(true);
  };

  const handleLoadSample = () => {
    setInput(tool.sample);
    setFormat(tool.defaultFormat);
    process(kindFor(tool.defaultFormat), tool.sample, tool.defaultFormat);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setInput(text);
      const kind = tool.defaultAction === 'minify' ? 'minify' : tool.defaultAction;
      setFormat(tool.defaultFormat);
      process(kind, text, tool.defaultFormat);
    };
    reader.readAsText(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not write to the clipboard.');
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.fileName}.${EXT[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const treeData = useMemo(() => {
    if (effectiveView !== 'tree') return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output, effectiveView]);

  const inputStats = useMemo(() => {
    return {
      lines: input.split('\n').length,
      bytes: new Blob([input]).size,
    };
  }, [input]);

  const outputStats = useMemo(() => {
    return {
      lines: output ? output.split('\n').length : 0,
      bytes: output ? new Blob([output]).size : 0,
    };
  }, [output]);

const minimalSetup = [
  lineNumbers(),
  foldGutter(),
  lintGutter(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  drawSelection(),
  dropCursor(),
  rectangularSelection(),
  history(),
  bracketMatching(),
  indentOnInput(),
  indentUnit.of('  '),
  keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
];

  const inputExtensions = useMemo(() => {
    const lang =
      format === 'csvjson' ? undefined : format === 'yamljson' ? inputLang : json();
    const linterExt =
      format === 'csvjson' || format === 'yamljson' ? undefined : linter(jsonParseLinter());
    return [
      editorTheme,
      lang,
      linterExt,
      editorHighlight,
      EditorView.lineWrapping,
      ...minimalSetup,
    ].filter((e): e is Extension => Boolean(e));
  }, [format, inputLang]);

  const outputExtensions = useMemo(() => {
    const lang =
      format === 'json' ||
      format === 'minified' ||
      format === 'csvjson' ||
      format === 'yamljson'
        ? json()
        : outputLang;
    return [
      editorTheme,
      lang,
      editorHighlight,
      EditorView.lineWrapping,
      ...minimalSetup,
    ].filter((e): e is Extension => Boolean(e));
  }, [format, outputLang]);

  const toolButton = (
    onClick: () => void,
    label: string,
    title: string,
    Icon: typeof Braces,
    opts: { primary?: boolean; active?: boolean; disabled?: boolean } = {},
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={busy || opts.disabled}
      className={`inline-flex h-10 w-full select-none items-center justify-center gap-2 rounded-sm border px-3 text-sm font-medium transition-[background,color,opacity,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${
        opts.primary
          ? 'border-transparent bg-ink text-canvas hover:opacity-85'
          : opts.active
            ? 'border-accent bg-accent-soft text-accent-strong dark:text-accent'
            : 'border-hairline bg-elevated text-ink hover:bg-elevated-2'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-elevated shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {/* ----------------------------- Input pane ----------------------------- */}
        <div
          className={`flex min-h-[400px] flex-col border-b border-hairline lg:min-h-[540px] lg:border-b-0 lg:border-r ${
            dragOver ? 'ring-2 ring-inset ring-accent' : ''
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2">
            <span className="eyebrow">Input</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePaste}
                className="btn-ghost h-8 gap-1.5 px-2.5 text-xs"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
                Paste
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="btn-ghost h-8 gap-1.5 px-2.5 text-xs"
                title="Load sample data"
              >
                <FileJson className="h-3.5 w-3.5" aria-hidden="true" />
                Sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn-icon h-8 w-8"
                title="Clear input"
                aria-label="Clear input"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <CmEditor
              value={input}
              onChange={(value) => setInput(value)}
              extensions={inputExtensions}
              placeholder={
                format === 'csvjson'
                  ? 'Paste your CSV here, or drag & drop a .csv file…'
                  : format === 'yamljson'
                    ? 'Paste your YAML here, or drag & drop a .yaml file…'
                    : 'Paste your JSON here, or drag & drop a .json file…'
              }
            />
          </div>
        </div>

        {/* -------------------------- Middle control bar ------------------------ */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 border-b border-hairline bg-canvas px-3 py-2.5 lg:w-44 lg:flex-col lg:border-b-0 lg:border-x lg:py-4">
          {isConverter &&
            toolButton(
              () => process(kindFor(format), undefined, format),
              primarySpec.label,
              primarySpec.title,
              primarySpec.icon,
              { primary: true },
            )}
          {!isNonJsonInput &&
            toolButton(handleFix, 'Auto-Fix', 'Repair common JSON syntax errors', Wand2, {
              primary: !isConverter,
            })}
          {!isNonJsonInput &&
            (!isConverter || format !== 'json') &&
            toolButton(handleFormat, 'Format', 'Pretty-print JSON', Braces)}
          {!isNonJsonInput &&
            (!isConverter || format !== 'minified') &&
            toolButton(handleMinify, 'Minify', 'Compress JSON', Minimize2)}
          {INVERSE[format] !== undefined &&
            toolButton(handleSwap, 'Swap', 'Swap the conversion direction', ArrowLeftRight, {
              disabled: !output,
            })}
          {toolButton(
            () => setViewMode((v) => (v === 'tree' ? 'raw' : 'tree')),
            effectiveView === 'tree' ? 'Raw' : 'Tree',
            canTree
              ? effectiveView === 'tree'
                ? 'Switch to raw view'
                : 'Switch to tree view'
              : 'Tree view requires JSON output',
            effectiveView === 'tree' ? FileCode2 : Network,
            { active: effectiveView === 'tree', disabled: !canTree },
          )}
        </div>

        {/* ----------------------------- Output pane ---------------------------- */}
        <div className="flex min-h-[400px] flex-col lg:min-h-[540px]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-3 py-2">
            <span className="eyebrow">Output</span>
            <div className="flex items-center gap-1.5">
              <label className="relative">
                <span className="sr-only">Output format</span>
                <ArrowDownUp
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute"
                  aria-hidden="true"
                />
                <select
                  value={format}
                  onChange={(e) => handleFormatChange(e.target.value as OutputFormat)}
                  className="h-8 cursor-pointer appearance-none rounded-sm border border-hairline bg-elevated pl-8 pr-7 text-xs font-medium text-ink transition-colors hover:bg-elevated-2 focus-visible:outline-accent"
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={disabledFormats.has(opt.value)}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute"
                  aria-hidden="true"
                />
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-icon h-8 w-8"
                title="Copy output to clipboard"
                aria-label="Copy output to clipboard"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                ) : (
                  <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="btn-icon h-8 w-8"
                title="Download output"
                aria-label="Download output"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {treeData !== null ? (
              <JsonTree data={treeData} />
            ) : (
              <CmEditor
                value={output}
                readOnly
                extensions={outputExtensions}
                placeholder="Your result will appear here…"
              />
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------ Status bar ----------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline bg-canvas px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          {busy ? (
            <span className="inline-flex items-center gap-1.5 text-mute">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Processing in a Web Worker…
            </span>
          ) : error ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-error">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-error" aria-hidden="true" />
              {error}
            </span>
          ) : message ? (
            <span className="inline-flex items-center gap-1.5 text-mute">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              <span className="truncate">{message}</span>
            </span>
          ) : (
            <span className="text-mute">Ready</span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-faint">
          {format === 'sql' && (
            <label className="hidden items-center gap-1.5 sm:flex">
              <span className="font-sans text-mute">Table:</span>
              <input
                ref={inputRef}
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') process('convert', undefined, 'sql', tableName);
                }}
                className="h-6 w-24 rounded-sm border border-hairline bg-elevated px-2 text-xs text-ink focus-visible:outline-accent"
                aria-label="SQL table name"
              />
            </label>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Play className="h-3 w-3" aria-hidden="true" />
            In {inputStats.lines} ln · {formatBytes(inputStats.bytes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {valid ? (
              <Check className="h-3 w-3 text-success" aria-hidden="true" />
            ) : (
              <span className="h-3 w-3 rounded-full border border-error" aria-hidden="true" />
            )}
            Out {outputStats.lines} ln · {formatBytes(outputStats.bytes)}
          </span>
          <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
