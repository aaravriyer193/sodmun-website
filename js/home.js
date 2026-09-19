import { ready, observe, videoModal, ICON } from './site.js';
import { SITE, STATS, TESTIMONIALS } from './data.js';
import createGlobe from './vendor/cobe.js';

const $ = (s, r = document) => r.querySelector(s);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- stats ---------- */
$('#stats').innerHTML = STATS.map((s, i) => `
  <div class="stat" data-reveal style="--d:${i * 0.08}s">
    <div class="stat__v" data-count="${s.value}"><span data-count-num>0</span>${s.suffix.trim() === '+' ? '<span class="plus">+</span>' : s.suffix ? `<span class="unit">${s.suffix.trim()}</span>` : ''}</div>
    <div class="stat__l">${s.label}</div>
  </div>`).join('');

/* ---------- testimonials ---------- */
$('#quotes').innerHTML = TESTIMONIALS.map((t, i) => `
  <figure class="quote" data-reveal style="--d:${i * 0.12}s">
    <blockquote>${t.quote}</blockquote>
    <figcaption><strong style="font-weight:500">${t.name}</strong><span>${t.role}</span></figcaption>
  </figure>`).join('');

/* ---------- Ask AI ---------- */
const AIS = [
  { name: 'ChatGPT', url: (q) => `https://chatgpt.com/?q=${q}` },
  { name: 'Claude', url: (q) => `https://claude.ai/new?q=${q}` },
  { name: 'Perplexity', url: (q) => `https://www.perplexity.ai/search/new?q=${q}` },
  { name: 'Gemini', url: (q) => `https://gemini.google.com/app?prompt=${q}` },
];
const ask = $('#ask-q');
$('#ais').innerHTML = AIS.map((a, i) => `<a class="ai-btn" data-ai="${i}" href="#" target="_blank" rel="noopener">${a.name} ${ICON.out}</a>`).join('');
const syncAI = () => {
  const q = encodeURIComponent(ask.value.trim() || 'Tell me about Summit of Diplomacy MUN (sodmun.com)');
  document.querySelectorAll('.ai-btn').forEach((b) => { b.href = AIS[+b.dataset.ai].url(q); });
};
ask.addEventListener('input', syncAI);
document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => { ask.value = c.dataset.q; syncAI(); ask.focus(); }));
syncAI();

/* ---------- platform features ---------- */
const features = [...document.querySelectorAll('.feature')];
const shots = [...document.querySelectorAll('#screens img')];
const activate = (li) => {
  features.forEach((f) => { const on = f === li; f.classList.toggle('is-active', on); f.querySelector('button').setAttribute('aria-expanded', String(on)); });
  shots.forEach((s) => s.classList.toggle('is-active', s.dataset.shot === li.dataset.shot));
};
features.forEach((f) => f.querySelector('button').addEventListener('click', () => activate(f)));
$('#tutorial').addEventListener('click', () => videoModal(SITE.tutorial));

/* ---------- Dubai clock ---------- */
const clock = $('#dxb-time');
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const tickClock = () => { clock.textContent = fmt.format(new Date()) + ' GST'; };
tickClock(); setInterval(tickClock, 1000);

/* ---------- globe ---------- */
function initGlobe() {
  const canvas = $('#globe');
  if (!canvas) return;
  const DUBAI = [25.2048, 55.2708];
  const INDIA = [23.2599, 77.4126];
  const toPhi = (lon) => Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2);

  let width = 0;
  let phi = toPhi(60), theta = 0.32;
  let pointer = null, dragPhi = 0, dragTheta = 0, velocity = 0;
  let globe, visible = false;

  const size = () => { width = canvas.offsetWidth; };
  size();
  window.addEventListener('resize', () => { size(); globe && globe.update({ width: width * 2, height: width * 2 }); });

  globe = createGlobe(canvas, {
    devicePixelRatio: 2,
    width: width * 2,
    height: width * 2,
    phi, theta,
    dark: 0,
    diffuse: 1.1,
    scale: 1,
    mapSamples: 22000,
    mapBrightness: 7,
    mapBaseBrightness: 0,
    baseColor: [0.97, 0.975, 0.98],
    markerColor: [0.13, 0.145, 0.16],
    glowColor: [0.94, 0.945, 0.95],
    arcColor: [0.13, 0.145, 0.16],
    arcWidth: 0.6,
    arcHeight: 0.28,
    markerElevation: 0.01,
    opacity: 0.92,
    markers: [
      { location: DUBAI, size: 0.07 },
      { location: INDIA, size: 0.035 },
    ],
    arcs: [{ from: DUBAI, to: INDIA }],
  });

  canvas.addEventListener('pointerdown', (e) => { pointer = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointer) return;
    const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
    dragPhi += dx / 180; dragTheta = Math.max(-0.6, Math.min(0.6, dragTheta + dy / 400));
    velocity = dx / 180;
    pointer = { x: e.clientX, y: e.clientY };
  });
  const release = () => { pointer = null; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(canvas);

  const loop = () => {
    if (visible) {
      if (!pointer) {
        if (!reduceMotion) phi += 0.0022;
        dragPhi += velocity; velocity *= 0.94;
      }
      globe.update({ phi: phi + dragPhi, theta: theta + dragTheta });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  setTimeout(() => canvas.classList.add('is-ready'), 120);
}

try { initGlobe(); } catch (e) { console.warn('Globe unavailable', e); }

ready.then(() => observe());
