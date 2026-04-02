document.addEventListener('DOMContentLoaded', function () {

    /* ── Scroll-triggered fade-in animations ── */
    const scrollTargets = document.querySelectorAll(
        'h1:not(.page-title), h2, h3, .image-row, .gallery, .square-box, ' +
        '.block-color-default.callout, figure.image, .bulleted-list'
    );
    scrollTargets.forEach(el => el.classList.add('animate-on-scroll'));

    /* ── Section labels slide in from left ── */
    document.querySelectorAll('.exp-section-label').forEach(el => el.classList.add('animate-label'));

    /* ── Filter bars fade in ── */
    document.querySelectorAll('.work-filter-bar, .project-filter-bar').forEach(el => el.classList.add('animate-filterbar'));

    /* ── Cards scroll in with stagger per section ── */
    document.querySelectorAll('.exp-card, .project-card, .teaching-card').forEach((el, i) => {
        el.style.setProperty('--delay', `${(i % 8) * 0.08}s`);
        el.classList.add('animate-card');
    });
    /* Work cards: animate .work-content so the visual card slides in */
    document.querySelectorAll('.work-card').forEach((card, i) => {
        const content = card.querySelector('.work-content');
        if (!content) return;
        content.style.setProperty('--delay', `${(i % 8) * 0.08}s`);
        content.classList.add('animate-card');
    });

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

    document.querySelectorAll('.animate-on-scroll, .animate-stagger, .animate-card, .animate-label, .animate-filterbar')
        .forEach(el => observer.observe(el));

    /* ── Social links stagger entrance ── */
    document.querySelectorAll('.social-link').forEach((el, i) => {
        el.style.setProperty('--delay', `${i * 0.12}s`);
        el.classList.add('animate-social');
        observer.observe(el);
    });

    /* ── About Me paragraph stagger ── */
    const aboutH1 = document.querySelector('#about_me');
    if (aboutH1) {
        let next = aboutH1.nextElementSibling;
        let i = 0;
        while (next && next.tagName !== 'H1') {
            if (next.tagName === 'P' && next.textContent.trim().length > 0) {
                next.style.setProperty('--delay', `${i * 0.1}s`);
                next.classList.add('animate-para');
                observer.observe(next);
                i++;
            }
            next = next.nextElementSibling;
        }
    }

    /* ── Skillset items slide in from left ── */
    document.querySelectorAll('h1').forEach(h => {
        if (h.textContent.trim().includes('Skillset')) {
            let next = h.nextElementSibling;
            let i = 0;
            while (next && next.tagName !== 'H1') {
                if (next.tagName === 'P' && next.textContent.trim().length > 0) {
                    next.style.setProperty('--delay', `${i * 0.09}s`);
                    next.classList.add('animate-skill');
                    observer.observe(next);
                    i++;
                }
                next = next.nextElementSibling;
            }
        }
    });

    /* ── Floating profile picture ── */
    const profileImg = document.querySelector('figure.image img');
    if (profileImg) profileImg.classList.add('profile-float');

    /* ── Particle background ── */
    spawnParticles();

    /* ── Scroll progress bar ── */
    initScrollProgress();

    /* ── Cursor spotlight ── */
    initCursorSpotlight();

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
            // Let lightbox handle content images inside an already-expanded card (not the logo)
            if (e.target.tagName === 'IMG' && e.target.closest('.exp-images-strip') && this.classList.contains('expanded')) return;
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

    const MAX_DIST = 120;
    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        /* constellation lines */
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = `rgba(82,141,250,${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
        /* dots */
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

/* ── Scroll progress bar + back-to-top visibility ── */
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);

    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
        if (btn) {
            if (scrolled > 400) btn.classList.add('visible');
            else btn.classList.remove('visible');
        }
    }, { passive: true });

    if (btn) {
        btn.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ── Cursor spotlight ── */
function initCursorSpotlight() {
    const spot = document.createElement('div');
    spot.id = 'cursor-spotlight';
    document.body.appendChild(spot);
    window.addEventListener('mousemove', e => {
        spot.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    }, { passive: true });
}
