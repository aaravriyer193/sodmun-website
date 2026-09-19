import { SITE, NAV } from './data.js';

export const ICON = {
  arrow: '<svg class="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" stroke-width="1.2"/></svg>',
  out: '<svg class="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12L12 4M5 4h7v7" stroke="currentColor" stroke-width="1.2"/></svg>',
  left: '<svg class="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M15 8H2M7 3L2 8l5 5" stroke="currentColor" stroke-width="1.2"/></svg>',
  play: '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
  close: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.2"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.2"/></svg>',
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

/* ------------------------------------------------------------------
   Header, drawer, footer
------------------------------------------------------------------- */
function renderShell() {
  const onDark = document.body.dataset.header === 'dark';
  const current = (href) => (here === href || (here === 'committee.html' && href === 'committees.html')) ? ' aria-current="page"' : '';

  const header = document.createElement('header');
  header.className = 'header' + (onDark ? ' header--on-dark' : '');
  header.innerHTML = `
    <div class="wrap header__in">
      <a class="brand" href="index.html" aria-label="SODMUN home">
        <span class="mark" aria-hidden="true"></span>
        <span class="brand__word">SODMUN</span>
      </a>
      <nav class="nav" aria-label="Primary">
        ${NAV.map(n => `<a href="${n.href}"${current(n.href)}>${n.label}</a>`).join('')}
      </nav>
      <div class="nav__cta">
        <a class="btn btn--ghost" href="${SITE.platform}" target="_blank" rel="noopener">Platform</a>
        <a class="btn" href="applications.html"${current('applications.html')}>Apply</a>
        <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span></button>
      </div>
    </div>`;

  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.id = 'drawer';
  drawer.setAttribute('aria-hidden', 'true');
  const links = [{ href: 'index.html', label: 'Home' }, ...NAV, { href: 'applications.html', label: 'Applications' }];
  drawer.innerHTML = `
    <nav class="drawer__links" aria-label="Mobile">
      ${links.map((n, i) => `<a href="${n.href}" style="transition-delay:${0.12 + i * 0.04}s"${current(n.href)}>${n.label}<small>${String(i + 1).padStart(2, '0')}</small></a>`).join('')}
    </nav>
    <div class="drawer__foot">
      <div class="btn-row">
        <a class="btn" href="applications.html">Apply ${ICON.arrow}</a>
        <a class="btn btn--ghost" href="${SITE.platform}" target="_blank" rel="noopener">Platform</a>
      </div>
      <div>${SITE.email} · ${SITE.phone}</div>
    </div>`;

  document.body.prepend(drawer);
  document.body.prepend(header);
  const skip = document.createElement('a');
  skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
  document.body.prepend(skip);

  const burger = header.querySelector('.burger');
  const toggle = (open) => {
    document.documentElement.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.setAttribute('aria-hidden', String(!open));
  };
  burger.addEventListener('click', () => toggle(!document.documentElement.classList.contains('menu-open')));
  drawer.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });

  // scrolled / hide-on-scroll
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const menuOpen = document.documentElement.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > 400 && y > last + 2);
    if (y < last - 2) header.classList.remove('is-hidden');
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="wrap">
      <div class="footer__top">
        <div class="footer__lead">
          <a class="brand" href="index.html"><span class="mark" aria-hidden="true"></span><span class="brand__word">SODMUN</span></a>
          <p>Summit of Diplomacy Model United Nations. The largest teen-led conference in the world, made by MUNers, for MUNers.</p>
        </div>
        <div>
          <h4>Conference</h4>
          <ul>
            <li><a href="about.html">About</a></li>
            <li><a href="secretariat.html">Secretariat</a></li>
            <li><a href="committees.html">Committees</a></li>
            <li><a href="schedule.html">Schedule</a></li>
          </ul>
        </div>
        <div>
          <h4>Take part</h4>
          <ul>
            <li><a href="applications.html">Applications</a></li>
            <li><a href="partners.html">Partners</a></li>
            <li><a href="${SITE.platform}" target="_blank" rel="noopener">Platform</a></li>
            <li><a href="${SITE.delegateResources}" target="_blank" rel="noopener">Delegate resources</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li><a href="${SITE.phoneHref}">${SITE.phone}</a></li>
            <li><a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__word" aria-hidden="true"><span>SODMUN</span><i class="mark"></i></div>
      <div class="footer__bottom">
        <span>© ${new Date().getFullYear()} Summit of Diplomacy MUN · ${SITE.city}</span>
        <span>Made by Aarav Iyer &amp; Aya Aladdin, with the help of the Secretariat</span>
      </div>
    </div>`;
  document.body.append(footer);
}

/* ------------------------------------------------------------------
   Reveal on scroll
------------------------------------------------------------------- */
export function splitLines(root = document) {
  root.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    const base = parseFloat(el.dataset.delay || 0);
    el.innerHTML = parts.map((p, i) => `<span class="split-line"><span style="--d:${(base + i * 0.09).toFixed(2)}s">${p.trim()}</span></span>`).join('');
    el.dataset.splitDone = '1';
    el.setAttribute('data-reveal-split', '');
  });
}

let io;
export function observe(root = document) {
  splitLines(root);
  const els = root.querySelectorAll('[data-reveal], [data-reveal-split], [data-img-reveal], [data-count]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => { el.classList.add('is-in'); if (el.dataset.count) countUp(el, true); });
    return;
  }
  io = io || new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

function countUp(el, instant) {
  const to = parseFloat(el.dataset.count);
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const node = el.querySelector('[data-count-num]') || el;
  if (instant) { node.textContent = fmt(to); return; }
  const dur = 1800; const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    node.textContent = fmt(to * (1 - Math.pow(1 - k, 4)));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------
   Modal
------------------------------------------------------------------- */
export function modal({ html, className = '', onClose } = {}) {
  const m = document.createElement('div');
  m.className = 'modal ' + className;
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="modal__box"><button class="modal__close" aria-label="Close">Close <span>${ICON.close}</span></button>${html}</div>`;
  document.body.append(m);
  document.body.classList.add('is-locked');
  const prev = document.activeElement;
  requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('is-open')));
  const close = () => {
    m.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.removeEventListener('keydown', onKey);
    onClose && onClose();
    setTimeout(() => { m.remove(); prev && prev.focus && prev.focus(); }, 500);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  window.addEventListener('keydown', onKey);
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.modal__close')) close(); });
  setTimeout(() => m.querySelector('.modal__close').focus(), 50);
  return { el: m, close };
}

