/* =========================================================
   TJ_APP — Plataforma Digital de Asistencia Vial
   Interacciones del sitio (JavaScript vanilla)
   ========================================================= */

/* ---------------------------------------------------------
   DATOS EDITABLES DE LAS GRÁFICAS
   Cambie estos valores para actualizar las gráficas sin
   tocar el resto del código.
   --------------------------------------------------------- */
const DATA = {
  // Concept scoring (Excel del equipo): puntaje total ponderado
  scoring: {
    labels: [
      'VER_35 Chatbot',
      'VER_25 Facturación',
      'VER_46 Ecosistema fin.',
      'VER_50 TJ 360°',
      'VER_24 Pagos',
      'VER_47 IA avanzada',
      'VER_23 Renovación',
      'VER_49 TJ inteligente',
      'VER_1 Referencia',
      'VER_48 Plataforma integral'
    ],
    values: [3.20, 2.95, 2.90, 2.90, 2.85, 2.80, 2.75, 2.70, 2.65, 1.90],
    threshold: 3.0
  },

  // Datos financieros del informe
  finance: {
    investment: 7000000, // inversión inicial de la app (COP)
    scenarios: [
      {
        name: 'Pesimista (+7%)',
        extraIncome: 4445000, // ingreso adicional mensual
        monthlyProfit: 2231267 // utilidad incremental mensual (ya descuenta el costo fijo de la app)
      },
      {
        name: 'Esperado (+11%)',
        extraIncome: 6985000,
        monthlyProfit: 3539267
      },
      {
        name: 'Optimista (+15%)',
        extraIncome: 9525000,
        monthlyProfit: 4847267
      }
    ],
    months: 12
  }
};

/* Paleta usada en las gráficas */
const COLORS = {
  primary: '#0F172A',
  accent: '#2563EB',
  accentSoft: 'rgba(37, 99, 235, 0.15)',
  yellow: '#FACC15',
  slate: '#94A3B8',
  grid: '#E2E8F0',
  text: '#475569',
  amber: '#D97706'
};

/* ---------------------------------------------------------
   UTILIDADES
   --------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const formatCOP = (value) =>
  '$' + Math.round(value).toLocaleString('es-CO');

const formatNumber = (value, decimals = 0) =>
  value.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

/* ---------------------------------------------------------
   1. ICONOS (Lucide)
   --------------------------------------------------------- */
function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* ---------------------------------------------------------
   2. NAVEGACIÓN: menú móvil y enlace activo
   --------------------------------------------------------- */
function initNav() {
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  if (!toggle || !links) return;

  const closeMenu = () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  $$('a', links).forEach((a) => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Resalta el enlace de la sección visible
  const navAnchors = $$('a[href^="#"]', links);
  const sections = navAnchors
    .map((a) => $(a.getAttribute('href')))
    .filter(Boolean);

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navAnchors.forEach((a) =>
          a.classList.toggle('is-active', a.getAttribute('href') === id)
        );
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ---------------------------------------------------------
   3. ANIMACIONES AL HACER SCROLL
   --------------------------------------------------------- */
function initReveal() {
  const items = $$('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    animateWeights();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');

        // Barras de pesos del scoring
        if (entry.target.querySelector('#weights')) animateWeights();

        // Contadores de los KPIs
        $$('[data-count]', entry.target).forEach(countUp);

        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   4. CONTADORES DE KPIs
   --------------------------------------------------------- */
function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = 'true';

  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 1200;
  const start = performance.now();

  if (prefersReducedMotion) {
    el.textContent = formatNumber(target, decimals);
    return;
  }

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatNumber(target * eased, decimals);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

/* ---------------------------------------------------------
   5. BARRAS DE PESOS (criterios del scoring)
   --------------------------------------------------------- */
function animateWeights() {
  $$('#weights .weight__bar span').forEach((bar) => {
    bar.style.width = bar.dataset.width || '0';
  });
}

/* ---------------------------------------------------------
   6. PESTAÑAS DE LA METODOLOGÍA
   --------------------------------------------------------- */
function initTabs() {
  const tabs = $$('.tabs__btn');
  if (tabs.length === 0) return;

  const activate = (tab, focus = false) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.classList.toggle('is-active', selected);
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;

      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.classList.toggle('is-active', selected);
        panel.hidden = !selected;
      }
    });
    if (focus) tab.focus();
    initIcons();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));

    // Navegación con teclado entre pestañas
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activate(next, true);
      }
    });
  });
}

/* ---------------------------------------------------------
   7. GRÁFICAS (Chart.js)
   --------------------------------------------------------- */

// Plugin propio: línea vertical del umbral en la gráfica de scoring
const thresholdLine = {
  id: 'thresholdLine',
  afterDatasetsDraw(chart, args, opts) {
    if (opts == null || opts.value == null) return;
    const { ctx, chartArea, scales } = chart;
    const x = scales.x.getPixelForValue(opts.value);
    ctx.save();
    ctx.strokeStyle = COLORS.amber;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.amber;
    ctx.font = '600 12px Inter, sans-serif';
    ctx.fillText('Umbral 3,0', x + 6, chartArea.bottom - 8);
    ctx.restore();
  }
};

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion ? false : { duration: 900 },
    plugins: {
      legend: {
        labels: {
          color: COLORS.text,
          font: { family: 'Inter', size: 12, weight: '600' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: COLORS.primary,
        titleFont: { family: 'Inter', weight: '700' },
        bodyFont: { family: 'Inter' },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: COLORS.grid },
        ticks: { color: COLORS.text, font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: COLORS.grid },
        ticks: { color: COLORS.text, font: { family: 'Inter', size: 11 } }
      }
    }
  };
}

