/**
 * Export Snapshot Harness
 * =======================
 *
 * Regression safety net for refactoring the admin PDF/DOCX exporters.
 * It loads the browser exporter scripts unmodified inside Node, builds the
 * document definitions exactly the way the admin export flow does (default
 * options: all public sections, cover page on, cover letter off, executive
 * theme, compensation/private excluded), and serializes them to
 * deterministic JSON snapshots:
 *
 *   pdf-ko.json   pdfmake docDefinition, Korean
 *   pdf-en.json   pdfmake docDefinition, English
 *   docx-ko.json  docx.js Document object tree, Korean
 *   docx-en.json  docx.js Document object tree, English
 *
 * Usage
 * -----
 *   # 1) Baseline mode: generate/overwrite baseline snapshots
 *   node tools/export-snapshot.mjs baseline [--dir <snapshot-dir>]
 *
 *   # 2) Compare mode: rebuild with the CURRENT code and diff against the
 *   #    baseline; prints a per-snapshot diff summary. Exit code 0 = no
 *   #    differences, 1 = differences found (or missing baseline files).
 *   node tools/export-snapshot.mjs compare [--dir <snapshot-dir>]
 *
 * Default snapshot dir: <repo>/tools/export-baseline (override with --dir).
 *
 * Determinism
 * -----------
 * - Date is frozen (fixed timestamp) so the cover-page date, "Present"
 *   duration math, and docx core-properties timestamps are stable.
 * - Math.random is replaced with a seeded PRNG (docx.umd.js derives some
 *   internal IDs from it); the PRNG is re-seeded before each build.
 * - Builds always run in the same order (pdf-ko, pdf-en, docx-ko, docx-en)
 *   so module-level counters inside docx.umd.js line up across runs.
 * - Serialization uses sorted object keys, a cycle guard, a depth limit,
 *   and records constructor names ($type) for class instances.
 * - The PDF exporter's font state is forced to "loaded" so no network
 *   fetch happens and defaultStyle.font matches a successful browser run.
 *
 * The exporter sources are loaded as-is (classic scripts via node:vm);
 * this harness never modifies them.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

process.env.TZ = process.env.TZ || 'Asia/Seoul';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PORTFOLIO = path.join(REPO_ROOT, 'portfolio');

const SNAPSHOT_NAMES = ['pdf-ko', 'pdf-en', 'docx-ko', 'docx-en'];

// Sections used by the default admin export flow (compensation excluded).
const DEFAULT_SECTIONS = ['expertise', 'manager', 'projects', 'career', 'education', 'testimonials'];

// ---------------------------------------------------------------------------
// Determinism: frozen Date + seeded Math.random
// ---------------------------------------------------------------------------

const RealDate = Date;
// Fixed reference time: 2026-08-01 12:00:00 (local TZ, pinned to Asia/Seoul).
const FIXED_NOW_MS = new RealDate(2026, 7, 1, 12, 0, 0).getTime();

class FrozenDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) {
      super(FIXED_NOW_MS);
    } else {
      super(...args);
    }
  }
  static now() {
    return FIXED_NOW_MS;
  }
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RANDOM_SEED = 0xC0FFEE;
let rng = mulberry32(RANDOM_SEED);

/** Reset all mutable determinism state before each build. */
function resetDeterminism() {
  rng = mulberry32(RANDOM_SEED);
}

// ---------------------------------------------------------------------------
// Browser environment stubs (must exist before the classic scripts load)
// ---------------------------------------------------------------------------

function installBrowserStubs() {
  globalThis.window = globalThis;
  globalThis.self = globalThis;
  globalThis.Date = FrozenDate;
  Math.random = () => rng();

  // Minimal Map-based localStorage stub (Web Storage subset the code uses).
  const store = new Map();
  const localStorageStub = {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store.clear(); },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; }
  };
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageStub, configurable: true, writable: true
    });
  } catch {
    globalThis.localStorage = localStorageStub;
  }
}

/** Load a classic (non-module) browser script into the shared global scope. */
function loadClassicScript(relPath) {
  const abs = path.join(PORTFOLIO, relPath);
  const code = fs.readFileSync(abs, 'utf8');
  vm.runInThisContext(code, { filename: abs });
}

function loadExporterScripts() {
  // Same relative order as admin.html: shared utils first, then vendor
  // docx, then the exporters. pdfmake is NOT needed (buildDocument only).
  loadClassicScript('utils/i18n.js');
  loadClassicScript('admin/utils/export-content.js');
  loadClassicScript('admin/utils/export-ir.js');
  loadClassicScript('admin/utils/theme-config.js');
  loadClassicScript('admin/utils/style-manager.js');
  loadClassicScript('admin/vendor/docx.umd.js');
  loadClassicScript('admin/utils/docx-exporter.js');
  loadClassicScript('admin/utils/pdf-exporter.js');
}

// ---------------------------------------------------------------------------
// Portfolio data (mirrors data.js -> window.PortfolioData and admin.js this.data)
// ---------------------------------------------------------------------------

