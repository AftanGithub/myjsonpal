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
  keywords: string[];
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
  h1: 'Online JSON Formatter, Validator & Auto-Repair Engine',
  tagline:
    'Prettify, validate and auto-repair JSON in your browser. Zero uploads, zero servers — every byte stays on your machine.',
  metaTitle: 'Online JSON Formatter & Validator | Auto-Fix JSON | MyJSONPal',
  metaDescription:
    'Format, validate, and auto-repair broken JSON instantly in your browser. 100% private client-side processing. Free developer JSON studio.',
  targetKeyword: 'Online JSON Formatter & Validator',
  keywords: [
    'online json formatter',
    'json validator',
    'json formatter and validator',
    'json beautifier online',
    'prettify json online',
    'clean json format',
    'json viewer tree mode',
    'in browser json formatter',
    'validate json online private',
    'json syntax error checker',
    'json format checker free',
    'client side json viewer',
  ],
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
      a: 'Yes — free forever, with no accounts and no usage quotas. The tool is supported by unobtrusive advertising, so it stays free for everyone.',
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
  h1: 'JSON to CSV Converter',
  tagline:
    'Turn arrays of JSON objects into clean, spreadsheet-ready CSV in one click — fully in your browser.',
  metaTitle: 'Convert JSON to CSV Online Free | MyJSONPal',
  metaDescription:
    'Convert JSON arrays to tabular CSV files for Excel & Google Sheets. RFC 4180 compliant with 100% client-side data privacy.',
  targetKeyword: 'Convert JSON to CSV Online Free',
  keywords: [
    'json to csv',
    'convert json to csv',
    'json array to csv converter',
    'json to excel csv converter',
    'flatten nested json to csv',
    'export json to csv online',
    'rfc 4180 json to csv',
    'convert api response json to excel sheet',
    'json stringify to csv table',
    'online json to spreadsheet',
  ],
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
  h1: 'JSON to YAML Converter',
  tagline:
    'Translate any JSON document into clean, human-readable YAML — instantly and entirely in your browser.',
  metaTitle: 'JSON to YAML Converter Online | MyJSONPal',
  metaDescription:
    'Convert JSON payloads into clean YAML configuration files. Ideal for Docker, Kubernetes, and OpenAPI specs.',
  targetKeyword: 'JSON to YAML Converter',
  keywords: [
    'json to yaml',
    'convert json to yaml',
    'json to yaml converter online',
    'json to yaml docker compose',
    'convert json file to yaml spec',
    'json to openapi yaml',
    'transform json payload to yaml format',
    'json to yaml config generator',
  ],
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
  metaTitle: 'JSON to TypeScript Interface Generator | MyJSONPal',
  metaDescription:
    'Generate strongly-typed TypeScript interfaces from raw JSON payloads. Client-side, instant, and privacy-first.',
  targetKeyword: 'Convert JSON to TypeScript Interfaces',
  keywords: [
    'json to typescript',
    'json to ts interface',
    'convert json to typescript interface',
    'json to typescript type generator',
    'json to ts type online',
    'generate typescript types from api response',
    'json to ts interface generator',
    'nested json to typescript interface',
    'json to typescript online free',
    'typescript type infer json payload',
  ],
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
/*  CSV → JSON                                                         */
/* ------------------------------------------------------------------ */

