# KaosNauts website

Static site published from `main` by GitHub Pages. No runtime dependencies.

## Typography

Headings use the project's own locally hosted fonts: `KaosNauts Gouache` for h2
and `KaosNauts` for h3, through `typography.css`. Body text, navigation and the
small hero tagline keep their existing reading fonts. Japanese headings retain
the Japanese font stack: the JP painted specimen does not cover full sentences.
Fonts use `font-display: swap`, with system fallback for missing glyphs.
`fonts/provenance.json` identifies the source commit and SHA-256 of both TTFs
from `KaosNauts/kaosnauts-resource`; update those records when replacing the files.

## Edit and translate

- Shared markup: `site/template.html`.
- Trailer watch-page markup: `site/watch-template.html`; generated at each
  locale's `trailer/` path. Include these generated pages in commits too.
- English, Brazilian Portuguese and Japanese text: `site/locales.json`.
- Shared appearance and behavior: `styles.css`, `brand-background.css`, `main.js`.
- Run `node scripts/build-site.mjs` after changing markup or translations.
- Commit the generated `/index.html`, `/en/index.html`, `/pt-br/index.html`, `/ja/index.html`,
  `sitemap.xml` and `robots.txt` with the sources.
- Validate with `node scripts/build-site.mjs --check` and
  `node scripts/check-site.mjs`. CI checks generated files are current.
- Preview the repository root with a static HTTP server; asset URLs are absolute
  paths for the custom domain, so previewing individual HTML files is unsupported.

Each locale serves translated HTML without JavaScript, with its own canonical,
reciprocal `hreflang` links, social metadata and VideoGame structured data.
The root is the `x-default` entry: JavaScript sends it to `/en/`, `/pt-br/` or
`/ja/`, using the saved language or the first supported browser language.
Explicit language URLs are always respected and become the saved preference.
Unsupported languages fall back to English; blocked local storage is tolerated.
Query parameters and section hashes are retained. Without JavaScript, the root
shows English with a canonical pointing to `/en/` and ordinary language links.
Language switches restore the reader's scroll height in the new language using
a short-lived, one-use session storage entry. They do not copy section hashes.
Explicit deep links still work normally. If storage is blocked, language links
remain usable and open at the top.
The navigation appears after the main logo leaves the viewport. Without
JavaScript/IntersectionObserver it remains visible as ordinary sticky navigation.
A compact language selector stays in the top-right corner while the navigation
is hidden, then yields to the language selector inside the navigation.

## Search content

Target relevant intents naturally: co-op space game, rocket building, space
engineering, playing with friends; jogo espacial cooperativo, construir foguetes;
宇宙協力ゲーム, ロケットを作る, オンライン協力. These are content hypotheses,
not claims of measured search volume or guaranteed rankings.

Google Trends was inspected on 2026-10-17, worldwide, past 12 months, for
Artemis / rocket game / space game / co op games:
https://trends.google.com/trends/explore?date=today%2012-m&q=Artemis,rocket%20game,space%20game,co%20op%20games&hl=en
Artemis showed an event-driven spike around late March/early April, with rising
queries about Artemis II splashdown and livestreams. Broad exact search terms
also returned unrelated queries; normalized scores are not absolute volumes and
small scores in this comparison do not prove absence of demand.

Keep the landing page about the actual game. Artemis-inspired educational posts
or videos can be a future editorial project when there is relevant material;
the site makes no NASA affiliation, Artemis simulation, lunar landing feature,
release-date or availability claim. Do not add trending names just as keywords.

References:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/monitor-debug/trends-start

After publication, submit `https://kaosnauts.com/sitemap.xml` in the owner's
verified Google Search Console property and monitor indexing/search queries.
That account-level setup is separate from publishing this repository.

## Media and publication checks

`site/trailer.json` records the public YouTube video's actual publication date,
duration, thumbnail and source. Update these verified values when replacing the
trailer; the generator adds VideoObject markup and localized watch pages.

Original artwork remains in the repository. Responsive WebP derivatives are
generated with `python scripts/optimize-images.py` (Pillow required); commit them
alongside generated HTML. The browser selects a suitable width using `srcset`.

CI also builds with GitHub's Jekyll action and runs
`node scripts/check-published-site.mjs _site`. `_config.yml` explicitly includes
`sitemap.xml`: excluding the authoring folder `site` otherwise also matches that
filename through Jekyll's prefix rules.

The domain is behind Cloudflare. Its zone setting **SSL/TLS → Edge Certificates
→ Always Use HTTPS** must be enabled to redirect public HTTP requests. Repository
HTML cannot configure that edge redirect. This setting still requires access to
the owner's Cloudflare dashboard; it was not changed by this repository update.
