import { useEffect, useState } from 'react';
import { Check, Lock, Menu, Moon, Share2, Sun, X } from 'lucide-react';
import GitHubMark from './GitHubMark';
import { SITE } from '@/config/site';
import logo from '@/assets/logo-mark.png';

interface NavbarProps {
  pathname: string;
}

const LINKS = [
  { href: '/', label: 'Formatter & Validator' },
  { href: '/json-to-csv', label: 'CSV Converter' },
  { href: '/json-to-yaml', label: 'YAML Converter' },
  { href: '/json-to-typescript', label: 'TypeScript Types' },
  { href: '/minify-json', label: 'Minifier' },
];

export default function Navbar({ pathname }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* noop */
    }
    setDark(next);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    } catch {
      /* noop */
    }
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <nav className="container-site flex h-14 items-center justify-between gap-4">
        <a href="/" className="flex shrink-0 items-center gap-2" aria-label="MyJSONPal home">
          <img src={logo.src} alt="" className="h-7 w-7" width={128} height={128} />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            myjson<span className="text-mute">pal</span>
          </span>
        </a>

        <div className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
                isActive(link.href)
                  ? 'font-medium text-ink'
                  : 'text-body hover:bg-elevated-2 hover:text-ink'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="chip hidden xl:inline-flex">
            <Lock className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            100% Client-Side
          </span>

          <button
            type="button"
            onClick={share}
            className="btn-icon hidden sm:inline-flex"
            aria-label="Copy link to this page"
            title="Share"
          >
            {shared ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon"
            aria-label="Developer on GitHub"
            title="GitHub"
          >
            <GitHubMark className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            className="btn-icon"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="btn-icon lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-canvas lg:hidden">
          <div className="container-site flex flex-col gap-1 py-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-elevated-2 font-medium text-ink'
                    : 'text-body hover:bg-elevated-2 hover:text-ink'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/fix-json"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-body hover:bg-elevated-2 hover:text-ink"
            >
              Repair Broken JSON
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
