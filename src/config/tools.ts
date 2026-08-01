import type { OutputFormat } from '@/utils/jsonProcessor';

export interface Faq {
  q: string;
  a: string;
}

export interface ToolConfig {
  id: string;
  path: string;
  eyebrow: string;
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
  defaultFormat: OutputFormat;
  defaultAction: 'format' | 'minify' | 'fix';
  sample: string;
  fileName: string;
  intro: string[];
  howToTitle: string;
  howTo: string[];
  codeExample?: { caption: string; code: string };
  faqs: Faq[];
}

/* ------------------------------------------------------------------ */
/*  HOME — Online JSON Formatter & Validator                           */
/* ------------------------------------------------------------------ */

const HOME_TOOL: ToolConfig = {
  id: 'formatter',
  path: '/',
  eyebrow: 'Free Developer Tool',
  h1: 'Online JSON Formatter & Validator',
  tagline:
    'Prettify, validate and auto-repair JSON in your browser. Zero uploads, zero servers — every byte stays on your machine.',
  metaTitle: 'Online JSON Formatter & Validator — Free, 100% Client-Side | MyJSONPal',
  metaDescription:
    'Format, validate and auto-repair JSON online for free. 100% in-browser processing — nothing is ever uploaded. Prettify, minify, fix syntax errors and convert JSON to CSV, YAML, TypeScript or SQL.',
  targetKeyword: 'Online JSON Formatter & Validator',
  defaultFormat: 'json',
  defaultAction: 'format',
  fileName: 'formatted',
  sample:
    '{"user":{"id":42,"name":"Ada Lovelace","role":"Engineer","email":"ada@example.com","active":true,"projects":[{"name":"Analytical Engine","stars":1240,"tags":["hardware","math"],"private":false},{"name":"Notes on F","stars":307,"tags":["paper"],"private":true}],"preferences":{"theme":"dark","notifications":false}},"meta":{"generated":1700000000000,"version":"1.0.0"}}',
  intro: [
    'MyJSONPal is a free online JSON formatter and validator built for developers who care about speed and privacy. Paste any JSON document into the editor and get a cleanly indented, color-highlighted result in milliseconds. Because everything runs in your browser through a Web Worker, your data is never transmitted, logged, or stored anywhere.',
    'Beyond pretty-printing, the workspace doubles as a strict validator: syntax errors are highlighted inline with line and column positions, and the Magic Auto-Repair engine can fix common mistakes such as trailing commas, single quotes, unquoted keys, and Python-style True/False/None literals with a single click.',
    'Once your JSON is clean you can minify it for production payloads, explore it as a collapsible tree, copy it to the clipboard, or convert it to CSV, YAML, TypeScript interfaces, or SQL INSERT statements — all offline.',
  ],
  howToTitle: 'How to format and validate JSON',
  howTo: [
    'Paste your JSON into the left editor, or drag and drop a .json file anywhere on the input pane.',
    'Click Format (or press the switch to JSON) to pretty-print with two-space indentation and inline validation.',
    'If the validator reports errors, press Auto-Fix JSON to repair trailing commas, single quotes, and other common mistakes automatically.',
    'Switch to Tree View to explore nested structures, then Copy to Clipboard or Download the result.',
    'Use the format dropdown to convert your document to CSV, YAML, TypeScript or SQL in one click.',
  ],
  faqs: [
    {
      q: 'Is my JSON uploaded to a server?',
      a: 'Never. MyJSONPal processes everything locally in your browser using JavaScript and Web Workers. There are no API calls, no analytics beacons, and no server-side storage — your data never leaves your device.',
    },
    {
      q: 'What does "format" do to my JSON?',
      a: 'Formatting re-parses your JSON and re-emits it with two-space indentation, consistent key ordering, and proper string escaping. It also validates the document at the same time and flags any syntax errors.',
    },
    {
      q: 'Can I use it offline?',
      a: 'Yes. Once the page is loaded, the tool is fully self-contained. You can paste data, format it, convert it, and download the results with no internet connection at all.',
    },
    {
      q: 'Is there a limit on file size?',
      a: 'Because processing happens in your browser, the practical limit depends on your machine. Large payloads are handled by a dedicated Web Worker so the interface stays responsive.',
    },
    {
      q: 'Is MyJSONPal really free?',
      a: 'Yes — free forever, with no accounts and no usage quotas. The tool is supported by unobtrusive advertising and a GitHub-sponsored open-source project.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  JSON → CSV                                                         */
/* ------------------------------------------------------------------ */

const JSON_TO_CSV: ToolConfig = {
  id: 'json-to-csv',
  path: '/json-to-csv',
  eyebrow: 'Data Converter',
  h1: 'Convert JSON to CSV Online Free',
  tagline:
    'Turn arrays of JSON objects into clean, spreadsheet-ready CSV in one click — fully in your browser.',
  metaTitle: 'Convert JSON to CSV Online Free — No Uploads | MyJSONPal',
  metaDescription:
    'Convert JSON to CSV online for free. Paste an array of objects, get properly quoted comma-separated values instantly. 100% client-side, no uploads, Excel and Google Sheets ready.',
  targetKeyword: 'Convert JSON to CSV Online Free',
  defaultFormat: 'csv',
  defaultAction: 'format',
  fileName: 'data',
  sample:
    '[{"name":"Ada Lovelace","role":"Engineer","email":"ada@example.com","score":42.5,"active":true},{"name":"Alan Turing","role":"Researcher","email":"alan@example.com","score":98,"active":true},{"name":"Grace Hopper","role":"Admiral","email":"grace@example.com","score":88.2,"active":false}]',
  intro: [
    'Converting JSON to CSV is one of the most common data-prep chores, and MyJSONPal makes it instant and private. Paste an array of objects and the converter flattens every record into a row, generating a header row from the union of all keys. No server round-trip — the conversion runs locally, so sensitive datasets stay on your machine.',
    'Values are quoted correctly per the CSV standard: fields containing commas, quotes, or line breaks are wrapped in double quotes with inner quotes escaped, so the output opens cleanly in Excel, Google Sheets, and every modern data tool. Nested objects are encoded as compact JSON strings inside their cells, keeping the file lossless.',
    'Paste raw JSON, click the CSV format, and copy or download your result. For arrays of primitives the converter produces a single-column table; a single object becomes a one-row table.',
  ],
  howToTitle: 'How to convert JSON to CSV',
  howTo: [
    'Paste an array of JSON objects into the input editor, or drag and drop a .json file.',
    'Select CSV from the format dropdown — the conversion happens instantly.',
    'Preview the comma-separated output with the column header auto-generated from your keys.',
    'Copy the CSV to your clipboard or download it as a .csv file.',
    'Open the file in Excel, Google Sheets, or your favorite data tool.',
  ],
  faqs: [
    {
      q: 'Does the CSV include a header row?',
      a: 'Yes. The header is built from the union of every key across all objects, so columns are preserved even when some records are missing fields.',
    },
    {
      q: 'How are nested objects converted?',
      a: 'Nested objects and arrays are serialized as compact JSON strings inside their cell. This keeps the data lossless and avoids flattening ambiguity.',
    },
    {
      q: 'Will special characters break the CSV?',
      a: 'No. Fields containing commas, double quotes, or newlines are wrapped in quotes and inner quotes are doubled, following the standard RFC 4180 conventions that Excel and Sheets expect.',
    },
    {
      q: 'Can I convert a large JSON file?',
      a: 'Yes — conversion runs in a Web Worker so large payloads are processed without freezing the page. The limit is whatever your browser can comfortably parse.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  JSON → YAML                                                        */
/* ------------------------------------------------------------------ */

const JSON_TO_YAML: ToolConfig = {
  id: 'json-to-yaml',
  path: '/json-to-yaml',
  eyebrow: 'Data Converter',
  h1: 'JSON to YAML Converter Client Side',
  tagline:
    'Translate any JSON document into clean, human-readable YAML — instantly and entirely in your browser.',
  metaTitle: 'JSON to YAML Converter Client Side — Private | MyJSONPal',
  metaDescription:
    'Convert JSON to YAML online with no uploads. Paste JSON, get idiomatic YAML with proper indentation, quoting, and flow-style collections. 100% client-side and free.',
  targetKeyword: 'JSON to YAML Converter Client Side',
  defaultFormat: 'yaml',
  defaultAction: 'format',
  fileName: 'output',
  sample:
    '{"service":"api-gateway","version":"2.1.0","environments":{"production":{"region":"us-east-1","instances":3,"autoscale":true},"staging":{"region":"eu-west-2","instances":1,"autoscale":false}},"timeout":30,"retries":[1,2,3],"headers":{"Content-Type":"application/json"}}',
  intro: [
    'YAML is the lingua franca of configuration files, and MyJSONPal converts JSON to YAML with an indentation-perfect, standards-compliant emitter. Paste any JSON document and get back clean YAML that uses block sequences for arrays, block mappings for objects, and safe automatic quoting where needed.',
    'Because the converter runs entirely client-side, you can work with private credentials, secrets, and internal configs without ever uploading them. The output is generated locally by a battle-tested YAML engine, so quoting and escaping edge cases — numbers that look like strings, reserved words, multi-line values — are handled correctly.',
    'Whether you are migrating JSON configs to Kubernetes manifests, Docker Compose files, or CI pipelines, this converter produces YAML you can paste directly into your projects.',
  ],
  howToTitle: 'How to convert JSON to YAML',
  howTo: [
    'Paste your JSON into the input editor or drop a file onto the pane.',
    'Choose YAML from the format dropdown — the document is converted immediately.',
    'Review the indented YAML output with syntax highlighting.',
    'Copy to clipboard or download as a .yaml file.',
    'Use it in Docker Compose, GitHub Actions, Kubernetes, or any config pipeline.',
  ],
  faqs: [
    {
      q: 'Is the generated YAML safe to quote correctly?',
      a: 'Yes. The emitter follows YAML 1.2 rules: strings that could be misinterpreted as numbers, booleans, or dates are quoted automatically, so your values round-trip without surprises.',
    },
    {
      q: 'Does it handle deep nesting?',
      a: 'Absolutely. The emitter handles arbitrarily nested objects and arrays with correct block indentation, matching how most linters and parsers expect YAML to be written.',
    },
    {
      q: 'Can I convert it back?',
      a: 'Of course. Open the YAML converter page, paste the YAML as input — most YAML is also valid JSON-friendly input — or use the JSON format option to regenerate the original document.',
    },
    {
      q: 'Is my configuration data private?',
      a: 'Yes. The entire conversion happens in your browser. Your configs and secrets never touch a server or a network request.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  JSON → TypeScript                                                   */
/* ------------------------------------------------------------------ */

const JSON_TO_TYPESCRIPT: ToolConfig = {
  id: 'json-to-typescript',
  path: '/json-to-typescript',
  eyebrow: 'Type Generator',
  h1: 'Convert JSON to TypeScript Interfaces',
  tagline:
    'Generate typed TypeScript interfaces from your JSON in one click — accurate, readable, and fully client-side.',
  metaTitle: 'Convert JSON to TypeScript Interfaces Online — Free | MyJSONPal',
  metaDescription:
    'Generate TypeScript interfaces from JSON instantly. Paste JSON and get strongly-typed interfaces with correct nesting, arrays, and optional-style types. 100% in-browser and free.',
  targetKeyword: 'Convert JSON to TypeScript Interfaces',
  defaultFormat: 'typescript',
  defaultAction: 'format',
  fileName: 'types',
  sample:
    '{"id":1,"title":"Getting Started with Astro","published":true,"author":{"name":"Ada Lovelace","avatarUrl":"https://example.com/ada.png"},"tags":["astro","ssg","web"],"metadata":{"views":1200,"likes":85},"chapters":[{"slug":"intro","minutes":12},{"slug":"islands","minutes":28}]}',
  intro: [
    'Stop hand-writing type definitions. MyJSONPal converts any JSON document into clean, strongly-typed TypeScript interfaces: objects become interfaces, arrays become typed lists, and nested structures are extracted into named, reusable interface types.',
    'The generator is smart about naming — keys are converted to PascalCase interface names so you get meaningful, human-readable types like Chapter or AuthorMetadata instead of anonymous ObjectN literals. Root-level primitives and arrays are emitted as a type alias, and consistent types keep your API contracts aligned with your runtime data.',
    'Because the generation runs entirely in your browser, you can convert internal API responses and private schemas without a single upload. The output is ready to paste into your tsconfig-based project.',
  ],
  howToTitle: 'How to generate TypeScript types',
  howTo: [
    'Paste a JSON sample of your API response or data shape.',
    'Select TypeScript from the format dropdown.',
    'Copy the generated interfaces to your clipboard.',
    'Paste them into a .ts file in your project.',
    'Iterate: paste a new sample whenever the API shape changes.',
  ],
  faqs: [
    {
      q: 'How are arrays typed?',
      a: 'Arrays of objects become a named interface with a [] suffix (for example Chapter[]). Arrays of primitives become string[], number[], and so on.',
    },
    {
      q: 'What about null values?',
      a: 'Explicit null fields are typed as null. If a field can vary, the generated type reflects what is present in your sample; you can refine it with optional markers or unions afterward.',
    },
    {
      q: 'Are the generated interfaces valid TypeScript?',
      a: 'Yes. The output uses standard interface and type-alias syntax that compiles under any modern TypeScript configuration.',
    },
    {
      q: 'Does it work for large documents?',
      a: 'Yes. Generation runs in a Web Worker, so even big payloads produce types quickly without blocking the page.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Minify JSON                                                        */
/* ------------------------------------------------------------------ */

const MINIFY_JSON: ToolConfig = {
  id: 'minify-json',
  path: '/minify-json',
  eyebrow: 'Size Optimizer',
  h1: 'JSON Minifier & Compressor',
  tagline:
    'Strip every unnecessary byte from your JSON for smaller payloads and faster APIs — entirely offline.',
  metaTitle: 'JSON Minifier & Compressor — Reduce Payload Size | MyJSONPal',
  metaDescription:
    'Minify JSON online to shrink API payloads and storage. Remove whitespace and comments for up to 80% smaller documents. 100% client-side, private, and free.',
  targetKeyword: 'JSON Minifier & Compressor',
  defaultFormat: 'minified',
  defaultAction: 'minify',
  fileName: 'minified',
  sample:
    '{\n  "event": "purchase",\n  "userId": "usr_8f2a91",\n  "items": [\n    { "sku": "SKU-2041", "qty": 2, "price": 19.99 },\n    { "sku": "SKU-7710", "qty": 1, "price": 49.5 }\n  ],\n  "total": 89.48,\n  "currency": "USD",\n  "timestamp": "2026-08-01T10:15:30Z"\n}',
  intro: [
    'Smaller JSON means faster websites, cheaper bandwidth, and snappier APIs. MyJSONPal\'s minifier removes every byte of unnecessary whitespace while keeping the document 100% valid, typically cutting payloads by 60–80% compared to pretty-printed JSON.',
    'The minified output is produced locally by a Web Worker, so huge documents compress instantly without freezing your tab — and your data never leaves your device. The status bar even shows you exactly how many characters you saved.',
    'Minified JSON is ideal for production API responses, localStorage, cache manifests, configuration embedded in code, and any place where bytes matter.',
  ],
  howToTitle: 'How to minify JSON',
  howTo: [
    'Paste your pretty-printed or raw JSON into the input editor.',
    'Click Minify (or select the Minified format).',
    'Watch the size counter to see characters and percentage saved.',
    'Copy the compact result or download it as a .min.json file.',
    'Drop the minified string into your API response or storage layer.',
  ],
  faqs: [
    {
      q: 'Will minification change my data?',
      a: 'No. Minification only removes insignificant whitespace and newlines. The resulting string parses to exactly the same data structure as the original.',
    },
    {
      q: 'How much smaller will my JSON get?',
      a: 'It depends on how it was formatted. Pretty-printed JSON typically shrinks 60–80%. The tool shows the exact character count and percentage saved.',
    },
    {
      q: 'Can it minify invalid JSON?',
      a: 'No — valid JSON is required. If your document has errors, run Auto-Fix first, or use the Fix JSON tool to repair it before minifying.',
    },
    {
      q: 'Is it safe for sensitive data?',
      a: 'Yes. Minification runs entirely in your browser; your data is never sent anywhere.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Fix JSON                                                           */
/* ------------------------------------------------------------------ */

const FIX_JSON: ToolConfig = {
  id: 'fix-json',
  path: '/fix-json',
  eyebrow: 'Repair Engine',
  h1: 'Repair Broken JSON Online',
  tagline:
    'The Magic Auto-Repair engine fixes trailing commas, single quotes, unquoted keys, and Python literals in one click.',
  metaTitle: 'Repair Broken JSON Online — Auto-Fix Syntax Errors | MyJSONPal',
  metaDescription:
    'Fix broken JSON automatically. Repair trailing commas, single quotes, unquoted keys, and Python True/False/None values online. 100% in-browser, private, and free.',
  targetKeyword: 'Repair Broken JSON Online',
  defaultFormat: 'json',
  defaultAction: 'fix',
  fileName: 'fixed',
  sample:
    '{\n  // user profile\n  name: \'Ada Lovelace\',\n  \'role\': "Engineer",\n  active: True,\n  score: 9.5,\n  tags: [\'math\', \'analytics\',],\n  projects: [\n    {title: \'Analytical Engine\', private: False},\n    {title: \'Notes\', tags: [],},\n  ],\n  notes: None,\n}',
  intro: [
    'Every developer has faced the dreaded "Unexpected token" error. MyJSONPal\'s Magic Auto-Repair engine fixes the most common JSON syntax mistakes automatically, so you spend your time on real work instead of debugging quotes.',
    'The repair engine handles trailing commas, single-quoted strings, unquoted object keys, comments, and Python-style True/False/None literals — transforming messy, dirty text into valid JSON in a single click. Because the entire fix runs locally in your browser, even confidential snippets are repaired in complete privacy.',
    'For everything the engine cannot infer, the strict validator pinpoints the exact line and column of the remaining error so you can finish the job by hand.',
  ],
  howToTitle: 'How to fix broken JSON',
  howTo: [
    'Paste your broken or dirty JSON into the input editor.',
    'Click Auto-Fix JSON.',
    'Review the repairs listed in the status bar (quotes, commas, keys, literals).',
    'If any errors remain, the validator highlights their exact position.',
    'Copy the repaired JSON or download it as a .json file.',
  ],
  codeExample: {
    caption: 'Common problems the repair engine solves',
    code:
      '// Before — full of common mistakes\n{ name: \'Ada\', active: True, tags: [\'math\', \'code\',], }\n\n// After — valid JSON\n{ "name": "Ada", "active": true, "tags": ["math", "code"] }',
  },
  faqs: [
    {
      q: 'Which errors can Auto-Fix repair?',
      a: 'Trailing commas, single-quoted strings, unquoted keys, line and block comments, and Python True/False/None literals. It also normalizes line endings and removes the UTF-8 BOM.',
    },
    {
      q: 'Can it fix everything?',
      a: 'Not every conceivable error — for example, it cannot guess missing braces. When something is unfixable, the validator points you to the exact line and column that still needs attention.',
    },
    {
      q: 'Will it change the meaning of my data?',
      a: 'Repairs are conservative. The engine only makes changes that are unambiguous (quoting, comma removal, literal casing), and it shows you exactly what it changed.',
    },
    {
      q: 'Is my data private when I fix it?',
      a: 'Fully. Auto-repair runs locally with regex logic in your browser — nothing is uploaded or stored.',
    },
  ],
};

export const TOOLS: Record<string, ToolConfig> = {
  [HOME_TOOL.id]: HOME_TOOL,
  [JSON_TO_CSV.id]: JSON_TO_CSV,
  [JSON_TO_YAML.id]: JSON_TO_YAML,
  [JSON_TO_TYPESCRIPT.id]: JSON_TO_TYPESCRIPT,
  [MINIFY_JSON.id]: MINIFY_JSON,
  [FIX_JSON.id]: FIX_JSON,
};

export const TOOL_LIST: ToolConfig[] = [
  HOME_TOOL,
  JSON_TO_CSV,
  JSON_TO_YAML,
  JSON_TO_TYPESCRIPT,
  MINIFY_JSON,
  FIX_JSON,
];
