function routeEntryLanguage() {
    const paths = { en: '/en/', 'pt-br': '/pt-br/', ja: '/ja/' };
    const isEntry = window.location.pathname === '/' || window.location.pathname === '/index.html';
    if (isEntry) {
        let chosen;
        try { chosen = window.localStorage.getItem('kaosnauts-language'); } catch { /* Preferences are optional. */ }
        if (!Object.hasOwn(paths, chosen)) {
            const preferred = window.navigator.languages?.length ? window.navigator.languages : [window.navigator.language];
            chosen = preferred.map(language => {
                const base = String(language).toLowerCase().split('-')[0];
                return base === 'pt' ? 'pt-br' : base;
            }).find(language => Object.hasOwn(paths, language)) || 'en';
        }
        window.location.replace(paths[chosen] + window.location.search + window.location.hash);
        return true;
    }
    const current = document.documentElement.lang.toLowerCase();
    if (Object.hasOwn(paths, current)) {
        try { window.localStorage.setItem('kaosnauts-language', current); } catch { /* Explicit URLs still work. */ }
    }
    return false;
}

if (!routeEntryLanguage()) {
    document.getElementById("year").textContent = new Date().getFullYear();

    const navigation = document.querySelector('.nav');
    const heroLogo = document.querySelector('.hero-logo-stack');
    const topLanguage = document.querySelector('.top-language');
    if (navigation && heroLogo && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('nav-auto');
        const updateNavigation = visible => {
            navigation.classList.toggle('is-visible', visible);
            navigation.toggleAttribute('inert', !visible);
            navigation.setAttribute('aria-hidden', String(!visible));
            if (!visible) navigation.querySelectorAll('details[open]').forEach(menu => { menu.open = false; });
            if (topLanguage) {
                topLanguage.hidden = visible;
                if (visible) topLanguage.querySelectorAll('details[open]').forEach(menu => { menu.open = false; });
            }
        };
        updateNavigation(heroLogo.getBoundingClientRect().bottom <= 0);
        const observer = new IntersectionObserver(([entry]) => {
            updateNavigation(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
        });
        observer.observe(heroLogo);
    }

    // Manual language changes keep the reader at the same section.
    document.querySelectorAll('a[hreflang]').forEach(link => {
        link.addEventListener('click', () => {
            const target = new URL(link.href);
            target.hash = window.location.hash;
            link.href = target.href;
        });
    });
}
