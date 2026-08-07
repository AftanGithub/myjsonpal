import type { APIRoute } from 'astro';
import { SITE } from '@/config/site';
import { TOOLS } from '@/config/tools';

interface SitemapEntry {
  path: string;
  priority: number;
  changefreq: string;
}

const STATIC_PAGES: SitemapEntry[] = [
  { path: '/about', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact', priority: 0.6, changefreq: 'monthly' },
  { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const base = SITE.url.replace(/\/+$/, '');

  const entries: SitemapEntry[] = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    ...Object.values(TOOLS)
      .filter((tool) => tool.path !== '/')
      .map(
        (tool): SitemapEntry => ({
          path: tool.path,
          priority: 0.9,
          changefreq: 'weekly',
        }),
      ),
    ...STATIC_PAGES,
  ];

  const urls = entries
    .map((entry) => {
      const loc = `${base}${entry.path === '/' ? '/' : `${entry.path.replace(/\/+$/, '')}/`}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
