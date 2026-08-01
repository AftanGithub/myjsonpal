import { ChevronDown, Cpu, Lock, UserX, Zap } from 'lucide-react';
import type { ToolConfig } from '@/config/tools';
import { TOOL_LIST } from '@/config/tools';

const TRUST_FEATURES = [
  {
    icon: Lock,
    title: 'Privacy-first, by design',
    body: 'All parsing, validation and conversion runs in your browser. Your data is never sent, logged, cached or sold — close the tab and it is gone.',
  },
  {
    icon: Cpu,
    title: 'Fast, even on huge files',
    body: 'Heavy processing is offloaded to a Web Worker, so multi-megabyte documents are handled without freezing the interface.',
  },
  {
    icon: UserX,
    title: 'No accounts, no limits',
    body: 'There is nothing to sign up for and no usage quota. Paste, format, convert and download as often as you like.',
  },
];

export default function SEOContent({ tool }: { tool: ToolConfig }) {
  const related = TOOL_LIST.filter((t) => t.id !== tool.id);

  return (
    <section aria-label="About this tool" className="container-site py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-5 text-[15px] leading-relaxed text-body">
          {tool.intro.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {tool.codeExample && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {tool.codeExample.caption}
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-md border border-hairline bg-elevated p-4 font-mono text-[13px] leading-relaxed text-body">
              <code>{tool.codeExample.code}</code>
            </pre>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-ink">{tool.howToTitle}</h2>
          <ol className="mt-4 space-y-3">
            {tool.howTo.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hairline bg-elevated font-mono text-xs font-medium text-ink">
                  {i + 1}
                </span>
                <span className="text-[15px] leading-relaxed text-body">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Why MyJSONPal is different
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {TRUST_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-md border border-hairline bg-elevated p-4"
              >
                <feature.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-medium text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-body">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-hairline border-t border-hairline">
            {tool.faqs.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="min-w-0 flex-1 text-[15px] font-medium text-ink">{faq.q}</h3>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-mute transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-body">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-md border border-hairline bg-elevated/60 p-5">
          <h2 className="eyebrow">More free tools</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((t) => (
              <li key={t.id} className="min-w-0 max-w-full">
                <a
                  href={t.path}
                  title={t.h1}
                  className="chip w-full truncate transition-colors hover:border-accent hover:text-accent"
                >
                  <Zap className="h-3 w-3 text-accent" aria-hidden="true" />
                  {t.h1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
