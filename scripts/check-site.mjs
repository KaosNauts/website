import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const locales = JSON.parse(await readFile(path.join(root, 'site/locales.json'), 'utf8'));
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const keys = Object.keys(locales.en).sort();
assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), await readFile(path.join(root, 'en/index.html'), 'utf8'), 'Root must share the English fallback and canonical');
for (const [key, locale] of Object.entries(locales)) {
    assert.deepEqual(Object.keys(locale).sort(), keys, `Incomplete translation: ${key}`);
    const html = await readFile(path.join(root, locale.path.slice(1), 'index.html'), 'utf8');
    const canonical = 'https://kaosnauts.com' + locale.path;
    assert(html.includes(`<html lang="${locale.lang}">`));
    assert(html.includes(`<link rel="canonical" href="${canonical}" />`));
    assert(!html.includes('{{'), `Unresolved template in ${key}`);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert(html.includes(`<h1>${locale.heroLine}</h1>`));
    for (const alternate of Object.values(locales)) {
        assert(html.includes(`hreflang="${alternate.lang}" href="https://kaosnauts.com${alternate.path}"`));
        assert(html.includes(`href="${alternate.path}" hreflang="${alternate.lang}" lang="${alternate.lang}"`));
    }
    assert(html.includes('hreflang="x-default" href="https://kaosnauts.com/"'));
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(data.inLanguage, locale.lang);
    assert.equal(data.url, canonical);
    assert.equal(data['@type'], 'VideoGame');
    assert(sitemap.includes(`<loc>${canonical}</loc>`));
    for (const [, url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
        if (/^https?:/.test(url)) continue;
        const relative = url.split(/[?#]/)[0].replace(/^\//, '');
        await access(path.join(root, relative.endsWith('/') || !relative ? relative + 'index.html' : relative));
    }
    for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${anchor}"`));
    console.log(`${key}: language, metadata, alternates, schema, local assets and section links OK`);
}
