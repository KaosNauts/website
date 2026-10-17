import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const script = await readFile(new URL('../main.js', import.meta.url), 'utf8');
function visit({ pathname = '/', languages = ['en-US'], language = 'en-US', saved, lang = 'en', blocked = false, search = '', hash = '', scrollState = null, click = null } = {}) {
    let redirected;
    let preference = saved;
    let restoredY;
    let session = scrollState;
    let clickHandler;
    const link = { href: 'https://kaosnauts.com/ja/', addEventListener: (_, handler) => { clickHandler = handler; } };
    const localStorage = {
        getItem() { if (blocked) throw new Error('Storage blocked'); return preference; },
        setItem(_, value) { if (blocked) throw new Error('Storage blocked'); preference = value; }
    };
    const document = {
        documentElement: { lang },
        getElementById: () => ({}), querySelector: () => null, querySelectorAll: () => click ? [link] : []
    };
    const window = {
        localStorage, navigator: { languages, language },
        sessionStorage: {
            getItem() { if (blocked) throw new Error('Storage blocked'); return session; },
            removeItem() { session = null; },
            setItem(_, value) { if (blocked) throw new Error('Storage blocked'); session = value; }
        },
        scrollY: 1234, requestAnimationFrame: callback => callback(), scrollTo: options => { restoredY = options.top; },
        location: { pathname, search, hash, replace: value => { redirected = value; } }
    };
    vm.runInNewContext(script, { window, document, URL });
    if (clickHandler) clickHandler({ button: 0, ...click });
    return { redirected, preference, restoredY, session, link: link.href };
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
const now = Date.now();
const snapshot = JSON.stringify({ path: '/ja/', y: 1234, at: now });
assert.equal(visit({ pathname: '/ja/', lang: 'ja', scrollState: snapshot }).restoredY, 1234);
assert.equal(visit({ pathname: '/ja/', lang: 'ja', scrollState: snapshot }).session, null);
assert.equal(visit({ pathname: '/en/', scrollState: snapshot }).restoredY, undefined);
assert.equal(visit({ pathname: '/ja/', lang: 'ja', hash: '#faq', scrollState: snapshot }).restoredY, undefined);
assert.equal(visit({ pathname: '/ja/', scrollState: JSON.stringify({ path: '/ja/', y: 1234, at: now - 70000 }) }).restoredY, undefined);
assert.equal(visit({ pathname: '/ja/', scrollState: '{broken' }).restoredY, undefined);
const switched = visit({ pathname: '/en/', hash: '#faq', click: {} });
assert.equal(switched.link, 'https://kaosnauts.com/ja/');
assert.equal(JSON.parse(switched.session).y, 1234);
assert.equal(JSON.parse(switched.session).path, '/ja/');
assert.equal(visit({ pathname: '/en/', click: { ctrlKey: true } }).session, null);
console.log('Locale routing: browser detection, saved choice, explicit URLs, fallback, blocked storage and URL preservation OK');
console.log('Language switches: clean URLs, one-use scroll restoration, deep links, stale data and modified clicks OK');