export function videoModal(src) {
  modal({ className: 'modal--video', html: `<div class="modal__video"><iframe src="${src}" title="SODMUN platform tutorial" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>` });
}

/* ------------------------------------------------------------------
   Interactive loader (home only, once per session)
------------------------------------------------------------------- */
function runLoader() {
  const el = document.querySelector('.loader');
  if (!el) return Promise.resolve();
  if (document.documentElement.classList.contains('no-loader')) { el.remove(); return Promise.resolve(); }

  document.body.classList.add('is-locked');
  const tilt = el.querySelector('.loader__tilt');
  const spin = el.querySelector('.loader__spin');
  const ghost = el.querySelector('.loader__ring-ghost');
  const countEl = el.querySelector('.loader__count');
  const hint = el.querySelector('.loader__hint');

  let progress = 0, target = 0, loaded = false;
  let angle = 0, vel = 0.12, dragging = false, lastA = 0, lastT = 0;
  const t0 = performance.now();
  const MIN = reduceMotion ? 400 : 2200;

  // Real progress: images on the page + window load, smoothed and never faster than MIN
  const imgs = [...document.images].filter((i) => !i.complete);
  let done = 0; const total = Math.max(1, imgs.length);
  imgs.forEach((i) => { const f = () => { done++; }; i.addEventListener('load', f, { once: true }); i.addEventListener('error', f, { once: true }); });
  if (document.readyState === 'complete') loaded = true;
  else window.addEventListener('load', () => { loaded = true; }, { once: true });

  const rect = () => el.querySelector('.loader__stage').getBoundingClientRect();
  const angleAt = (x, y) => { const r = rect(); return Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180 / Math.PI; };

  const onMove = (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    tilt.style.transform = `rotateX(${(-y * 22).toFixed(2)}deg) rotateY(${(x * 22).toFixed(2)}deg)`;
    if (dragging) {
      const a = angleAt(e.clientX, e.clientY); let d = a - lastA;
      if (d > 180) d -= 360; if (d < -180) d += 360;
      const now = performance.now(); angle += d; vel = d / Math.max(16, now - lastT) * 16; lastA = a; lastT = now;
    }
  };
  const onDown = (e) => { dragging = true; el.classList.add('is-grabbing'); lastA = angleAt(e.clientX, e.clientY); lastT = performance.now(); hint.textContent = 'Spin it'; };
  const onUp = () => { dragging = false; el.classList.remove('is-grabbing'); };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  return new Promise((resolve) => {
    let finished = false, raf;
    const finish = () => {
      if (finished) return; finished = true;
      el.classList.add('is-leaving');
      document.body.classList.remove('is-locked');
      try { sessionStorage.setItem('sodmun-loaded', '1'); } catch (e) {}
      resolve();
      setTimeout(() => { cancelAnimationFrame(raf); el.remove(); window.removeEventListener('pointerup', onUp); }, 1200);
    };
    el.querySelector('.loader__skip')?.addEventListener('click', finish);
    window.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'Escape') finish(); }, { once: true });

    let reachedAt = 0;
    const frame = (t) => {
      const timeK = Math.min(1, (t - t0) / MIN);
      const imgK = done / total;
      target = Math.min(loaded ? 100 : 92, Math.max(imgK * 90, 0) * 0.4 + timeK * 100 * 0.6 + (loaded ? timeK * 40 : 0));
      if (loaded && timeK >= 1) target = 100;
      progress += (target - progress) * 0.08;
      if (target === 100 && progress > 99.6) progress = 100;
      el.style.setProperty('--p', progress.toFixed(2));
      countEl.textContent = String(Math.floor(progress)).padStart(3, '0');

      if (!dragging) { vel += (0.12 - vel) * 0.02; angle += vel; }
      spin.style.transform = ghost.style.transform = `rotate(${angle.toFixed(2)}deg)`;

      if (progress >= 100) {
        if (!reachedAt) { reachedAt = t; hint.textContent = 'Welcome to the summit'; vel = Math.max(vel, 6); }
        if (!dragging && t - reachedAt > 700) return finish();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });
}

/* ------------------------------------------------------------------
   Boot
------------------------------------------------------------------- */
renderShell();
export const ready = runLoader().then(() => { observe(); });
// Pages that render content after load call observe() themselves.