function loadPortfolioData() {
  const dataDir = path.join(PORTFOLIO, 'data');
  const load = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));

  // Same shape data.js builds into window.PortfolioData. compensation lives
  // in data/private/ and is only loaded with private access — snapshot runs
  // mirror the default (no-access) session, so it stays null.
  const portfolioData = {
    projects: load('projects.json'),
    career: load('career.json'),
    expertise: load('expertise.json'),
    testimonials: load('testimonials.json'),
    manager: load('manager.json'),
    coverLetter: load('cover-letter.json'),
    education: load('education.json'),
    profile: load('profile.json'),
    compensation: null
  };
  globalThis.window.PortfolioData = portfolioData;

  // admin.js AdminApp.this.data mirror (subset passed to the exporters).
  return {
    projects: portfolioData.projects,
    manager: portfolioData.manager,
    career: portfolioData.career,
    expertise: portfolioData.expertise,
    testimonials: portfolioData.testimonials,
    education: portfolioData.education,
    profile: portfolioData.profile
  };
}

// ---------------------------------------------------------------------------
// Document builds (default admin export flow, no file download)
// ---------------------------------------------------------------------------

/** Info object generatePDF/generateDOCX derive from their default options. */
function buildInfo(lang) {
  return {
    title: lang === 'ko' ? '포트폴리오' : 'Portfolio',
    author: lang === 'ko' ? '신동철' : 'Dongcheol Shin',
    includeCoverLetter: false,
    coverLetterTemplate: null,
    includeCoverPage: true,
    pageBreakBetweenSections: true,
    personalInfoFields: []
  };
}

function buildPdfDocDefinition(data, lang) {
  resetDeterminism();
  const exporter = globalThis.window.PDFExporter;
  exporter.currentLang = lang;
  exporter.initializeTheme('executive', {});
  // Skip the network font fetch: mark the Korean font as loaded so
  // defaultStyle.font matches a successful loadKoreanFont() browser run.
  exporter.fontLoaded = true;
  return exporter.buildDocument(data, DEFAULT_SECTIONS, buildInfo(lang));
}

function buildDocxDocument(data, lang) {
  resetDeterminism();
  const exporter = globalThis.window.DOCXExporter;
  exporter.currentLang = lang;
  exporter.initializeTheme('executive', {});
  return exporter.buildDocument(data, DEFAULT_SECTIONS, buildInfo(lang));
}

// ---------------------------------------------------------------------------
// Deterministic serialization
// ---------------------------------------------------------------------------

const MAX_DEPTH = 80;

/**
 * Convert an arbitrary object tree (including class instances) into a plain
 * JSON-safe tree: sorted keys, $type markers for class instances, cycle
 * guard, depth limit, and stable markers for non-JSON values.
 */
function toSerializableTree(value, depth = 0, ancestors = new Set()) {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'boolean') return value;
  if (t === 'number') {
    return Number.isFinite(value) ? value : `[Number ${String(value)}]`;
  }
  if (t === 'bigint') return `[BigInt ${value.toString()}]`;
  if (t === 'undefined') return '[undefined]';
  if (t === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (t === 'symbol') return `[Symbol ${String(value.description || '')}]`;

  // Objects from here on.
  if (ancestors.has(value)) return '[Circular]';
  if (depth > MAX_DEPTH) return '[MaxDepth]';

  if (value instanceof RealDate) {
    return `[Date ${new RealDate(value.getTime()).toISOString()}]`;
  }
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    const len = value.byteLength ?? value.length ?? 0;
    return `[${value.constructor?.name || 'Bytes'} byteLength=${len}]`;
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item) =>
        item === undefined ? null : toSerializableTree(item, depth + 1, ancestors));
    }
    if (value instanceof Map) {
      return {
        $type: 'Map',
        entries: Array.from(value.entries()).map(([k, v]) => [
          toSerializableTree(k, depth + 1, ancestors),
          toSerializableTree(v, depth + 1, ancestors)
        ])
      };
    }
    if (value instanceof Set) {
      return {
        $type: 'Set',
        values: Array.from(value.values()).map((v) =>
          toSerializableTree(v, depth + 1, ancestors))
      };
    }

    const out = {};
    const ctor = value.constructor?.name;
    if (ctor && ctor !== 'Object') out.$type = ctor;
    for (const key of Object.keys(value).sort()) {
      const v = value[key];
      if (v === undefined) continue;
      out[key] = toSerializableTree(v, depth + 1, ancestors);
    }
    return out;
  } finally {
    ancestors.delete(value);
  }
}

function serializeSnapshot(root) {
  return JSON.stringify(toSerializableTree(root), null, 2) + '\n';
}

// ---------------------------------------------------------------------------
// Structural diff (compare mode)
// ---------------------------------------------------------------------------

const MAX_DIFFS_PER_SNAPSHOT = 40;

function preview(v) {
  let s;
  try { s = JSON.stringify(v); } catch { s = String(v); }
  if (s === undefined) s = String(v);
  return s.length > 120 ? s.slice(0, 117) + '...' : s;
}

