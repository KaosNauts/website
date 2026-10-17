document.getElementById("year").textContent = new Date().getFullYear();

const navigation = document.querySelector('.nav');
const heroLogo = document.querySelector('.hero-logo-stack');
if (navigation && heroLogo && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('nav-auto');
    const updateNavigation = visible => {
        navigation.classList.toggle('is-visible', visible);
        navigation.toggleAttribute('inert', !visible);
        navigation.setAttribute('aria-hidden', String(!visible));
        if (!visible) navigation.querySelectorAll('details[open]').forEach(menu => { menu.open = false; });
    };
    updateNavigation(heroLogo.getBoundingClientRect().bottom <= 0);
    const observer = new IntersectionObserver(([entry]) => {
        updateNavigation(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    });
    observer.observe(heroLogo);
}

// Language changes keep the reader at the same section, without automatic redirects.
document.querySelectorAll('a[hreflang]').forEach(link => {
    link.addEventListener('click', () => {
        const target = new URL(link.href);
        target.hash = window.location.hash;
        link.href = target.href;
    });
});
