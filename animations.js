document.addEventListener('DOMContentLoaded', function () {

	/* ── Scroll-triggered fade-in ── */
	document.querySelectorAll(
		'.stat-card, .pub-item, .cert-category, .lang-box, .log-box, ' +
		'.about-bio p, .teaching-card, .kpi'
	).forEach(el => el.classList.add('animate-on-scroll'));

	/* ── Section labels ── */
	document.querySelectorAll('.exp-sub-label, .exp-section-label').forEach(el => el.classList.add('animate-label'));

	/* ── Filter bars ── */
	document.querySelectorAll('.work-filter-bar, .project-filter-bar').forEach(el => el.classList.add('animate-filterbar'));

	/* ── Cards ── */
	document.querySelectorAll('.exp-card, .teaching-card').forEach((el, i) => {
		el.style.setProperty('--delay', `${(i % 8) * 0.07}s`);
		el.classList.add('animate-card');
	});
	document.querySelectorAll('.work-card').forEach((card, i) => {
		const content = card.querySelector('.work-content');
		if (!content) return;
		content.style.setProperty('--delay', `${(i % 8) * 0.07}s`);
		content.classList.add('animate-card');
	});

	/* ── Section labels ── */
	document.querySelectorAll('.section-label').forEach(el => {
		el.classList.add('animate-section-title');
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

	document.querySelectorAll(
		'.animate-on-scroll, .animate-card, .animate-label, ' +
		'.animate-filterbar, .animate-section-title, .kpi, .work-card'
	).forEach(el => observer.observe(el));

	/* ── All init calls ── */
	initScrollProgress();
	initCursorSpotlight();
	initActiveSidebarNav();
	initExpandableCards();
	initSectionCollapse();
	initLightbox();
	initClickRipple();
	initCardShine();
	initTimelinePulse();
	initBurgerMenu();
	initDarkToggle();
	initWorkFilter();
	initProjectFilter();
	initKPICounters();
	initCardTilt();
	initMagneticButtons();
	initWorkTimelineDots();
});

/* ── Scroll progress bar ── */
function initScrollProgress() {
	const bar = document.createElement('div');
	bar.id = 'scroll-progress';
	document.body.prepend(bar);

	const btn = document.getElementById('backToTop');
	window.addEventListener('scroll', () => {
		const scrolled = window.scrollY;
		const total = document.documentElement.scrollHeight - window.innerHeight;
		bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
		if (btn) btn.classList.toggle('visible', scrolled > 400);
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

/* ── Active sidebar nav ── */
function initActiveSidebarNav() {
	const sectionIds = ['about_me', 'education', 'experience', 'publications', 'technical_summary', 'certifications'];
	const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
	const links = document.querySelectorAll('.sidebar-link[data-section]');

	function update() {
		const mobileH = document.getElementById('mobileHeader');
		const offset = (mobileH && mobileH.offsetParent !== null) ? mobileH.offsetHeight + 8 : 20;
		let currentId = null;
		let bestTop = -Infinity;
		sections.forEach(sec => {
			const top = sec.getBoundingClientRect().top;
			if (top <= offset + 40 && top > bestTop) { bestTop = top; currentId = sec.id; }
		});
		const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60;
		if (nearBottom && sections.length) currentId = sections[sections.length - 1].id;

		links.forEach(link => {
			link.classList.toggle('active', link.dataset.section === currentId);
		});
	}
	window.addEventListener('scroll', update, { passive: true });
	update();
}

/* ── Expandable cards ── */
function initExpandableCards() {
	document.querySelectorAll('.expandable-card').forEach(card => {
		const summary = card.querySelector('.card-summary');
		const hint    = card.querySelector('.card-hint');
		if (summary) {
			summary.setAttribute('tabindex', '0');
			summary.setAttribute('role', 'button');
			summary.setAttribute('aria-expanded', 'false');
			summary.addEventListener('keydown', e => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(e); }
			});
		}
		function doToggle(e) {
			if (e.target.closest('a')) return;
			if (e.target.tagName === 'IMG' && e.target.closest('.exp-images-strip') && card.classList.contains('expanded')) return;
			const expanded = card.classList.toggle('expanded');
			if (summary) summary.setAttribute('aria-expanded', String(expanded));
			if (hint) hint.textContent = expanded ? 'Click to collapse ▴' : 'Click to expand ▾';
		}
		card.addEventListener('click', doToggle);
	});
}

/* ── Section collapse ── */
function initSectionCollapse() {
	setupCollapse('.work-timeline', '.work-card', 'work-show-more');
	setupCollapse('#project-timeline', '.exp-card', 'project-show-more');
}

function setupCollapse(containerSel, cardSel, btnId) {
	const container = document.querySelector(containerSel);
	const btn = document.getElementById(btnId);
	if (!container || !btn) return;
	const cards = Array.from(container.querySelectorAll(cardSel));
	let isCollapsed = true;

	// Returns cards currently visible (not hidden by a filter)
	function filterVisible() {
		return cards.filter(c => !c.classList.contains('hidden'));
	}

	function applyCollapse() {
		const visible = filterVisible();
		const showCount = Math.min(2, visible.length); // always show up to 2 matching cards
		if (!isCollapsed || visible.length <= showCount) {
			// Expanded, or not enough results to collapse — show everything
			cards.forEach(c => c.classList.remove('section-hidden'));
		} else {
			// Collapsed — keep first showCount filter-visible cards, hide the rest
			const keep = new Set(visible.slice(0, showCount));
			cards.forEach(c => {
				const shouldHide = !c.classList.contains('hidden') && !keep.has(c);
				c.classList.toggle('section-hidden', shouldHide);
			});
		}
		btn.innerHTML = isCollapsed ? 'Show more &#x25BE;' : 'Show less &#x25B4;';
		const btnHidden = visible.length <= showCount;
		btn.style.display = btnHidden ? 'none' : '';
		container.style.marginBottom = btnHidden ? '52px' : '';
	}

	applyCollapse();

	const obs = new MutationObserver(mutations => {
		const affectsHidden = mutations.some(m => {
			const oldHidden = m.oldValue ? m.oldValue.split(' ').includes('hidden') : false;
			const newHidden = m.target.classList.contains('hidden');
			return oldHidden !== newHidden;
		});
		if (affectsHidden) applyCollapse();
	});
	cards.forEach(card => obs.observe(card, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }));

	btn.addEventListener('click', () => {
		isCollapsed = !isCollapsed;
		applyCollapse();
	});
}

/* ── Lightbox ── */
function initLightbox() {
	const overlay = document.createElement('div');
	overlay.className = 'lightbox-overlay';
	overlay.innerHTML = `
		<span class="lightbox-close" title="Close">&times;</span>
		<img class="lightbox-img" src="" alt="">
		<div class="lightbox-caption"></div>
	`;
	document.body.appendChild(overlay);
	const img = overlay.querySelector('.lightbox-img');
	const caption = overlay.querySelector('.lightbox-caption');

	function open(src, alt) {
		img.src = src; img.alt = alt; caption.textContent = alt;
		overlay.style.display = 'flex';
		requestAnimationFrame(() => overlay.classList.add('active'));
		document.body.style.overflow = 'hidden';
	}
	function close() {
		overlay.classList.remove('active');
		document.body.style.overflow = '';
		setTimeout(() => { overlay.style.display = 'none'; img.src = ''; }, 260);
	}
	document.querySelectorAll('.exp-images-strip img').forEach(el => {
		el.addEventListener('click', () => open(el.src, el.alt));
	});
	overlay.addEventListener('click', e => { if (e.target !== img) close(); });
	overlay.querySelector('.lightbox-close').addEventListener('click', close);
	document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) close(); });
}

