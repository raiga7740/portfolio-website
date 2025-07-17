/* ===== Helpers ===== */
function $(sel, ctx) {
  return (ctx || document).querySelector(sel);
}
function $$(sel, ctx) {
  return Array.from((ctx || document).querySelectorAll(sel));
}

document.addEventListener('DOMContentLoaded', function () {
  /* ===== Theme Setup ===== */
  const themeToggleBtn = $('#theme-toggle');

  function applyStoredTheme() {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'dark') {
      document.body.classList.add('dark');
      themeToggleBtn?.setAttribute('aria-pressed', 'true');
      return true;
    } else if (stored === 'light') {
      document.body.classList.remove('dark');
      themeToggleBtn?.setAttribute('aria-pressed', 'false');
      return true;
    }
    return false;
  }

  function setThemeFromSystem() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', prefersDark);
    themeToggleBtn?.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
  }

  if (!applyStoredTheme()) {
    setThemeFromSystem();
  }

  themeToggleBtn?.addEventListener('click', function () {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  });

  /* ===== Mobile Menu ===== */
  const menuBtn = $('#menu-toggle');
  const nav = $('.primary-nav');
  function toggleMenu() {
    if (!nav) return;
    const open = nav.classList.toggle('open');
    menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn?.addEventListener('click', toggleMenu);
  $$('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      if (nav?.classList.contains('open')) toggleMenu();
    });
  });

  /* ===== Typing Effect ===== */
  function typingEffect(strings, targetSel, speed = 80, delayBetween = 1200) {
    const target = $(targetSel);
    if (!target || !strings || !strings.length) return;
    let strIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      const current = strings[strIndex];
      if (!deleting) {
        target.textContent = current.slice(0, charIndex++);
        if (charIndex <= current.length) {
          setTimeout(tick, speed);
        } else {
          deleting = true;
          setTimeout(tick, delayBetween);
        }
      } else {
        target.textContent = current.slice(0, charIndex--);
        if (charIndex >= 0) {
          setTimeout(tick, speed * 0.6);
        } else {
          deleting = false;
          strIndex = (strIndex + 1) % strings.length;
          setTimeout(tick, speed);
        }
      }
    }
    tick();
  }

  const typedStringsEls = $$('#typed-strings span');
  if (typedStringsEls.length) {
    const strings = typedStringsEls.map(e => e.textContent.trim()).filter(Boolean);
    typingEffect(strings, '#typed-output');
  }

  /* ===== Project Filter ===== */
  const filterBtns = $$('.filter-btn');
  const cards = $$('#projects-grid .card');
  function applyFilter(filter) {
    cards.forEach(card => {
      const cat = card.dataset.category || '';
      const show = (filter === 'all' || cat === filter);
      card.classList.toggle('is-hidden', !show);
    });
  }
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ===== ScrollSpy ===== */
  const sections = ['about', 'projects', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$('[data-nav]');
  function onScrollSpy() {
    const scrollPos = window.scrollY + window.innerHeight / 3;
    let currentId = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos && (sec.offsetTop + sec.offsetHeight) > scrollPos) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }
  window.addEventListener('scroll', onScrollSpy);
  window.addEventListener('load', onScrollSpy);

  /* ===== Contact Form with EmailJS ===== */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');

  // Inisialisasi EmailJS
  emailjs.init('qzdec9wk4z3jKlyPH');

  contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = $('#name')?.value.trim();
    const email = $('#email')?.value.trim();
    const message = $('#message')?.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Lengkapi semua field.';
      return;
    }

    formStatus.textContent = 'Mengirim...';

    emailjs.send('service_degczd9', 'template_569romm', {
      from_name: name,
      from_email: email,
      message: message
    }).then(() => {
      formStatus.textContent = '✅ Pesan terkirim! Terima kasih.';
      contactForm.reset();
    }).catch(err => {
      console.error('EmailJS Error:', err);
      formStatus.textContent = '❌ Gagal mengirim. Coba lagi.';
    });
  });
});
