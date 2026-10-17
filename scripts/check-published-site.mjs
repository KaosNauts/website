import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

// Run against Jekyll's output, where exclusion rules may remove source files.
const root = path.resolve(process.argv[2] || '_site');
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
assert(robots.includes('https://kaosnauts.com/sitemap.xml'));
for (const locale of ['en', 'pt-br', 'ja']) {
    for (const suffix of ['', 'trailer/']) {
        const route = `/${locale}/${suffix}`;
        assert(sitemap.includes(`<loc>https://kaosnauts.com${route}</loc>`));
        const html = await readFile(path.join(root, route, 'index.html'), 'utf8');
        for (const [, asset] of html.matchAll(/(?:src|href)="(\/(?:images\/[^"?#]+|styles.css|main.js|brand-background.css))/g)) {
            await access(path.join(root, asset));
        }
    }
}
await assert.rejects(access(path.join(root, 'site/template.html')));
await assert.rejects(access(path.join(root, 'scripts/build-site.mjs')));
console.log('Jekyll output: sitemap, six pages and their local assets are published; authoring sources excluded.');
