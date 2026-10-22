/* Mira Media */

(function () {
  'use strict';

  const SLIDES = [
    { id: 'cover', title: 'Cover' },
    { id: 'why', title: 'About' },
    { id: 'screen', title: 'Hamdan Street' },
    { id: 'place', title: 'Hamdan location' },
    { id: 'mall', title: 'Abu Dhabi Mall' },
    { id: 'mallPlace', title: 'Bridge entrance' },
    { id: 'main', title: 'Al Maryah Main' },
    { id: 'mainPlace', title: 'Al Miyani Street' },
    { id: 'entrance', title: 'Al Maryah entrance' },
    { id: 'entrancePlace', title: 'Four Seasons' },
    { id: 'link', title: 'SLM 02A static' },
    { id: 'linkPlace', title: 'Salam Street' },
    { id: 'digital', title: 'SLM 01A' },
    { id: 'digitalPlace', title: 'Third underpass' },
    { id: 'out', title: 'SLM 02A digital' },
    { id: 'outPlace', title: 'Eastern Mangroves' },
    { id: 'lamps', title: 'Lampposts' },
    { id: 'lampsPlace', title: 'Maryah circuit' },
    { id: 'thanks', title: 'Contact' },
  ];

  const SITES = {
    skylight: { name: 'Platform skylight', screens: 46, photo: '', note: 'Overhead screens above the platform.', slide: 'sites' },
    totem: { name: 'Entrance totem', screens: 4, photo: '', note: 'A freestanding screen at the entrance.', slide: 'sites' },
    column: { name: 'LED column', screens: 29, photo: '', note: 'A column screen on the concourse.', slide: 'sites' },
    desk: { name: 'Ticketing office & police room', screens: 2, photo: '', note: 'Screens at the ticketing office and police room.', slide: 'more' },
    wall: { name: 'Wall unit', screens: 2, photo: '', note: 'Wall-mounted screens on the concourse.', slide: 'more' },
    psd: { name: 'PSD', screens: 51, photo: '', note: 'Screens above the platform screen doors.', slide: 'more' },
  };

  const FORMAT_SLIDE = {
    'Platform skylight': 'sites',
    'Entrance totem': 'sites',
    'LED column': 'sites',
    'Ticketing office': 'more',
    'Police room': 'more',
    'Wall unit': 'more',
    PSD: 'more',
  };

  function siteIndex(id) {
    return SLIDES.findIndex((s) => s.id === id);
  }

  let state = {};
  let current = 0;

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s ?? '';
    return d.innerHTML;
  }

  function slideShell(num, title, body, hideHead, scrollBody) {
    if (hideHead) {
      return `<article class="slide slide-cover" data-slide="${num}">${body}</article>`;
    }
    const bodyCls = scrollBody ? ' slide-body-scroll' : '';
    return `<article class="slide pitch-slide" data-slide="${num}">
      <p class="pitch-kicker"><span class="pitch-kicker-line"></span> ${String(num).padStart(2, '0')} / ${String(SLIDES.length).padStart(2, '0')}</p>
      <h1 class="pitch-slide-title">${esc(title)}</h1>
      <div class="slide-body${bodyCls}">${body}</div>
    </article>`;
  }

  function usdFromAed(aed) {
    return Math.round(aed / state.rates.peg);
  }

  function money(amount) {
    if (amount == null) return '—';
    return '$' + amount.toLocaleString('en-US');
  }

  function mapsLink(data) {
    if (!data.mapsUrl) return '';
    return `<a class="maps-link" href="${esc(data.mapsUrl)}" target="_blank" rel="noopener noreferrer">${esc(data.mapsLabel)}<span>${esc(data.pin)}</span></a>`;
  }

  function renderScreen(data, num) {
    return `<article class="slide screen-slide" data-slide="${num}">
      <div class="screen-copy">
        <p class="story-kicker">${esc(data.kicker)}</p>
        <h1 class="why-title">${esc(data.title)} <span>${esc(data.titleEm)}</span></h1>
        <p class="why-lead">${esc(data.lead)}</p>
        <dl class="spec-grid">
          ${data.specs.map((spec) => `
            <div>
              <dt>${esc(spec.label)}</dt>
              <dd>${esc(spec.value)}</dd>
            </div>`).join('')}
        </dl>
        ${mapsLink(data)}
      </div>
      <figure class="screen-photo${data.fit === 'contain' ? ' is-contain' : ''}">
        <img src="${esc(data.photo)}" alt="${esc(data.photoAlt)}" />
      </figure>
    </article>`;
  }

  function renderPlace(data, num) {
    const map = data.map ? `
      <figure class="place-map">
        ${data.mapsUrl ? `<a href="${esc(data.mapsUrl)}" target="_blank" rel="noopener noreferrer">` : ''}
          <img src="${esc(data.map)}" alt="${esc(data.mapAlt)}" />
        ${data.mapsUrl ? '</a>' : ''}
        <figcaption>${esc(data.caption)}</figcaption>
      </figure>` : '';
    return `<article class="slide place-slide${data.map ? '' : ' is-copy'}" data-slide="${num}">
      <div class="place-copy">
        <p class="story-kicker">${esc(data.kicker)}</p>
        <h1 class="why-title">${esc(data.title)} <span>${esc(data.titleEm)}</span></h1>
        <p class="why-lead">${esc(data.body)}</p>
        ${mapsLink(data)}
      </div>
      ${map}
    </article>`;
  }

  function layerCards(lead, layers) {
    return `<p class="slide-lead">${esc(lead)}</p>
      <div class="grid-3 plan-grid">
        ${layers.map((layer) => `
          <article class="card card-accent">
            <h4><span class="layer-num">${esc(layer.num)}</span> ${esc(layer.title)}</h4>
            <p class="layer-place">${esc(layer.place)}</p>
            <p>${esc(layer.body)}</p>
          </article>`).join('')}
      </div>`;
  }

  function kpi(label, value, note) {
    return `<article class="kpi-card">
      <div class="kpi-label">${esc(label)}</div>
      <div class="kpi-value">${esc(value)}</div>
      <div class="kpi-sub">${esc(note)}</div>
    </article>`;
  }

  function renderSlide(index) {
    const c = state;

    switch (SLIDES[index].id) {
      case 'cover':
        return slideShell(1, c.meta.title, `
          <div class="pitch-cover is-name">
            <div class="pitch-cover-inner">
              <div class="pitch-lockup">
                <img src="${esc(c.brand.logo)}" alt="Mira Media" />
              </div>
              <h1 class="pitch-title">${esc(c.cover.line1)}<br><span>${esc(c.cover.line2)}</span></h1>
            </div>
          </div>
        `, true);

      case 'why':
        return `<article class="slide why-slide" data-slide="2">
          <p class="story-kicker">${esc(c.about.kicker)}</p>
          <h1 class="why-title">${esc(c.about.title)} <span>${esc(c.about.titleEm)}</span></h1>
          <hr class="why-rule" />
          <p class="why-lead about-copy">${esc(c.about.body)}</p>
        </article>`;

      case 'screen':
        return renderScreen(c.screen, 3);

      case 'place':
        return renderPlace(c.place, 4);

      case 'mall':
        return renderScreen(c.mall, 5);

      case 'mallPlace':
        return renderPlace(c.mallPlace, 6);

      case 'main':
        return renderScreen(c.main, 7);

      case 'mainPlace':
        return renderPlace(c.mainPlace, 8);

      case 'entrance':
        return renderScreen(c.entrance, 9);

      case 'entrancePlace':
        return renderPlace(c.entrancePlace, 10);

      case 'link':
        return renderScreen(c.link, 11);

      case 'linkPlace':
        return renderPlace(c.linkPlace, 12);

      case 'digital':
        return renderScreen(c.digital, 13);

      case 'digitalPlace':
        return renderPlace(c.digitalPlace, 14);

      case 'out':
        return renderScreen(c.out, 15);

      case 'outPlace':
        return renderPlace(c.outPlace, 16);

      case 'lamps':
        return renderScreen(c.lamps, 17);

      case 'lampsPlace':
        return renderPlace(c.lampsPlace, 18);

      case 'thanks':
        return slideShell(19, c.contact.headline, `
          <div class="pitch-cover">
            <span class="pitch-watermark" aria-hidden="true">26</span>
            <div class="pitch-cover-inner">
              <div class="pitch-lockup">
                <img src="${esc(c.brand.logo)}" alt="Mira Media" />
              </div>
              <p class="pitch-kicker"><span class="pitch-kicker-line"></span> Mira Media · Dubai</p>
              <h1 class="pitch-title">${esc(c.contact.line1)}<br><span>${esc(c.contact.line2)}</span></h1>
              <p class="pitch-lead">${esc(c.contact.message)}</p>
              <div class="pitch-facts">
                <div><small>Email</small><strong><a href="mailto:${esc(c.contact.email)}">${esc(c.contact.email)}</a></strong></div>
                <div><small>Phone</small><strong><a href="tel:+97144368624">${esc(c.contact.phones[0])}</a></strong></div>
              </div>
              <p class="pitch-tag">${esc(c.contact.address)} · ${esc(c.contact.poBox)}</p>
            </div>
          </div>
        `, true);

      default:
        return '';
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(SLIDES.length - 1, index));
    const stage = document.getElementById('slide-stage');
    stage.innerHTML = renderSlide(current);
    stage.classList.remove('slide-in');
    void stage.offsetWidth;
    stage.classList.add('slide-in');

    const pad = (n) => String(n).padStart(2, '0');
    document.getElementById('slide-counter').textContent = `${pad(current + 1)} / ${pad(SLIDES.length)}`;
    document.getElementById('prev-btn').disabled = current === 0;
    document.getElementById('next-btn').disabled = current === SLIDES.length - 1;
    const dots = document.getElementById('pitch-dots');
    if (dots) {
      dots.innerHTML = SLIDES.map((_, i) =>
        `<span class="pitch-dot${i === current ? ' is-on' : ''}"></span>`
      ).join('');
    }

    document.querySelectorAll('.overview-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === current);
    });
  }

  function renderOverview() {
    document.getElementById('overview-grid').innerHTML = SLIDES.map((s, i) => `
      <button type="button" class="overview-thumb" data-index="${i}">
        <span class="overview-thumb-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="overview-thumb-title">${esc(s.title)}</span>
      </button>
    `).join('');

    document.querySelectorAll('.overview-thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        goTo(parseInt(btn.dataset.index, 10));
        document.getElementById('overview-dialog').close();
      });
    });
  }

  function preparePrint() {
    const root = document.getElementById('print-root');
    root.innerHTML = SLIDES.map((_, i) => renderSlide(i)).join('');
    root.hidden = false;
  }

  function cleanupPrint() {
    const root = document.getElementById('print-root');
    root.innerHTML = '';
    root.hidden = true;
  }

  function initNav() {
    document.getElementById('slide-stage').addEventListener('click', (e) => {
      const jump = e.target.closest('[data-goto]');
      if (!jump) return;
      goTo(parseInt(jump.dataset.goto, 10));
    });

    document.getElementById('prev-btn').addEventListener('click', () => goTo(current - 1));
    document.getElementById('next-btn').addEventListener('click', () => {
      if (current < SLIDES.length - 1) goTo(current + 1);
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
    });

    const dialog = document.getElementById('overview-dialog');
    document.getElementById('overview-btn').addEventListener('click', () => dialog.showModal());
    document.getElementById('overview-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

    document.getElementById('print-btn').addEventListener('click', () => {
      preparePrint();
      window.print();
    });
    window.addEventListener('afterprint', cleanupPrint);
  }

  function init() {
    state = window.DECK;
    renderOverview();
    initNav();
    goTo(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
