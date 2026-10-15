import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * `virtual:dsa-ladders` — every practice-ladder problem from the DSA pattern lessons, parsed at build
 * time: { [lessonId]: [{ num, title, slug, level }] }. Used by the Problem Tracker.
 */
const ID = 'virtual:dsa-ladders';
const ROW = /^\|\s*(\d+)\s*\|\s*\[([^\]]+)\]\(https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?\)\s*\|\s*(Easy|Medium|Hard)\s*\|/gm;

export function dsaLadders(dir) {
  return {
    name: 'dsa-ladders',
    resolveId: (id) => (id === ID ? '\0' + ID : null),
    load(id) {
      if (id !== '\0' + ID) return null;
      const out = {};
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
        const path = join(resolve(dir), file);
        this.addWatchFile(path);
        const src = readFileSync(path, 'utf8');
        out[file.slice(0, -4)] = [...src.matchAll(ROW)].map(([, num, title, slug, level]) => ({ num, title, slug, level }));
      }
      return `export default ${JSON.stringify(out)};`;
    },
  };
}
