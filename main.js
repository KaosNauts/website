document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");
    const thumbs = Array.from(carousel.querySelectorAll("[data-carousel-thumb]"));
    const slides = Array.from(track?.children || []);

    if (!track || !prevBtn || !nextBtn || slides.length === 0) return;

    let currentIndex = 0;

    const update = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        thumbs.forEach((thumb, index) => {
            thumb.classList.toggle("is-active", index === currentIndex);
            thumb.setAttribute("aria-selected", index === currentIndex ? "true" : "false");
        });
    };

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        update();
    });

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slides.length;
        update();
    });

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", () => {
            currentIndex = index;
            update();
        });
    });

    update();
});
