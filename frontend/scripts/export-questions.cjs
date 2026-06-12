const fs  = require('fs');
const path = require('path');
const vm  = require('vm');

const src = fs.readFileSync(path.join(__dirname, '../src/lib/mockData.js'), 'utf-8');

// Replace export const with var so vm context exposes them as properties
const code = src.replace(/export\s+const\s+/g, 'var ').replace(/export\s+default\s+/g, 'var _default_ = ');

const ctx = { exports: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);

const out = {
  COMPANIES:  ctx.COMPANIES,
  QUESTIONS:  ctx.QUESTIONS,
  TECH_STACK: ctx.TECH_STACK,
  TOPIC_TREE: ctx.TOPIC_TREE,
  ROLES:      ctx.ROLES,
};

if (!out.QUESTIONS) {
  console.error('[seo] Failed to extract QUESTIONS — check mockData.js format');
  process.exit(1);
}

fs.writeFileSync(path.join(__dirname, 'seo-data.json'), JSON.stringify(out, null, 2));
console.log('[seo] Exported', out.QUESTIONS.length, 'questions to seo-data.json');
