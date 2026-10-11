// Fails when src/data/copy.ts still contains [[placeholder]] markers in its strings,
// or a URL wrapped in notYet(...), which the page renders as a placeholder too.
import { readFileSync } from 'node:fs';

const file = new URL('../src/data/copy.ts', import.meta.url);
const source = readFileSync(file, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
  .replace(/^\s*\/\/.*$/gm, ''); // line comments

const literal = [...source.matchAll(/\[\[.*?\]\]/g)].map((m) => m[0]);

// Calls to notYet(...), but not its own definition.
const pending = [...source.matchAll(/notYet\(([^)]*)\)/g)]
  .map((m) => m[1].trim())
  .filter((arg) => arg !== 'url: string')
  .map((arg) => `notYet(${arg})`);

const hits = [...literal, ...pending];

if (hits.length) {
  console.error(`copy.ts still has ${hits.length} placeholder(s):`);
  for (const h of hits) console.error(`  ${h}`);
  process.exit(1);
}
console.log('copy.ts: no placeholders left.');
