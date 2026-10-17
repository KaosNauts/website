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
    for (const watch of [false, true]) {
    const route = locale.path + (watch ? 'trailer/' : '');
    const html = await readFile(path.join(root, route.slice(1), 'index.html'), 'utf8');
    const canonical = 'https://kaosnauts.com' + route;
    assert(html.includes(`<html lang="${locale.lang}">`));
    assert(html.includes(`<link rel="canonical" href="${canonical}" />`));
    assert(!html.includes('{{'), `Unresolved template in ${key}`);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert(html.includes(`<h1>${watch ? locale.videoTitle : locale.heroLine}</h1>`));
    for (const alternate of Object.values(locales)) {
        const alternatePath = alternate.path + (watch ? 'trailer/' : '');
        assert(html.includes(`hreflang="${alternate.lang}" href="https://kaosnauts.com${alternatePath}"`));
        assert(html.includes(`href="${alternatePath}" hreflang="${alternate.lang}" lang="${alternate.lang}"`));
    }
    assert(html.includes(`hreflang="x-default" href="https://kaosnauts.com/${watch ? 'en/trailer/' : ''}"`));
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    const page = data['@graph'].find(item => item['@type'] === (watch ? 'WebPage' : 'VideoGame'));
    assert.equal(page.inLanguage, locale.lang);
    assert.equal(page.url, canonical);
    const video = data['@graph'].find(item => item['@type'] === 'VideoObject');
    for (const field of ['name', 'description', 'thumbnailUrl', 'uploadDate', 'duration', 'embedUrl']) assert(video[field], `Missing video ${field}`);
    assert(Number.isFinite(Date.parse(video.uploadDate)));
    assert.equal(video.duration, 'PT16S');
    assert(html.includes(video.embedUrl + '?rel=0'));
    if (watch) assert(html.includes(video.description));
    assert(sitemap.includes(`<loc>${canonical}</loc>`));
    for (const [, url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
        if (/^https?:/.test(url)) continue;
        const relative = url.split(/[?#]/)[0].replace(/^\//, '');
        await access(path.join(root, relative.endsWith('/') || !relative ? relative + 'index.html' : relative));
    }
    for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${anchor}"`));
    for (const [, set] of html.matchAll(/srcset="([^"]+)"/g)) {
        for (const entry of set.split(',')) await access(path.join(root, entry.trim().split(' ')[0].slice(1)));
    }
    console.log(`${route}: language, metadata, alternates, video schema, responsive assets and section links OK`);
    }
}
