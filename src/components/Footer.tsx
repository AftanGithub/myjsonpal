import { Braces, Lock } from 'lucide-react';
import GitHubMark from './GitHubMark';
import { SITE } from '@/config/site';
import { TOOL_LIST } from '@/config/tools';

const RESOURCE_LINKS = [
  { href: '/fix-json', label: 'Fix Broken JSON' },
  { href: '/minify-json', label: 'Minify JSON' },
  { href: '/json-to-csv', label: 'JSON to CSV' },
  { href: '/json-to-yaml', label: 'JSON to YAML' },
  { href: '/json-to-typescript', label: 'JSON to TypeScript' },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="container-site py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="/" className="flex items-center gap-2" aria-label="MyJSONPal home">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-gradient-to-br from-mesh-blue via-mesh-violet to-mesh-magenta text-white">
                <Braces className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-ink">myjsonpal</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-body">
              {SITE.tagline}. Every tool formats, validates, repairs and converts data entirely in
              your browser — nothing is ever uploaded.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-mute">
              <Lock className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              100% in-browser & private · no accounts · no storage
            </p>
          </div>

          <div>
            <h3 className="eyebrow">Tools</h3>
            <ul className="mt-4 space-y-2.5">
              {TOOL_LIST.map((tool) => (
                <li key={tool.id}>
                  <a
                    href={tool.path}
                    className="text-sm text-body transition-colors hover:text-ink"
                  >
                    {tool.h1}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Resources</h3>
            <ul className="mt-4 space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-body transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-body transition-colors hover:text-ink"
                >
                  <GitHubMark className="h-3.5 w-3.5" />
                  Open source on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mute">© 2026 MyJSONPal · myjsonpal.com</p>
          <p className="text-xs text-mute">
            Built with Astro · Runs entirely in your browser · Fast & free forever
          </p>
        </div>
      </div>
    </footer>
  );
}