function collectDiffs(a, b, p, diffs) {
  if (diffs.length >= MAX_DIFFS_PER_SNAPSHOT) return;
  if (a === b) return;
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  const aObj = a !== null && typeof a === 'object';
  const bObj = b !== null && typeof b === 'object';

  if (aArr !== bArr || aObj !== bObj) {
    diffs.push(`${p}: type changed  baseline=${preview(a)}  current=${preview(b)}`);
    return;
  }
  if (aArr) {
    if (a.length !== b.length) {
      diffs.push(`${p}: array length ${a.length} -> ${b.length}`);
    }
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n && diffs.length < MAX_DIFFS_PER_SNAPSHOT; i++) {
      collectDiffs(a[i], b[i], `${p}[${i}]`, diffs);
    }
    return;
  }
  if (aObj) {
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
    for (const k of keys) {
      if (diffs.length >= MAX_DIFFS_PER_SNAPSHOT) return;
      const kp = `${p}.${k}`;
      if (!(k in a)) { diffs.push(`${kp}: added  current=${preview(b[k])}`); continue; }
      if (!(k in b)) { diffs.push(`${kp}: removed  baseline=${preview(a[k])}`); continue; }
      collectDiffs(a[k], b[k], kp, diffs);
    }
    return;
  }
  diffs.push(`${p}: ${preview(a)} -> ${preview(b)}`);
}

// ---------------------------------------------------------------------------
// Snapshot validation (sanity checks for baseline mode)
// ---------------------------------------------------------------------------

const HANGUL_RE = /[가-힣]/;

function validateSnapshot(name, json) {
  const problems = [];
  if (json.length < 10000) {
    problems.push(`suspiciously small (${json.length} bytes)`);
  }
  const lang = name.endsWith('-ko') ? 'ko' : 'en';
  if (lang === 'ko' && !HANGUL_RE.test(json)) {
    problems.push('no Hangul text found in Korean snapshot');
  }
  if (lang === 'en' && !/EXPERTISE|PROJECTS|CAREER/.test(json)) {
    problems.push('no English section labels found in English snapshot');
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { mode: argv[2], dir: path.join(REPO_ROOT, 'tools', 'export-baseline') };
  for (let i = 3; i < argv.length; i++) {
    if (argv[i] === '--dir' && argv[i + 1]) {
      args.dir = path.resolve(argv[++i]);
    } else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  if (args.mode !== 'baseline' && args.mode !== 'compare') {
    console.error('Usage: node tools/export-snapshot.mjs <baseline|compare> [--dir <snapshot-dir>]');
    process.exit(2);
  }
  return args;
}

function buildAllSnapshots() {
  installBrowserStubs();
  loadExporterScripts();
  const data = loadPortfolioData();

  // Fixed build order — keep in sync with the determinism notes above.
  return {
    'pdf-ko': serializeSnapshot(buildPdfDocDefinition(data, 'ko')),
    'pdf-en': serializeSnapshot(buildPdfDocDefinition(data, 'en')),
    'docx-ko': serializeSnapshot(buildDocxDocument(data, 'ko')),
    'docx-en': serializeSnapshot(buildDocxDocument(data, 'en'))
  };
}

function main() {
  const { mode, dir } = parseArgs(process.argv);
  const snapshots = buildAllSnapshots();

  if (mode === 'baseline') {
    fs.mkdirSync(dir, { recursive: true });
    let failed = false;
    for (const name of SNAPSHOT_NAMES) {
      const json = snapshots[name];
      const file = path.join(dir, `${name}.json`);
      fs.writeFileSync(file, json, 'utf8');
      const problems = validateSnapshot(name, json);
      const status = problems.length === 0 ? 'OK' : `WARN (${problems.join('; ')})`;
      if (problems.length > 0) failed = true;
      console.log(`baseline ${name}.json  ${Buffer.byteLength(json, 'utf8')} bytes  ${status}`);
    }
    console.log(`Baseline written to: ${dir}`);
    process.exit(failed ? 1 : 0);
  }

  // compare mode
  let totalDiffs = 0;
  let missing = 0;
  for (const name of SNAPSHOT_NAMES) {
    const file = path.join(dir, `${name}.json`);
    if (!fs.existsSync(file)) {
      console.log(`${name}: MISSING baseline (${file})`);
      missing++;
      continue;
    }
    const baselineText = fs.readFileSync(file, 'utf8');
    const currentText = snapshots[name];
    if (baselineText === currentText) {
      console.log(`${name}: identical`);
      continue;
    }
    const diffs = [];
    collectDiffs(JSON.parse(baselineText), JSON.parse(currentText), '$', diffs);
    totalDiffs += diffs.length;
    const capped = diffs.length >= MAX_DIFFS_PER_SNAPSHOT ? ' (capped)' : '';
    console.log(`${name}: ${diffs.length} difference(s)${capped}`);
    for (const d of diffs) console.log(`  ${d}`);
  }
  if (missing > 0 || totalDiffs > 0) {
    console.log(`Compare result: ${totalDiffs} difference(s), ${missing} missing baseline file(s).`);
    process.exit(1);
  }
  console.log('Compare result: all snapshots identical.');
  process.exit(0);
}

main();