const CSV_TO_JSON: ToolConfig = {
  id: 'csv-to-json',
  path: '/csv-to-json',
  eyebrow: 'Data Converter',
  h1: 'CSV to JSON Converter',
  tagline:
    'Turn CSV spreadsheets into clean JSON objects in one click — headers become keys, rows become records. Fully in your browser.',
  metaTitle: 'Convert CSV to JSON Client-Side | MyJSONPal',
  metaDescription:
    'Parse CSV text or upload .csv files to output formatted JSON arrays. Preserves numbers, booleans, and quoted string fields.',
  targetKeyword: 'Convert CSV to JSON Client-Side',
  keywords: [
    'csv to json',
    'convert csv to json',
    'csv to json converter online',
    'csv file to json array',
    'convert csv to json with headers',
    'csv to json array of objects',
    'client side csv to json parser',
    'parse csv to json payload',
    'convert excel csv to json object',
    'csv comma separated to json',
  ],
  defaultFormat: 'csvjson',
  defaultAction: 'format',
  fileName: 'data',
  sample:
    'name,email,age,active,score\nAda Lovelace,ada@example.com,42,true,98.5\n"Turing, Alan",alan@example.com,28,false,88\nGrace Hopper,"grace,hopper@example.com",35,true,91',
  intro: [
    'Need JSON for an API, script, or database import? MyJSONPal converts CSV to JSON in a single click. Paste raw CSV or drop in a .csv file, and the converter reads the first row as headers and turns every subsequent row into an object — keys from the headers, values from the cells — wrapped in a clean JSON array.',
    'The parser is built for real-world CSV: fields wrapped in double quotes, commas and line breaks inside quoted values, escaped quotes (""), and CRLF line endings. Cells that look like numbers or booleans are converted automatically (42 → 42, true → true), while quoted cells stay strings so you keep full control over your data.',
    'Everything runs locally in your browser through a Web Worker — no uploads, no servers. Paste, convert, copy or download your JSON, and get back to shipping.',
  ],
  howToTitle: 'How to convert CSV to JSON',
  howTo: [
    'Paste CSV text into the input editor, or drag and drop a .csv file anywhere on the input pane.',
    'Select CSV → JSON from the format dropdown — the conversion happens instantly.',
    'Verify the first row is treated as the header (keys) and each row becomes an object.',
    'Copy the JSON array to your clipboard or download it as a .json file.',
    'Use the result in an API payload, database import, or anywhere JSON is expected.',
  ],
  faqs: [
    {
      q: 'How are headers handled?',
      a: 'The first row of your CSV becomes the object keys. Every following row is mapped into an object using those keys, and the full result is a JSON array.',
    },
    {
      q: 'Are quoted fields and commas supported?',
      a: 'Yes. Fields wrapped in double quotes may contain commas, newlines, and escaped quotes (""). Quoted fields are always kept as strings, so values like "00123" are not coerced.',
    },
    {
      q: 'How are numbers and booleans detected?',
      a: 'Unquoted cells that look like numbers become numbers, and true/false become booleans. Empty cells become null. Quote a value to force it to stay a string.',
    },
    {
      q: 'Can I convert a large CSV file?',
      a: 'Yes. Parsing runs in a Web Worker, so large files convert without freezing the page — the limit is whatever your browser can handle.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  YAML → JSON                                                        */
/* ------------------------------------------------------------------ */

const YAML_TO_JSON: ToolConfig = {
  id: 'yaml-to-json',
  path: '/yaml-to-json',
  eyebrow: 'Data Converter',
  h1: 'YAML to JSON Converter',
  tagline:
    'Parse any YAML document and get clean, indented JSON in milliseconds — nested mappings, lists, and primitives handled automatically.',
  metaTitle: 'In-Browser YAML to JSON Converter | MyJSONPal',
  metaDescription:
    'Convert YAML configs back into valid, formatted JSON. 100% local browser execution with syntax error detection.',
  targetKeyword: 'YAML to JSON Converter',
  keywords: [
    'yaml to json',
    'convert yaml to json',
    'yaml to json converter online',
    'convert kubernetes yaml to json',
    'yaml to json parser client side',
    'parse yaml file to json array',
    'docker yaml to json object',
    'yaml config to formatted json',
  ],
  defaultFormat: 'yamljson',
  defaultAction: 'format',
  fileName: 'json',
  sample:
    'service: api-gateway\nversion: "2.1.0"\nenvironments:\n  production:\n    region: us-east-1\n    instances: 3\n    autoscale: true\n  staging:\n    region: eu-west-2\n    instances: 1\n    autoscale: false\ntimeout: 30\nretries:\n  - 1\n  - 2\n  - 3\nheaders:\n  Content-Type: application/json',
  intro: [
    'YAML is everywhere — config files, CI pipelines, Kubernetes manifests — but many tools expect JSON. MyJSONPal converts YAML to JSON in milliseconds: paste your YAML and get a cleanly indented, valid JSON document with every nested mapping, list, and scalar preserved.',
    'The parser follows the YAML 1.2 spec: nested objects become nested JSON objects, `- item` list entries become arrays, and scalars are typed correctly (numbers stay numbers, booleans stay booleans, quoted values stay strings). Because it runs entirely in your browser, you can convert private configs without a single upload.',
    'Paste YAML, copy or download the JSON, and use it in an API, a script, or anywhere JSON is required — no servers, no sign-up, free forever.',
  ],
  howToTitle: 'How to convert YAML to JSON',
  howTo: [
    'Paste YAML text into the input editor, or drag and drop a .yaml file anywhere on the input pane.',
    'Select YAML ➔ JSON from the format dropdown — the conversion happens instantly.',
    'Review the formatted JSON output with syntax highlighting.',
    'Copy the JSON to your clipboard or download it as a .json file.',
    'Hit Swap to convert the result back to YAML at any time.',
  ],
  faqs: [
    {
      q: 'Does it handle nested YAML?',
      a: 'Yes. Nested mappings become nested JSON objects and `- item` lists become JSON arrays, with correct indentation at any depth.',
    },
    {
      q: 'How are scalars typed?',
      a: 'Numbers stay numbers, true/false become booleans, and quoted strings stay strings. The parser follows YAML 1.2 typing rules.',
    },
    {
      q: 'What if my YAML is invalid?',
      a: 'The parser reports the exact line and column of the problem so you can fix it. Valid YAML converts to valid JSON every time.',
    },
    {
      q: 'Can I convert large YAML files?',
      a: 'Yes. Conversion runs in a Web Worker, so large documents parse without freezing the page — the limit is whatever your browser can handle.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  JSON → Zod Schema                                                  */
/* ------------------------------------------------------------------ */

const JSON_TO_ZOD: ToolConfig = {
  id: 'json-to-zod',
  path: '/json-to-zod',
  eyebrow: 'Type Generator',
  h1: 'JSON to Zod Schema Generator',
  tagline:
    'Turn any JSON document into a typed Zod schema with one click — nested z.object() blocks, arrays, nulls, and a ready z.infer type. All client-side.',
  metaTitle: 'JSON to Zod Schema Generator Online | MyJSONPal',
  metaDescription:
    'Convert JSON objects into TypeScript Zod validation schemas instantly. Auto-infer primitive types and nested objects. 100% in-browser.',
  targetKeyword: 'JSON to Zod Schema Generator',
  keywords: [
    'json to zod',
    'json to zod schema',
    'convert json to zod schema online',
    'json to zod generator',
    'zod schema infer from json',
    'generate zod object from json payload',
    'typescript zod schema generator',
    'create zod schema from api response',
    'json to zod typescript online',
    'zod infer type from json object',
  ],
  defaultFormat: 'zod',
  defaultAction: 'format',
  fileName: 'schema',
  sample:
    '{"user":{"id":42,"name":"Ada Lovelace","active":true,"email":null,"roles":["admin","editor"],"profile":{"bio":"Mathematician","followers":1240}},"source":"api","pagination":{"page":1,"limit":20}}',
  intro: [
    'Zod is the go-to validation library for TypeScript, and hand-writing schemas is tedious. MyJSONPal generates a complete Zod schema from any JSON document: objects become z.object() blocks, primitives become z.string()/z.number()/z.boolean(), arrays become z.array(), and nulls become z.null().',
    'Nested objects are extracted into nested z.object() definitions automatically, so even deeply structured payloads generate correct, validatable schemas. The output finishes with an export type that uses z.infer, wiring your TypeScript types directly to the schema — no duplication.',
    'Generation runs entirely in your browser. Paste an API response, generate the schema, and drop it straight into your project. Private, free, and instant.',
  ],
  howToTitle: 'How to generate a Zod schema',
  howTo: [
    'Paste a JSON sample of the data shape you want to validate.',
    'Select Zod Schema from the format dropdown.',
    'Copy the generated z.object() schema with its z.infer type export.',
    'Paste it into a file where zod is already installed.',
    'Adjust refinements like .min(), .max(), or .optional() as needed.',
  ],
  faqs: [
    {
      q: 'What types are generated?',
      a: 'Strings become z.string(), numbers z.number(), booleans z.boolean(), arrays z.array(), nulls z.null(), and objects z.object(). Empty objects become z.record(z.string(), z.unknown()).',
    },
    {
      q: 'How are nested objects handled?',
      a: 'Nested objects are extracted into their own z.object() definitions nested inside the parent, matching your JSON structure exactly.',
    },
    {
      q: 'Does it generate the export type?',
      a: 'Yes. Every schema ends with export type Name = z.infer<typeof name> so your TypeScript types stay in sync with your runtime validation.',
    },
    {
      q: 'Is the output ready to use?',
      a: 'The generated code imports { z } from "zod" and uses standard zod syntax, so it works with zod v3 and v4. Run it on the page, then paste it into your project.',
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
  metaTitle: 'JSON Minifier & String Compressor | MyJSONPal',
  metaDescription:
    'Compress and remove white space from JSON payloads to reduce bandwidth and API payload sizes.',
  targetKeyword: 'JSON Minifier & Compressor',
  keywords: [
    'minify json',
    'json minifier',
    'json compressor online',
    'remove whitespace from json',
    'compact json stringify',
    'one line json converter',
    'compress json payload size',
    'minify json for api response',
  ],
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
  h1: 'Magic Auto-Repair Broken JSON',
  tagline:
    'The Magic Auto-Repair engine fixes trailing commas, single quotes, unquoted keys, and Python literals in one click.',
  metaTitle: 'Fix & Repair Broken JSON Online | MyJSONPal',
  metaDescription:
    'Auto-fix trailing commas, single quotes, unquoted keys, and Python booleans in invalid JSON strings automatically.',
  targetKeyword: 'Repair Broken JSON Online',
  keywords: [
    'fix broken json',
    'repair json online',
    'json trailing comma remover',
    'convert single quotes to double quotes json',
    'auto fix json syntax errors',
    'fix python boolean in json',
    'unquoted json keys fixer',
    'why is my json invalid',
    'how to fix bad json online',
    'json parse error unexpected token',
    'json single quote repair tool',
  ],
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
  [CSV_TO_JSON.id]: CSV_TO_JSON,
  [JSON_TO_YAML.id]: JSON_TO_YAML,
  [YAML_TO_JSON.id]: YAML_TO_JSON,
  [JSON_TO_TYPESCRIPT.id]: JSON_TO_TYPESCRIPT,
  [JSON_TO_ZOD.id]: JSON_TO_ZOD,
  [MINIFY_JSON.id]: MINIFY_JSON,
  [FIX_JSON.id]: FIX_JSON,
};

export const TOOL_LIST: ToolConfig[] = [
  HOME_TOOL,
  JSON_TO_CSV,
  CSV_TO_JSON,
  JSON_TO_YAML,
  YAML_TO_JSON,
  JSON_TO_TYPESCRIPT,
  JSON_TO_ZOD,
  MINIFY_JSON,
  FIX_JSON,
];
