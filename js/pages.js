import { observe, modal, ICON } from './site.js';
import {
  SITE, COMMITTEES, COMMITTEE_TYPES, SECRETARIAT, PARTNERS, EDITIONS, SCHEDULE, APPLICATIONS,
} from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const page = document.body.dataset.page;

/* ---------------- people ---------------- */
const allPeople = SECRETARIAT.flatMap((g) => g.people);
const personCard = (p, i) => `
  <button class="person" data-person="${p.id}" data-reveal style="--d:${(i % 3) * 0.06}s">
    <div class="person__img"><img src="assets/sec/${p.id}.jpg" alt="${esc(p.name)}, ${esc(p.role)}" loading="lazy" width="640" height="800"></div>
    <div class="person__name">${esc(p.name)}</div>
    <div class="person__role">${esc(p.role)}</div>
  </button>`;

function bindPeople(list) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-person]');
    if (!btn) return;
    let i = list.findIndex((p) => p.id === btn.dataset.person);
    const render = () => {
      const p = list[i];
      return `<img src="assets/sec/${p.id}.jpg" alt="${esc(p.name)}'s SODMUN IV secretariat card">
        <div><span class="label">SODMUN IV Secretariat</span><h3 class="mt-s">${esc(p.name)}</h3><p>${esc(p.role)}</p>
        <div class="modal__nav"><button data-dir="-1" aria-label="Previous">${ICON.left}</button><button data-dir="1" aria-label="Next">${ICON.arrow}</button></div></div>`;
    };
    const m = modal({ className: 'modal--card', html: `<div class="card-body" style="display:contents">${render()}</div>` });
    const body = m.el.querySelector('.card-body');
    const go = (d) => { i = (i + d + list.length) % list.length; body.innerHTML = render(); };
    m.el.addEventListener('click', (ev) => { const b = ev.target.closest('[data-dir]'); if (b) go(+b.dataset.dir); });
    const key = (ev) => { if (ev.key === 'ArrowRight') go(1); if (ev.key === 'ArrowLeft') go(-1); if (!document.body.contains(m.el)) window.removeEventListener('keydown', key); };
    window.addEventListener('keydown', key);
  });
}

