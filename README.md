# KaosNauts website

Static site published from `main` by GitHub Pages. No runtime dependencies.

## Edit and translate

- Shared markup: `site/template.html`.
- English, Brazilian Portuguese and Japanese text: `site/locales.json`.
- Shared appearance and behavior: `styles.css`, `brand-background.css`, `main.js`.
- Run `node scripts/build-site.mjs` after changing markup or translations.
- Commit the generated `/index.html`, `/pt-br/index.html`, `/ja/index.html`,
  `sitemap.xml` and `robots.txt` with the sources.
- Validate with `node scripts/build-site.mjs --check` and
  `node scripts/check-site.mjs`. CI checks generated files are current.
- Preview the repository root with a static HTTP server; asset URLs are absolute
  paths for the custom domain, so previewing individual HTML files is unsupported.

Each locale serves translated HTML without JavaScript, with its own canonical,
reciprocal `hreflang` links, social metadata and VideoGame structured data.
English is the `x-default`. Language links retain the section hash when JavaScript
is available; no automatic language or location redirects are used.
The navigation appears after the main logo leaves the viewport. Without
JavaScript/IntersectionObserver it remains visible as ordinary sticky navigation.

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
