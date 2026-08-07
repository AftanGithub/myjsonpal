import { ShieldCheck, SlidersHorizontal, Undo2 } from 'lucide-react';

interface SanitizerToolbarProps {
  enabled: boolean;
  onToggle: () => void;
  onManage: () => void;
}

export default function SanitizerToolbar({
  enabled,
  onToggle,
  onManage,
}: SanitizerToolbarProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        title="Auto-detect and replace sensitive values (API keys, tokens, PII) in the JSON output"
        className={`inline-flex h-8 select-none items-center gap-2 rounded-sm border px-2.5 text-xs font-medium transition-colors ${
          enabled
            ? 'border-accent bg-accent-soft text-accent-strong dark:text-accent'
            : 'border-hairline bg-elevated text-body hover:bg-elevated-2'
        }`}
      >
        <span
          aria-hidden="true"
          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
            enabled ? 'bg-accent' : 'bg-mute/40'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full bg-canvas shadow-sm transition-transform ${
              enabled ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </span>
        <ShieldCheck
          className={`h-3.5 w-3.5 ${enabled ? '' : 'text-mute'}`}
          aria-hidden="true"
        />
        <span>Auto-Sanitize</span>
      </button>

      <button
        type="button"
        onClick={onManage}
        title="Choose which keys are treated as sensitive and manage custom rules"
        className="btn-ghost h-8 gap-1.5 px-2.5 text-xs"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        Keys
      </button>
    </div>
  );
}

interface SanitizerBannerProps {
  count: number;
  onUndo: () => void;
}

export function SanitizerBanner({ count, onUndo }: SanitizerBannerProps) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-accent-soft/60 px-3 py-1.5 animate-toast-in"
    >
      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-accent-strong dark:text-accent">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">
          Sensitive data detected &amp; converted to sample values.
        </span>
        <span
          className="shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 font-mono text-[10px]"
          aria-label={`${count} values redacted`}
        >
          {count}
        </span>
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent-strong underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-accent"
      >
        <Undo2 className="h-3 w-3" aria-hidden="true" />
        Revert to Raw Paste
      </button>
    </div>
  );
}