/* ---------------- pages ---------------- */
const pages = {
  about() {
    $('#founders').innerHTML = SECRETARIAT[0].people.map(personCard).join('');
    bindPeople(SECRETARIAT[0].people);

    // chapters: timeline + flip stack
    const tl = $('#timeline');
    const stack = $('#stack');
    tl.innerHTML = EDITIONS.map((e, i) => `
      <li class="${i === 0 ? 'is-active' : ''}"><button data-i="${i}" aria-expanded="${i === 0}">
        <span class="timeline__n">${e.n}</span>
        <span class="timeline__t">${e.title}<span><span>${esc(e.text)}</span></span></span>
      </button></li>`).join('');
    stack.innerHTML = EDITIONS.map((e) => e.img
      ? `<div class="stack__card"><img src="${e.img}" alt="${e.title} poster" loading="lazy"></div>`
      : `<div class="stack__card stack__card--blank"><div><i class="mark" aria-hidden="true"></i><div class="h3">${e.title}</div><p class="muted mt-s">Coming soon</p></div></div>`).join('');
    const cards = [...stack.children];
    let cur = 0;
    const layout = () => {
      cards.forEach((c, i) => {
        const k = (i - cur + cards.length) % cards.length;
        c.style.zIndex = String(cards.length - k);
        c.style.opacity = k > 2 ? '0' : '1';
        c.style.transform = `translateY(${k * 14}px) scale(${1 - k * 0.04})`;
      });
      tl.querySelectorAll('li').forEach((li, i) => { li.classList.toggle('is-active', i === cur); li.querySelector('button').setAttribute('aria-expanded', String(i === cur)); });
    };
    const show = (i) => { cur = (i + cards.length) % cards.length; layout(); };
    stack.addEventListener('click', () => show(cur + 1));
    tl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.i); });
    layout();
  },

  secretariat() {
    $('#groups').innerHTML = SECRETARIAT.map((g, gi) => `
      <section class="group" aria-labelledby="g${gi}">
        <div class="group__head">
          <span class="label">${String(g.people.length).padStart(2, '0')} ${g.people.length === 1 ? 'member' : 'members'}</span>
          <h2 id="g${gi}">${esc(g.group)}</h2>
          ${g.note ? `<p>${esc(g.note)}</p>` : ''}
        </div>
        <div class="group__grid">${g.people.map(personCard).join('')}</div>
      </section>`).join('');
    bindPeople(allPeople);
  },

  committees() {
    const grid = $('#cgrid');
    grid.innerHTML = COMMITTEES.map((c) => `
      <a class="ccard" href="committee.html?c=${c.id}" data-type="${c.type}" data-q="${esc((c.abbr + ' ' + c.name + ' ' + c.alt).toLowerCase())}">
        <div class="ccard__top"><span>${COMMITTEE_TYPES[c.type]}</span></div>
        <div class="ccard__emblem" style="-webkit-mask-image:url('assets/committees/${c.id}.png');mask-image:url('assets/committees/${c.id}.png')" role="img" aria-label="${esc(c.name)} emblem"></div>
        <div><div class="ccard__abbr">${esc(c.abbr)}</div><div class="ccard__name">${esc(c.name)}</div></div>
        <span class="ccard__go" aria-hidden="true">${ICON.arrow}</span>
      </a>`).join('');

    const counts = { all: COMMITTEES.length };
    COMMITTEES.forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
    const tabs = $('#tabs');
    tabs.innerHTML = [['all', 'All'], ...Object.entries(COMMITTEE_TYPES)].map(([k, v], i) =>
      `<button class="tab" data-f="${k}" aria-pressed="${i === 0}">${v} <small>${counts[k]}</small></button>`).join('');

    let filter = new URLSearchParams(location.search).get('type') || 'all';
    let q = '';
    const apply = () => {
      let shown = 0;
      grid.querySelectorAll('.ccard').forEach((c) => {
        const ok = (filter === 'all' || c.dataset.type === filter) && (!q || c.dataset.q.includes(q));
        c.hidden = !ok; if (ok) shown++;
      });
      tabs.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.f === filter)));
      $('#empty').style.display = shown ? 'none' : 'block';
    };
    tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (!t) return; filter = t.dataset.f; apply(); });
    $('#search').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); apply(); });
    apply();
  },

  committee() {
    const id = (new URLSearchParams(location.search).get('c') || '').toLowerCase();
    const i = Math.max(0, COMMITTEES.findIndex((c) => c.id === id));
    const c = COMMITTEES[i];
    const prev = COMMITTEES[(i - 1 + COMMITTEES.length) % COMMITTEES.length];
    const next = COMMITTEES[(i + 1) % COMMITTEES.length];
    document.title = `${c.abbr} · ${c.name} · SODMUN`;
    document.querySelector('meta[name="description"]').setAttribute('content', c.about.slice(0, 155));

    const isCrisis = c.agendas.every((a) => a === 'Crisis');
    $('#c-hero').innerHTML = `
      <div class="page-hero__top">
        <span class="label">${COMMITTEE_TYPES[c.type]} committee</span>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="committees.html">Committees</a><span>/</span><span>${esc(c.abbr)}</span></nav>
      </div>
      <div class="cd-hero">
        <div>
          <h1 class="page-hero__title" data-split>${esc(c.abbr)}</h1>
          <p class="lede mt-m" data-reveal>${esc(c.name)}</p>
        </div>
        <div class="cd-emblem" style="-webkit-mask-image:url('assets/committees/${c.id}.png');mask-image:url('assets/committees/${c.id}.png')" role="img" aria-label="${esc(c.name)} emblem" data-reveal></div>
      </div>`;

    $('#c-body').innerHTML = `
      <dl class="cd-body__side" data-reveal>
        <div><dt>Committee</dt><dd>${esc(c.name)}</dd></div>
        <div><dt>Focus</dt><dd>${esc(c.alt)}</dd></div>
        <div><dt>Format</dt><dd>${COMMITTEE_TYPES[c.type]}</dd></div>
        <div><dt>Guides</dt><dd><a class="link" href="${SITE.backgroundGuides}" target="_blank" rel="noopener">Background guides ${ICON.out}</a></dd></div>
      </dl>
      <div class="cd-body__main">
        <span class="label">${isCrisis ? 'Format' : 'Agendas'}</span>
        ${isCrisis
          ? `<p class="h3 mt-s" style="margin-bottom:48px" data-reveal>A live crisis committee. Updates arrive as the committee unfolds, with no fixed agenda.</p>`
          : `<ol class="agendas mt-s">${c.agendas.map((a) => `<li data-reveal><p>${esc(a)}</p></li>`).join('')}</ol>`}
        <span class="label">About the committee</span>
        <p class="cd-about mt-s" data-reveal>${esc(c.about)}</p>
        <p class="note">${isCrisis ? '' : 'Agendas shown are from SODMUN IV. SODMUN V agendas are released with the background guides.'}</p>
        <div class="btn-row mt-m">
          <a class="btn" href="${SITE.backgroundGuides}" target="_blank" rel="noopener">Background guides ${ICON.out}</a>
          <a class="btn btn--ghost" href="applications.html">Apply as a delegate</a>
        </div>
      </div>`;

    $('#c-pager').innerHTML = `
      <a href="committee.html?c=${prev.id}"><span>Previous</span><strong>${esc(prev.abbr)}</strong></a>
      <a href="committee.html?c=${next.id}"><span>Next</span><strong>${esc(next.abbr)}</strong></a>`;
  },

  schedule() {
    $('#days').innerHTML = SCHEDULE.map((d, di) => `
      <section class="day" aria-labelledby="d${di}">
        <div class="day__head">
          <div class="day__n" id="d${di}">Day <em>${di + 1}</em></div>
          <div class="day__w">${d.weekday} · <span class="muted">${d.title}</span></div>
        </div>
        <ol class="day__list">
          ${d.items.map(([t, w, where]) => `
            <li class="slot${/Ceremony|Social Night/.test(w) ? ' slot--key' : ''}" data-reveal>
              <span class="slot__time">${t}</span>
              <span class="slot__what">${esc(w)}</span>
              <span class="slot__where">${esc(where)}</span>
            </li>`).join('')}
        </ol>
      </section>`).join('');
  },

  partners() {
    $('#plist').innerHTML = PARTNERS.map((p) => `
      <a class="prow" href="${p.url}" target="_blank" rel="noopener" data-reveal>
        <span class="prow__tier">${esc(p.tier)}</span>
        <span class="prow__name"><span>${esc(p.name)}</span></span>
        <span class="prow__blurb">${esc(p.blurb)}</span>
        <span class="prow__go" aria-hidden="true">${ICON.out}</span>
      </a>`).join('');
  },

  applications() {
    $('#roles').innerHTML = APPLICATIONS.map((r, i) => {
      const open = !!r.url;
      const mail = `mailto:${SITE.email}?subject=${encodeURIComponent(`SODMUN V · ${r.title} applications`)}&body=${encodeURIComponent(`Hi SODMUN team,\n\nPlease let me know when ${r.title} applications for SODMUN V open.\n\nName:\nSchool:\nGrade:\n`)}`;
      return `
      <article class="role" data-reveal style="--d:${(i % 3) * 0.06}s">
        <div>
          <div class="role__top"><span class="label">${esc(r.kicker)}</span><span class="role__status${open ? ' is-open' : ''}"><i></i>${open ? 'Open' : 'Opening soon'}</span></div>
          <h3>${esc(r.title)}</h3>
          <p>${esc(r.text)}</p>
        </div>
        ${open
          ? `<a class="btn" href="${r.url}" target="_blank" rel="noopener">Apply ${ICON.out}</a>`
          : `<a class="btn btn--ghost" href="${mail}">Notify me ${ICON.arrow}</a>`}
      </article>`;
    }).join('');
  },

  contact() {
    const form = $('#contact-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const subject = `[${d.get('topic')}] ${d.get('name')}`;
      const body = `${d.get('message')}\n\n— ${d.get('name')}${d.get('school') ? `, ${d.get('school')}` : ''}`;
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  },
};

pages[page] && pages[page]();
observe();