function chartScoring() {
  const canvas = $('#chartScoring');
  if (!canvas) return;
  const { labels, values, threshold } = DATA.scoring;

  const options = baseOptions();
  options.indexAxis = 'y';
  options.plugins.legend.display = false;
  options.plugins.thresholdLine = { value: threshold };
  options.plugins.tooltip.callbacks = {
    label: (ctx) => ' Puntaje: ' + formatNumber(ctx.parsed.x, 2)
  };
  options.scales.x.min = 0;
  options.scales.x.max = 4;
  options.scales.x.ticks.callback = (v) => formatNumber(v, 1);
  options.scales.y.grid.display = false;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Puntaje total',
          data: values,
          backgroundColor: values.map((v) => (v >= threshold ? COLORS.yellow : COLORS.accentSoft)),
          borderColor: values.map((v) => (v >= threshold ? COLORS.amber : COLORS.accent)),
          borderWidth: 1.5,
          borderRadius: 6,
          barThickness: 18
        }
      ]
    },
    options,
    plugins: [thresholdLine]
  });
}

function chartRoi() {
  const canvas = $('#chartRoi');
  if (!canvas) return;
  const { investment, scenarios, months } = DATA.finance;
  const monthLabels = Array.from({ length: months + 1 }, (_, i) => 'Mes ' + i);
  const palette = [COLORS.slate, COLORS.accent, COLORS.amber];

  // ROI = (utilidad incremental × meses − inversión) / inversión
  const datasets = scenarios.map((s, i) => ({
    label: s.name,
    data: monthLabels.map((_, m) => ((s.monthlyProfit * m - investment) / investment) * 100),
    borderColor: palette[i],
    backgroundColor: palette[i],
    borderWidth: i === 1 ? 3.5 : 2.5,
    pointRadius: 0,
    pointHoverRadius: 5,
    tension: 0.25
  }));

  const options = baseOptions();
  options.interaction = { mode: 'index', intersect: false };
  options.plugins.tooltip.callbacks = {
    label: (ctx) => ' ' + ctx.dataset.label + ': ' + formatNumber(ctx.parsed.y, 0) + '%'
  };
  options.scales.y.ticks.callback = (v) => v + '%';
  options.scales.x.ticks.maxTicksLimit = 7;

  new Chart(canvas, {
    type: 'line',
    data: { labels: monthLabels, datasets },
    options
  });
}

function chartScenarios() {
  const canvas = $('#chartScenarios');
  if (!canvas) return;
  const { scenarios } = DATA.finance;

  const options = baseOptions();
  options.plugins.tooltip.callbacks = {
    label: (ctx) => ' ' + ctx.dataset.label + ': ' + formatCOP(ctx.parsed.y)
  };
  options.scales.y.ticks.callback = (v) => '$' + formatNumber(v / 1000000, 1) + ' M';
  options.scales.x.grid.display = false;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: scenarios.map((s) => s.name),
      datasets: [
        {
          label: 'Ingreso adicional / mes',
          data: scenarios.map((s) => s.extraIncome),
          backgroundColor: COLORS.accentSoft,
          borderColor: COLORS.accent,
          borderWidth: 1.5,
          borderRadius: 6
        },
        {
          label: 'Utilidad incremental / mes',
          data: scenarios.map((s) => s.monthlyProfit),
          backgroundColor: COLORS.primary,
          borderRadius: 6
        }
      ]
    },
    options
  });
}

function initCharts() {
  const cards = $$('.chart-card');

  if (typeof window.Chart === 'undefined') {
    // Si el CDN no carga, se muestra el texto alternativo
    cards.forEach((card) => card.classList.add('no-chart'));
    return;
  }

  Chart.defaults.font.family = 'Inter, sans-serif';

  // Las gráficas se dibujan cuando su tarjeta entra en pantalla
  const builders = {
    chartScoring,
    chartRoi,
    chartScenarios
  };

  const build = (canvas) => {
    if (canvas.dataset.built) return;
    canvas.dataset.built = 'true';
    const fn = builders[canvas.id];
    if (fn) fn();
  };

  const canvases = $$('.chart-card canvas');

  if (!('IntersectionObserver' in window)) {
    canvases.forEach(build);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        build(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  canvases.forEach((c) => observer.observe(c));
}

/* ---------------------------------------------------------
   8. VISOR DE IMÁGENES
   --------------------------------------------------------- */
function initLightbox() {
  const box = $('#lightbox');
  const img = $('#lightboxImg');
  const closeBtn = $('#lightboxClose');
  if (!box || !img) return;

  let lastFocus = null;

  const open = (src, alt) => {
    lastFocus = document.activeElement;
    img.src = src;
    img.alt = alt || '';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  };

  const close = () => {
    box.classList.remove('is-open');
    img.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  $$('[data-lightbox]').forEach((fig) => {
    const image = $('img', fig);
    if (!image) return;
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Ampliar imagen: ' + (image.alt || ''));
    fig.addEventListener('click', () => open(image.src, image.alt));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(image.src, image.alt);
      }
    });
  });

  box.addEventListener('click', (e) => {
    if (e.target !== img) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && box.classList.contains('is-open')) close();
  });
}

/* ---------------------------------------------------------
   9. BOTÓN VOLVER ARRIBA Y AÑO DEL FOOTER
   --------------------------------------------------------- */
function initToTop() {
  const btn = $('#toTop');
  if (!btn) return;

  const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

function initYear() {
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/* ---------------------------------------------------------
   ARRANQUE
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initNav();
  initReveal();
  initTabs();
  initCharts();
  initLightbox();
  initToTop();
  initYear();
});
