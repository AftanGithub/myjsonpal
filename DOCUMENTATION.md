# MyJSONPal — Project Documentation

> The Privacy-First, In-Browser JSON & Data Studio

## What it is

**MyJSONPal** is a free, browser-based developer tool suite for working with JSON and related
data formats. It is a single-page "studio" that lets developers format, validate, auto-repair,
minify, and convert JSON — plus generate TypeScript types and Zod schemas — without ever
uploading their data.

Everything runs **100% in the browser** through JavaScript and Web Workers. There are no
application servers, no accounts, no sign-ups, and no usage quotas. Input, intermediate, and
output data never leave the user's device.

The site is built with **Astro + React** and deployed as static assets to Cloudflare Pages.

## Core principles

1. **Privacy by design** — All processing is client-side. JSON content is never transmitted,
   logged, or stored. Drag-and-dropped files are read directly by the browser and never
   uploaded. Theme preference is the only thing persisted (in `localStorage`).
2. **Speed** — Heavy processing runs in a dedicated **Web Worker**, so multi-megabyte documents
   are handled without freezing the page or blocking the editor.
3. **Free forever** — No registration, no limits. Supported (optionally) by unobtrusive ads.
4. **Offline-capable** — Once the page loads, the tools are fully self-contained and work with
   no internet connection.

## Features

### The unified editor workspace

Every tool page shares one `EditorWorkspace` component (`src/components/EditorWorkspace.tsx`)
with a three-column layout: an **input editor**, a **middle action bar**, and an **output editor**
(or tree view). Shared capabilities include:

- **CodeMirror 6 editors** with syntax highlighting, line numbers, a fold gutter, a lint gutter,
  bracket matching, active-line highlighting, undo/redo history, and Tab-based indentation.
- **Format** — pretty-print JSON with two-space indentation, with simultaneous inline validation.
- **Minify** — strip all insignificant whitespace; the status bar reports exact lines/bytes and
  characters saved.
- **Auto-Fix** — the "Magic Auto-Repair Engine" repairs broken JSON (see below) and reports a
  list of every change it made.
- **Convert** — transform the document between JSON, CSV, YAML, TypeScript interfaces, Zod
  schemas, and SQL `INSERT` statements via an output-format dropdown.
- **Swap** — flip the direction of reversible conversions (JSON ⇄ CSV, JSON ⇄ YAML) instantly.
- **Tree view** — render valid JSON as a collapsible, syntax-colored tree with inline counts
  (capped at 400 keys per node for performance).
- **Paste / Sample / Clear / Copy / Download** — clipboard read/write, load the built-in sample,
  clear both panes, copy the output, and download it with the correct file extension.
- **Drag & drop** — drop a `.json`, `.csv`, or `.yaml` file anywhere on the input pane.
- **Validation with line/column errors** — syntax problems are flagged inline by the CodeMirror
  linter, and the status bar pinpoints the failing line and column.
- **Size statistics** — live line and byte counts for both input and output.
- **Light/dark theme** toggle, sticky nav with a "100% Client-Side" trust badge, and a copy-link
  share button.

### Tools (routes)

| Tool | Path | What it does |
|---|---|---|
| **JSON Formatter & Validator** (home) | `/` | Pretty-print, validate, auto-repair, and convert JSON. The entry point to the whole studio. |
| **JSON → CSV** | `/json-to-csv` | Turn arrays of objects into RFC 4180-compliant CSV, auto-generating the header row from the union of keys. Nested objects are serialized as compact JSON strings inside cells. |
| **CSV → JSON** | `/csv-to-json` | Parse CSV (headers become keys, rows become records) with support for quoted fields, embedded commas/newlines, escaped quotes, and CRLF line endings. Numbers/booleans are typed automatically; quoted cells stay strings. |
| **JSON → YAML** | `/json-to-yaml` | Emit clean, YAML 1.2-compliant YAML (block sequences/mappings, safe automatic quoting) for Docker Compose, Kubernetes, OpenAPI, and CI configs. |
| **YAML → JSON** | `/yaml-to-json` | Parse YAML into formatted JSON with correct scalar typing and line/column error reporting. |
| **JSON → TypeScript** | `/json-to-typescript` | Generate strongly-typed TS interfaces (PascalCase names, `[]` for arrays, type aliases for primitives) from JSON samples. |
| **JSON → Zod Schema** | `/json-to-zod` | Generate nested `z.object()` / `z.array()` / `z.unknown()` schemas plus a `z.infer` type export, ready to paste into a Zod v3/v4 project. |
| **JSON Minifier** | `/minify-json` | Compact JSON for production payloads, localStorage, and cache manifests; shows bytes/percentage saved. |
| **Fix Broken JSON** | `/fix-json` | Dedicated entry point for the Magic Auto-Repair Engine. |

