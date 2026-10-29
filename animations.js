/* =========================================================
   Interactions for index.html and personal_life.html
   - light/dark mode toggle (remembered across pages)
   - filter buttons (experience, projects, publications)
   - detail pop-ups for experience, education and projects
   - "3 years" counter
   - music artist switcher and gallery lightbox
   ========================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Light / dark mode ---------- */
  const toggle = $('#themeToggle');
  const setIcon = () => { if (toggle) toggle.textContent = document.documentElement.classList.contains('dark') ? '☀' : '☾'; };
  setIcon();
  if (toggle) toggle.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('jg-theme', dark ? 'dark' : 'light'); } catch (e) {}
    setIcon();
  });

  /* ---------- Filters ---------- */
  function setupFilter(group, items, match) {
    const bar = $(`[data-filter-group="${group}"]`);
    if (!bar) return;
    const apply = (val) => {
      $$('button', bar).forEach(b => b.classList.toggle('active', b.dataset.filter === val));
      items().forEach(el => { el.hidden = !(val === 'all' || match(el, val)); });
    };
    bar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) apply(b.dataset.filter); });
    const start = $('button.active', bar);
    apply(start ? start.dataset.filter : 'all');
  }
  setupFilter('work', () => $$('.work-card'), (el, v) => el.dataset.type === v);
  setupFilter('proj', () => $$('.proj-card'), (el, v) => el.dataset.lang.split(' ').includes(v));
  setupFilter('pub', () => $$('.pub'), (el, v) => el.dataset.status === v);

  /* ---------- Detail pop-up ---------- */
  const modal = $('#modal');
  if (modal) {
    const body = $('.modal-body', modal);
    const open = (el) => {
      const tpl = $('template.detail', el);
      if (!tpl) return;
      body.innerHTML = '';
      body.appendChild(tpl.content.cloneNode(true));
      modal.hidden = false;
      $('.modal-box', modal).scrollTop = 0;
      document.body.style.overflow = 'hidden';
    };
    const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
    document.addEventListener('click', e => {
      const link = e.target.closest('.proj-link');
      if (link) { e.preventDefault(); const t = document.getElementById(link.dataset.open); if (t) open(t); return; }
      const card = e.target.closest('[data-open]');
      if (card && !modal.contains(card)) open(card);
    });
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-close')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  /* ---------- Counter ---------- */
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count; let n = 0; el.textContent = '0';
    const t = setInterval(() => { n++; el.textContent = n; if (n >= target) clearInterval(t); }, 140);
  });

  /* ---------- Music: switch artist ---------- */
  const loadSongs = (panel) => $$('iframe[data-src]', panel).forEach(f => { f.src = f.dataset.src; f.removeAttribute('data-src'); });
  const firstSongs = $('.songs:not([hidden])');
  if (firstSongs) loadSongs(firstSongs);
  const songsPanel = $('.songs-panel');
  const artistsWrap = $('.artists');
  const narrow = matchMedia('(max-width: 760px)');
  // On phones, show the songs directly under the selected artist; otherwise below the whole grid
  const placePanel = () => {
    const active = $('.artist.active');
    if (!songsPanel || !artistsWrap) return;
    if (narrow.matches && active) active.after(songsPanel);
    else artistsWrap.after(songsPanel);
  };
  narrow.addEventListener('change', placePanel);
  placePanel();
  $$('.artist').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.artist;
    $$('.artist').forEach(b => b.classList.toggle('active', b === btn));
    $$('.songs').forEach(p => { p.hidden = p.dataset.artist !== key; if (!p.hidden) loadSongs(p); });
    placePanel();
    if (narrow.matches && songsPanel) songsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));

  /* ---------- Gallery lightbox ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const photos = $$('.photo');
    const img = $('img', lb), cap = $('figcaption', lb);
    let i = 0;
    const show = (k) => {
      i = (k + photos.length) % photos.length;
      const p = $('img', photos[i]);
      img.src = p.src; img.alt = p.alt;
      cap.textContent = `${p.alt}  ·  ${i + 1} / ${photos.length}`;
      lb.hidden = false;
    };
    const close = () => { lb.hidden = true; };
    photos.forEach((p, k) => p.addEventListener('click', () => show(k)));
    $('.lb-prev', lb).addEventListener('click', e => { e.stopPropagation(); show(i - 1); });
    $('.lb-next', lb).addEventListener('click', e => { e.stopPropagation(); show(i + 1); });
    $('.lb-close', lb).addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
  }
})();
