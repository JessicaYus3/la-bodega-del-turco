function syncHeaderOffset() {
  const header = document.querySelector('.header');
  if (!header) return;
  document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight}px`);
}

function prefillHeaderSearch() {
  const q = new URLSearchParams(window.location.search).get('q');
  if (!q) return;
  document.querySelectorAll('.header-search input[name="q"]').forEach((input) => {
    input.value = q;
  });
}

async function initHeaderWhatsapp() {
  const link = document.getElementById('headerWhatsapp');
  if (!link) return;

  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    const msg = encodeURIComponent('¡Hola! Me gustaría cotizar un pedido al por mayor.');
    link.href = config.whatsapp
      ? `https://wa.me/${config.whatsapp}?text=${msg}`
      : '#';
  } catch (err) {
    console.error('Error cargando WhatsApp del header:', err);
  }
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('headerNavPanel');
  if (!toggle || !panel) return;

  const close = () => {
    panel.classList.remove('nav-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('nav-locked');
  };

  const open = () => {
    syncHeaderOffset();
    panel.classList.add('nav-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('nav-locked');
  };

  toggle.addEventListener('click', () => {
    if (panel.classList.contains('nav-open')) close();
    else open();
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  window.addEventListener('resize', () => {
    syncHeaderOffset();
    if (window.innerWidth > 768) close();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  syncHeaderOffset();
  prefillHeaderSearch();
  initHeaderWhatsapp();
  initMobileNav();
});

window.addEventListener('load', syncHeaderOffset);
