/** Semantic checks for project content shared by PDF, DOCX, and canvas preview. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });
for (const file of ['export-content.js', 'export-ir.js', 'preview-renderer.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'portfolio/admin/utils', file), 'utf8'), context);
}
const data = Object.fromEntries(['projects', 'profile', 'expertise', 'manager'].map(name =>
  [name, JSON.parse(fs.readFileSync(path.join(root, `portfolio/data/${name}.json`), 'utf8'))]));
const flatten = node => [node, ...(node.children || []).flatMap(flatten)];
for (const lang of ['ko', 'en']) {
  const ir = context.window.ExportIR.build(data, { sections: ['projects'] }, lang);
  const nodes = flatten(ir);
  const preview = Object.create(context.window.DocumentPreviewRenderer.prototype);
  preview.currentLang = lang;
  preview.theme = { spacing: { page: { marginLeft: 72, marginRight: 72 } } };
  const elements = [];
  preview.buildProjectsElements(elements, data.projects, { fontSize: { h3: 16, body: 11 } });
  for (const project of Object.values(data.projects).flat()) {
    const title = typeof project.title === 'string' ? project.title : project.title[lang];
    assert(nodes.some(node => node.role === 'projectTitle' && node.text === title), `IR missing ${title}`);
    assert(elements.some(node => node.type === 'projectTitle' && node.text === title), `Preview missing ${title}`);
  }
  for (const project of data.projects.openSource) {
    assert(nodes.some(node => node.text === project.status[lang]), `IR missing status: ${project.id}`);
    assert(elements.some(node => node.text === project.status[lang]), `Preview missing status: ${project.id}`);
    for (const source of project.sources) {
      assert(nodes.some(node => node.role === 'projectLink' && node.url === source.url && node.text === source.label[lang]));
      assert(elements.some(node => node.text.includes(source.url) && node.text.includes(source.label[lang])));
    }
  }
  const coverStats = nodes.find(node => node.type === 'statsRow').items;
  assert.equal(JSON.stringify(coverStats), JSON.stringify(preview.buildCoverStats(data)));
  assert.equal(coverStats.length, data.profile.careerMetrics.length);
  assert(coverStats.every(stat => !/Certifications|글로벌 인증/.test(stat.label)));
  const unsafe = context.window.ExportContent.getProjectContext({ sources: [
    { label: { ko: 'unsafe', en: 'unsafe' }, url: 'javascript:alert(1)' }
  ] }, lang);
  assert.equal(unsafe.length, 0, 'Unsafe document links must be excluded');
  console.log(`PASS: ${lang} project content, support notes, evidence links, complete preview, and career stats`);
}