There is no separate page for **JSON → SQL**, but the SQL conversion (with a configurable table
name) is available from the output-format dropdown on any JSON tool.

### The Magic Auto-Repair Engine

`src/utils/jsonFixer.ts` implements a pure, regex-based, conservative repair engine that fixes
the most common "dirty JSON" mistakes in a single pass and reports exactly what it changed:

- **Trailing commas** before `}` / `]`.
- **Single-quoted strings** converted to proper double-quoted JSON strings.
- **Unquoted object keys** (e.g. `{name: "Ada"}` → `{"name": "Ada"}`).
- **Comments** — `//` and `#` line comments plus `/* ... */` block comments.
- **Python / JS literals** — `True`/`False` → `true`/`false`, and `None`/`Null`/`Undefined`/
  `NaN`/`Infinity` → `null`.
- **Normalization** — UTF-8 BOM stripping and CRLF → LF line-ending normalization.

Anything the engine cannot infer is surfaced to the strict validator, which points to the exact
line and column still needing attention.

## How it works

- **Stack:** Astro 7 (SSG) with React 19 islands, CodeMirror 6 for the editors, the `yaml`
  package for YAML parsing/emitting, Tailwind CSS v4 for styling, `lucide-react` for icons,
  and TypeScript throughout.
- **Worker architecture:** `src/utils/workerClient.ts` posts processing tasks to a Web Worker
  (`src/utils/worker.ts`) that runs `src/utils/jsonProcessor.ts` off the main thread. If Workers
  are unavailable, it falls back to dynamically importing and running the same processor on the
  main thread — keeping the heavy processor out of the initial bundle.
- **Conversion logic:** `src/utils/jsonProcessor.ts` contains all converters (CSV parse/emit,
  YAML, TypeScript interface generator, Zod schema generator, SQL statement generator,
  format/minify) as pure functions over a single `TaskInput`/`TaskResult` contract.
- **SEO:** Astro pages are pre-rendered with per-tool metadata, keywords, FAQ content, and an
  intro/how-to section (`src/config/tools.ts` defines all nine tools). A generated `sitemap.xml`
  covers the site.
- **Deployment:** `npm run deploy` builds the site and publishes `dist/` to Cloudflare Pages via
  Wrangler (`myjsonpal` project, `master` branch).

## Problems it solves

1. **Sensitive data leaking to third-party servers.** Most online JSON tools upload your payload
   to a server you don't control. MyJSONPal guarantees zero transmission — ideal for credentials,
   internal API responses, and private configs.
2. **The "Unexpected token" frustration.** Broken JSON (trailing commas, single quotes, unquoted
   keys, Python literals, comments) is auto-repaired in one click instead of being debugged by
   hand.
3. **Format conversion drudgery.** JSON ⇄ CSV ⇄ YAML conversions that normally require installing
   CLIs or scripted parsers happen instantly, with edge cases (quoting, headers, nested values,
   type coercion) handled correctly.
4. **Hand-writing TypeScript types and Zod schemas.** Generating interfaces and validation
   schemas from API responses is error-prone and tedious; both are produced automatically and
   stay in sync with the data.
5. **Frozen tabs on large payloads.** Web Workers keep the UI responsive even for multi-megabyte
   documents, which naive in-page `JSON.parse` would block.
6. **Bloated API payloads.** The minifier cuts pretty-printed JSON by 60–80% and reports the
   exact savings, reducing bandwidth and latency.
7. **Account/registration friction and quotas.** Many tools force sign-up or limit usage;
   MyJSONPal is free, unlimited, and anonymous.
8. **Tool fragmentation.** Juggling half a dozen tabs for formatting, validation, conversion, and
   type generation is replaced by a single consistent workspace that can also flip conversion
   direction with one click.

## Site pages

| Page | Route |
|---|---|
| JSON Formatter & Validator | `/` |
| JSON → CSV | `/json-to-csv` |
| CSV → JSON | `/csv-to-json` |
| JSON → YAML | `/json-to-yaml` |
| YAML → JSON | `/yaml-to-json` |
| JSON → TypeScript | `/json-to-typescript` |
| JSON → Zod Schema | `/json-to-zod` |
| JSON Minifier | `/minify-json` |
| Fix Broken JSON | `/fix-json` |
| About | `/about` |
| Contact | `/contact` |
| Privacy Policy | `/privacy-policy` |
| Terms & Conditions | `/terms` |
| 404 | `/404` |
| 500 | `/500` |
| Sitemap | `/sitemap.xml` |

## Development

```sh
npm install        # install dependencies
npm run dev        # start the dev server (local) — see AGENTS.md for background mode
npm run check      # run astro check (type/lint verification)
npm run build      # build the production site to ./dist/
npm run deploy     # build + publish to Cloudflare Pages via Wrangler
```
