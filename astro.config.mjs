// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mcp from 'astro-mcp';

// https://astro.build/config
export default defineConfig({
  site: 'https://myjsonpal.com',
  trailingSlash: 'always',
  integrations: [react(), mcp()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
