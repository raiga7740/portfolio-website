/* ===== Helpers ===== */
function $(sel, ctx) {
  return (ctx || document).querySelector(sel);
}
function $$(sel, ctx) {
  return Array.from((ctx || document).querySelectorAll(sel));
}

document.addEventListener('DOMContentLoaded', function () {
  /* ===== Theme Setup ===== */
  var themeToggleBtn = $('#theme-toggle');

  function setThemeFromSystem() {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', prefersDark);
    if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
  }

  function applyStoredTheme() {
    var stored = localStorage.getItem('theme-mode'); // 'dark' | 'light' | null
    if (stored === 'dark') {
      document.body.classList.add('dark');
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'true');
      return true;
    } else if (stored === 'light') {
      document.body.classList.remove('dark');
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'false');
      return true;
    }
    return false; // no override
  }

  // Apply override or system
  if (!applyStoredTheme()) {
    setThemeFromSystem();
  }

  // Update when system theme changes (only if no manual override)
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', function () {
    var hasOverride = localStorage.getItem('theme-mode') === 'dark' ||
                      localStorage.getItem('theme-mode') === 'light';
    if (!hasOverride) setThemeFromSystem();
  });

  // Manual toggle
  function manualToggleTheme() {
    var isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', manualToggleTheme);

  /* ===== Mobile Menu ===== */
  var menuBtn = $('#menu-toggle');
  var nav = $('.primary-nav');
  function toggleMenu() {
    if (!nav) return;
    var open = nav.classList.toggle('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
  $$('[data-nav]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (nav && nav.classList.contains('open')) toggleMenu();
    });
  });

  /* ===== Typing Effect ===== */
  function typingEffect(strings, targetSel, speed, delayBetween) {
    if (speed == null) speed = 80;
    if (delayBetween == null) delayBetween = 1200;
    var target = $(targetSel);
    if (!target || !strings || !strings.length) return;
    var strIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var cur = strings[strIndex];
      if (!deleting) {
        target.textContent = cur.slice(0, charIndex++);
        if (charIndex <= cur.length) {
          setTimeout(tick, speed);
        } else {
          deleting = true;
          setTimeout(tick, delayBetween);
        }
      } else {
        target.textContent = cur.slice(0, charIndex--);
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

  var typedStringsEls = $$('#typed-strings span');
  if (typedStringsEls.length) {
    var strings = typedStringsEls.map(function (e) { return e.textContent.trim(); }).filter(Boolean);
    typingEffect(strings, '#typed-output');
  }

  /* ===== Project Filter ===== */
  var filterBtns = $$('.filter-btn');
  var cards = $$('#projects-grid .card');
  function applyFilter(filter) {
    cards.forEach(function (card) {
      var cat = card.dataset.category || '';
      var show = (filter === 'all' || cat === filter);
      if (show) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  }
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ===== ScrollSpy ===== */
  var sections = ['about', 'projects', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = $$('[data-nav]');
  function onScrollSpy() {
    var scrollPos = window.scrollY + window.innerHeight / 3;
    var currentId = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos && (sec.offsetTop + sec.offsetHeight) > scrollPos) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href').replace('#','');
      if (href === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', onScrollSpy);
  window.addEventListener('load', onScrollSpy);

  /* ===== Contact Form (EmailJS-ready fallback) ===== */
  var contactForm = $('#contact-form');
  var formStatus = $('#form-status');

  var EMAILJS_ENABLED = false; // ubah true kalau sudah punya ID
  var EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  var EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

  function sendViaEmailJS(data) {
    if (!window.emailjs) return Promise.reject('EmailJS not loaded');
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data, EMAILJS_PUBLIC_KEY);
  }

  function fallbackMailto(data) {
    var subject = encodeURIComponent('Pesan dari Portfolio');
    var body = encodeURIComponent('Nama: ' + data.name + '\nEmail: ' + data.email + '\nPesan:\n' + data.message);
    window.location.href = 'mailto:' + data.to + '?subject=' + subject + '&body=' + body;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = {
        name: $('#name') ? $('#name').value.trim() : '',
        email: $('#email') ? $('#email').value.trim() : '',
        message: $('#message') ? $('#message').value.trim() : '',
        to: 'gayuh@email.com'
      };
      if (!formData.name || !formData.email || !formData.message) {
        if (formStatus) formStatus.textContent = 'Lengkapi semua field.';
        return;
      }
      if (EMAILJS_ENABLED) {
        if (formStatus) formStatus.textContent = 'Mengirim...';
        sendViaEmailJS(formData)
          .then(function () {
            if (formStatus) formStatus.textContent = 'Terkirim! Terima kasih.';
            contactForm.reset();
          })
          .catch(function () {
            if (formStatus) formStatus.textContent = 'Gagal EmailJS. Membuka email...';
            fallbackMailto(formData);
          });
      } else {
        fallbackMailto(formData);
        
      }
    });
  }
});