/* ── Click ripple ── */
function initClickRipple() {
	document.querySelectorAll('.exp-card, .work-card, .project-filter-btn').forEach(el => {
		el.addEventListener('click', function(e) {
			const ripple = document.createElement('span');
			ripple.className = 'ripple-effect';
			const rect = this.getBoundingClientRect();
			const size = Math.max(rect.width, rect.height);
			Object.assign(ripple.style, {
				width: size + 'px', height: size + 'px',
				left: (e.clientX - rect.left - size / 2) + 'px',
				top:  (e.clientY - rect.top  - size / 2) + 'px',
			});
			this.appendChild(ripple);
			ripple.addEventListener('animationend', () => ripple.remove());
		});
	});
}

/* ── Card shine sweep ── */
function initCardShine() {
	document.querySelectorAll('.exp-card, .teaching-card, .stat-card, .kpi, .work-card').forEach(card => {
		card.classList.add('shine-host');
		const shine = document.createElement('span');
		shine.className = 'card-shine';
		card.appendChild(shine);
		card.addEventListener('mousemove', function(e) {
			const rect = this.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width)  * 100;
			const y = ((e.clientY - rect.top)  / rect.height) * 100;
			shine.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(26,86,219,0.07) 0%, transparent 65%)`;
			shine.style.opacity = '1';
		});
		card.addEventListener('mouseleave', function() { shine.style.opacity = '0'; });
	});
}

/* ── Work timeline dots (placed as siblings so they're unaffected by card overflow) ── */
function initWorkTimelineDots() {
	const timeline = document.querySelector('.work-timeline');
	if (!timeline) return;

	function placeDots() {
		timeline.querySelectorAll('.tl-dot').forEach(d => d.remove());
		const cards = Array.from(timeline.querySelectorAll('.work-card')).filter(
			c => !c.classList.contains('section-hidden') && !c.classList.contains('hidden')
		);
		cards.forEach((card, i) => {
			const dot = document.createElement('span');
			dot.className = 'tl-dot';
			if (i === 0) dot.classList.add('pulse');
			dot.style.top = (card.offsetTop + 22) + 'px';
			timeline.appendChild(dot);
		});
	}

	requestAnimationFrame(placeDots);

	// Reposition when cards are shown/hidden (filter / show-more)
	const mo = new MutationObserver(() => setTimeout(placeDots, 60));
	timeline.querySelectorAll('.work-card').forEach(card => {
		mo.observe(card, { attributes: true, attributeFilter: ['class'] });
	});
	window.addEventListener('resize', () => requestAnimationFrame(placeDots));
}

/* ── Work logo pulse ── */
function initTimelinePulse() {
	const obs = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) { entry.target.classList.add('logo-pulse'); obs.unobserve(entry.target); }
		});
	}, { threshold: 0.6 });
	document.querySelectorAll('.work-logo').forEach(el => obs.observe(el));
}

/* ── Burger menu (mobile sidebar toggle) ── */
function initBurgerMenu() {
	const burger   = document.getElementById('burgerBtn');
	const sidebar  = document.getElementById('sidebar');
	const overlay  = document.createElement('div');
	overlay.id = 'sidebar-overlay';
	Object.assign(overlay.style, {
		position: 'fixed', inset: '0',
		background: 'rgba(0,0,0,0.4)',
		zIndex: '199',
		display: 'none'
	});
	document.body.appendChild(overlay);

	function open()  { sidebar.classList.add('open');  burger.classList.add('open');  overlay.style.display = 'block'; document.body.style.overflow = 'hidden'; }
	function close() { sidebar.classList.remove('open'); burger.classList.remove('open'); overlay.style.display = 'none'; document.body.style.overflow = ''; }

	if (burger) burger.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
	overlay.addEventListener('click', close);

	/* Close sidebar on nav link click (mobile) */
	document.querySelectorAll('.sidebar-link').forEach(link => {
		link.addEventListener('click', () => {
			if (window.innerWidth < 769) close();
		});
	});
}

/* ── Dark mode toggle ── */
function initDarkToggle() {
	const mobileBtn  = document.getElementById('nightToggle');
	const desktopBtn = document.getElementById('nightToggleDesktop');

	// Sync button emoji with current state (class may already be on body from FOUC script)
	function syncEmoji() {
		const isDark = document.body.classList.contains('dark');
		[mobileBtn, desktopBtn].forEach(btn => {
			if (btn) btn.textContent = isDark ? '☀️' : '🌙';
		});
	}
	syncEmoji();

	function toggle() {
		document.body.classList.toggle('dark');
		const isDark = document.body.classList.contains('dark');
		localStorage.setItem('theme-v4', isDark ? 'dark' : 'light');
		syncEmoji();
	}
	if (mobileBtn)  mobileBtn.addEventListener('click', toggle);
	if (desktopBtn) desktopBtn.addEventListener('click', toggle);
}

/* ── Work filter ── */
function initWorkFilter() {
	const btns      = document.querySelectorAll('[data-work-filter]');
	const cards     = document.querySelectorAll('.work-card[data-type]');
	const emptyState = document.getElementById('work-empty-state');

	btns.forEach(btn => {
		btn.addEventListener('click', () => {
			btns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const filter = btn.dataset.workFilter;
			let visible = 0;
			cards.forEach(card => {
				const match = filter === 'all' || card.dataset.type === filter;
				card.classList.toggle('hidden', !match);
				if (match) visible++;
			});
			if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
		});
	});
}

/* ── KPI counter animation ── */
function initKPICounters() {
	document.querySelectorAll('.kpi-num').forEach(el => {
		const raw = el.textContent.trim();
		const num = parseFloat(raw);
		if (isNaN(num)) return; // skip text-only like "MS", "BS"
		const suffix = raw.replace(String(num), '');
		el.textContent = '0' + suffix;
		const obs = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (!entry.isIntersecting) return;
				obs.unobserve(entry.target);
				const start = performance.now();
				const duration = 900;
				function step(now) {
					const t = Math.min((now - start) / duration, 1);
					const eased = 1 - Math.pow(1 - t, 3);
					el.textContent = (Number.isInteger(num) ? Math.round(eased * num) : (eased * num).toFixed(1)) + suffix;
					if (t < 1) requestAnimationFrame(step);
				}
				requestAnimationFrame(step);
			});
		}, { threshold: 0.6 });
		obs.observe(el.closest('.kpi') || el);
	});
}

/* ── Card tilt effect (project cards only — work cards have timeline dots that move with transforms) ── */
function initCardTilt() {
	document.querySelectorAll('.exp-card').forEach(card => {
		card.addEventListener('mousemove', function(e) {
			const rect = this.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;
			this.style.transform = `perspective(900px) rotateY(${x * 3}deg) rotateX(${-y * 2}deg) translateZ(2px)`;
			this.style.transition = 'transform 0.08s ease';
		});
		card.addEventListener('mouseleave', function() {
			this.style.transform = '';
			this.style.transition = 'transform 0.35s ease, box-shadow 0.2s, border-color 0.2s';
		});
	});
}

/* ── Magnetic buttons ── */
function initMagneticButtons() {
	document.querySelectorAll('.sidebar-social-btn').forEach(btn => {
		btn.addEventListener('mousemove', function(e) {
			const rect = this.getBoundingClientRect();
			const x = e.clientX - rect.left - rect.width / 2;
			const y = e.clientY - rect.top - rect.height / 2;
			this.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
			this.style.transition = 'transform 0.1s ease';
		});
		btn.addEventListener('mouseleave', function() {
			this.style.transform = '';
			this.style.transition = 'transform 0.4s ease';
		});
	});
}

/* ── Project filter ── */
function initProjectFilter() {
	const btns   = document.querySelectorAll('[data-project-filter]');
	const cards  = document.querySelectorAll('.exp-card[data-tag]');
	const emptyState = document.getElementById('project-empty-state');

	btns.forEach(btn => {
		btn.addEventListener('click', () => {
			btns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const filter = btn.dataset.projectFilter;
			let visible = 0;
			cards.forEach(card => {
				const tags = (card.dataset.tag || '').split(',').map(t => t.trim());
				const match = filter === 'all' || tags.includes(filter);
				card.classList.toggle('hidden', !match);
				if (match) visible++;
			});
			if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
		});
	});
}
