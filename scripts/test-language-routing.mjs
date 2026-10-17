import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const script = await readFile(new URL('../main.js', import.meta.url), 'utf8');
function visit({ pathname = '/', languages = ['en-US'], language = 'en-US', saved, lang = 'en', blocked = false, search = '', hash = '' } = {}) {
    let redirected;
    let preference = saved;
    const localStorage = {
        getItem() { if (blocked) throw new Error('Storage blocked'); return preference; },
        setItem(_, value) { if (blocked) throw new Error('Storage blocked'); preference = value; }
    };
    const document = {
        documentElement: { lang },
        getElementById: () => ({}), querySelector: () => null, querySelectorAll: () => []
    };
    const window = {
        localStorage, navigator: { languages, language },
        location: { pathname, search, hash, replace: value => { redirected = value; } }
    };
    vm.runInNewContext(script, { window, document, URL });
    return { redirected, preference };
}
assert.equal(visit().redirected, '/en/');
assert.equal(visit({ languages: ['pt-BR'] }).redirected, '/pt-br/');
assert.equal(visit({ languages: ['pt-PT'] }).redirected, '/pt-br/');
assert.equal(visit({ languages: ['ja-JP'] }).redirected, '/ja/');
assert.equal(visit({ languages: ['fr-FR', 'ja'] }).redirected, '/ja/');
assert.equal(visit({ languages: ['fr-FR'] }).redirected, '/en/');
assert.equal(visit({ languages: [], language: 'ja-JP' }).redirected, '/ja/');
assert.equal(visit({ saved: 'ja', languages: ['pt-BR'] }).redirected, '/ja/');
assert.equal(visit({ saved: 'invalid', languages: ['pt-BR'] }).redirected, '/pt-br/');
assert.equal(visit({ blocked: true, languages: ['pt-BR'] }).redirected, '/pt-br/');
assert.equal(visit({ pathname: '/index.html', search: '?utm_source=test', hash: '#faq', languages: ['ja'] }).redirected, '/ja/?utm_source=test#faq');
for (const [pathname, lang] of [['/en/', 'en'], ['/en', 'en'], ['/pt-br/', 'pt-BR'], ['/ja/', 'ja']]) {
    const result = visit({ pathname, lang, saved: 'pt-br', languages: ['ja-JP'] });
    assert.equal(result.redirected, undefined, `Respect explicit URL ${pathname}`);
    assert.equal(result.preference, lang.toLowerCase());
}
assert.equal(visit({ pathname: '/ja/', lang: 'ja', blocked: true }).redirected, undefined);
console.log('Locale routing: browser detection, saved choice, explicit URLs, fallback, blocked storage and URL preservation OK');
