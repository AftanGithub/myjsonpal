import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const MAX_KEYS = 400;

function Primitive({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="font-mono text-[13px] text-faint">null</span>;
  }
  switch (typeof value) {
    case 'string':
      return (
        <span className="break-all font-mono text-[13px] text-success">
          &quot;{String(value)}&quot;
        </span>
      );
    case 'number':
      return <span className="font-mono text-[13px] text-syn-number">{String(value)}</span>;
    case 'boolean':
      return <span className="font-mono text-[13px] text-warning">{String(value)}</span>;
    default:
      return <span className="font-mono text-[13px] text-faint">{String(value)}</span>;
  }
}

function Node({
  name,
  value,
  depth,
}: {
  name: string;
  value: unknown;
  depth: number;
}) {
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object' && !isArray;
  const expandable = isArray || isObject;
  const [open, setOpen] = useState(depth < 2);
  const pad = { paddingLeft: `${8 + depth * 14}px` };

  if (!expandable) {
    return (
      <div
        className="flex items-baseline gap-1.5 rounded-sm px-2 py-[2px] hover:bg-elevated-2"
        style={pad}
      >
        <span className="text-[13px] text-body">{name}:</span>
        <Primitive value={value} />
      </div>
    );
  }

  const entries: [string, unknown][] = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, unknown>);
  const shown = entries.slice(0, MAX_KEYS);
  const truncated = entries.length > MAX_KEYS;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-sm px-2 py-[2px] text-left hover:bg-elevated-2"
        style={pad}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-mute" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-mute" aria-hidden="true" />
        )}
        <span className="text-[13px] font-medium text-ink">{name}</span>
        <span className="font-mono text-[11px] text-faint">
          {isArray ? `Array(${entries.length})` : 'Object'}
        </span>
      </button>
      {open && (
        <div>
          {shown.map(([k, v]) => (
            <Node key={k} name={k} value={v} depth={depth + 1} />
          ))}
          {truncated && (
            <div
              className="px-2 py-1 font-mono text-[11px] text-faint"
              style={{ paddingLeft: `${8 + (depth + 1) * 14}px` }}
            >
              … {entries.length - MAX_KEYS} more items
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JsonTree({ data }: { data: unknown }) {
  return (
    <div className="h-full overflow-auto p-2">
      <Node name="root" value={data} depth={0} />
    </div>
  );
}
