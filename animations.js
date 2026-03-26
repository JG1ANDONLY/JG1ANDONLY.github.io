document.addEventListener('DOMContentLoaded', function () {

    /* ── Scroll-triggered fade-in animations ── */
    const scrollTargets = document.querySelectorAll(
        'h1:not(.page-title), h2, h3, .image-row, .gallery, .square-box, ' +
        '.block-color-default.callout, figure.image, .bulleted-list'
    );
    scrollTargets.forEach(el => el.classList.add('animate-on-scroll'));

    /* ── Staggered entrance for tech-gallery items ── */
    document.querySelectorAll('.item').forEach((el, i) => {
        el.style.setProperty('--delay', `${i * 0.06}s`);
        el.classList.add('animate-stagger');
    });

    /* ── Intersection Observer ── */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll, .animate-stagger')
        .forEach(el => observer.observe(el));

    /* ── Floating profile picture ── */
    const profileImg = document.querySelector('figure.image img');
    if (profileImg) profileImg.classList.add('profile-float');

    /* ── Particle background ── */
    spawnParticles();

    /* ── Expandable cards ── */
    initExpandableCards();

    /* ── Lightbox ── */
    initLightbox();
});

function initExpandableCards() {
    document.querySelectorAll('.expandable-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Let links navigate normally
            if (e.target.closest('a')) return;
            // Let lightbox handle images inside an already-expanded card
            if (e.target.tagName === 'IMG' && this.classList.contains('expanded')) return;
            this.classList.toggle('expanded');
        });
    });
}

function initLightbox() {
    // Build overlay DOM once
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <span class="lightbox-close" title="Close">&times;</span>
        <img class="lightbox-img" src="" alt="">
        <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(overlay);

    const img     = overlay.querySelector('.lightbox-img');
    const caption = overlay.querySelector('.lightbox-caption');

    function open(src, alt) {
        img.src = src;
        img.alt = alt;
        caption.textContent = alt;
        overlay.style.display = 'flex';
        // Force reflow so transition fires
        requestAnimationFrame(() => overlay.classList.add('active'));
        document.body.style.overflow = 'hidden';
    }

    function close() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { overlay.style.display = 'none'; img.src = ''; }, 260);
    }

    // Click images in experience cards
    document.querySelectorAll('.exp-images-strip img').forEach(el => {
        el.addEventListener('click', () => open(el.src, el.alt));
    });

    // Close on overlay background or X button
    overlay.addEventListener('click', e => { if (e.target !== img) close(); });
    overlay.querySelector('.lightbox-close').addEventListener('click', close);

    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });
}

/* ── Floating particles canvas ── */
function spawnParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-bg';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0', left: '0',
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: '-1',
        opacity: '0.45'
    });
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['210,80%,75%', '260,70%,80%', '190,65%,72%', '340,60%,78%'];
    const dots = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.8,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: 0.25 + Math.random() * 0.3
    }));

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${d.c},${d.a})`;
            ctx.fill();
            d.x += d.dx; d.y += d.dy;
            if (d.x < 0 || d.x > canvas.width)  d.dx *= -1;
            if (d.y < 0 || d.y > canvas.height) d.dy *= -1;
        });
        requestAnimationFrame(draw);
    })();
}
