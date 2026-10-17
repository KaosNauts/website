import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://kaosnauts.com';
const locales = JSON.parse(await readFile(path.join(root, 'site/locales.json'), 'utf8'));
const template = (await readFile(path.join(root, 'site/template.html'), 'utf8')).replaceAll('\r\n', '\n');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const entries = Object.entries(locales);
// Inline flags render consistently on Windows, where flag emoji may show letters.
const flags = {
    en: '<rect width="24" height="16" fill="#fff"/><path stroke="#b22234" stroke-width="1.3" d="M0 .7h24M0 3.3h24M0 5.9h24M0 8.5h24M0 11.1h24M0 13.7h24M0 15.7h24"/><path fill="#3c3b6e" d="M0 0h10v9H0z"/><path fill="#fff" d="M2 2h1v1H2zm3 0h1v1H5zm3 0h1v1H8zM2 5h1v1H2zm3 0h1v1H5zm3 0h1v1H8z"/>',
    'pt-br': '<rect width="24" height="16" fill="#009739"/><path fill="#ffdf00" d="m12 2 10 6-10 6L2 8z"/><circle cx="12" cy="8" r="3.7" fill="#012169"/><path d="M8.5 7a8 8 0 0 1 7 2" fill="none" stroke="#fff" stroke-width=".65"/>',
    ja: '<rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4.5" fill="#bc002d"/>'
};
const flag = key => `<svg class="flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">${flags[key]}</svg>`;
const alternates = entries.map(([, locale]) => `<link rel="alternate" hreflang="${locale.lang}" href="${origin}${locale.path}" />`).join('\n    ')
    + `\n    <link rel="alternate" hreflang="x-default" href="${origin}/" />`;
let outdated = false;
async function output(relative, contents) {
    const file = path.join(root, relative);
    if (process.argv.includes('--check')) {
        const current = await readFile(file, 'utf8').catch(() => '');
        if (current.replaceAll('\r\n', '\n') !== contents) { console.error(`Regenerate ${relative}`); outdated = true; }
    } else {
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, contents);
    }
}
for (const [key, locale] of entries) {
    const languageLinks = entries.map(([otherKey, other]) => `<a href="${other.path}" hreflang="${other.lang}" lang="${other.lang}"${key === otherKey ? ' aria-current="page"' : ''}>${flag(otherKey)} ${other.label}</a>`).join('');
    const languageMenu = `<details class="language-menu"><summary aria-label="${escape(locale.languageLabel)}">${flag(key)} ${escape(locale.short)}</summary><div class="language-options">${languageLinks}</div></details>`;
    const structuredData = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'VideoGame',
        '@id': `${origin}/#game`, name: 'KaosNauts', url: `${origin}${locale.path}`,
        description: locale.description, inLanguage: locale.lang,
        genre: ['Space exploration', 'Cooperative game', 'Space engineering'],
        image: `${origin}/KaosNauts.png`,
        sameAs: ['https://www.instagram.com/kaosnauts', 'https://www.youtube.com/channel/UCB8qw4UOMYYOVuPwmP45RlA']
    }).replaceAll('<', '\\u003c');
    const raw = { alternates, languageMenu, languageLinks, structuredData };
    const values = { ...locale, canonical: origin + locale.path };
    const html = template.replace(/\{\{(\w+)\}\}/g, (_, token) => {
        if (Object.hasOwn(raw, token)) return raw[token];
        if (!Object.hasOwn(values, token)) throw new Error(`Missing translation: ${key}.${token}`);
        return escape(values[token]);
    });
    await output(path.join(locale.path.slice(1), 'index.html'), html);
}
await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(([, locale]) => `  <url><loc>${origin}${locale.path}</loc></url>`).join('\n')}\n</urlset>\n`);
await output('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
if (outdated) process.exitCode = 1;
else console.log(process.argv.includes('--check') ? 'All locale pages are up to date.' : 'Generated English, Portuguese and Japanese pages, sitemap and robots.txt.');
