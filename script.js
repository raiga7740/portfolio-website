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
      themeToggleBtn && themeToggleBtn.setAttribute('aria-pressed', 'true');
      return true;
    } else if (stored === 'light') {
      document.body.classList.remove('dark');
      themeToggleBtn && themeToggleBtn.setAttribute('aria-pressed', 'false');
      return true;
    }
    return false;
  }

  function setThemeFromSystem() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', prefersDark);
    themeToggleBtn && themeToggleBtn.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
  }

  if (!applyStoredTheme()) {
    setThemeFromSystem();
  }

  themeToggleBtn && themeToggleBtn.addEventListener('click', function () {
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
    menuBtn && menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn && menuBtn.addEventListener('click', toggleMenu);
  $$('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      if (nav && nav.classList.contains('open')) toggleMenu();
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

  contactForm && contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#name') ? $('#name').value.trim() : '';
    const email = $('#email') ? $('#email').value.trim() : '';
    const message = $('#message') ? $('#message').value.trim() : '';

    if (!name || !email || !message) {
      if (formStatus) formStatus.textContent = '⚠ Lengkapi semua field.';
      return;
    }

    if (formStatus) formStatus.textContent = 'Mengirim...';

    emailjs.send('service_ukns1un', 'template_569romm', {
      title: 'Contact from Portfolio Website', // {{title}} di template
      name: name,                               // {{name}}
      email: email,                             // {{email}} (Reply-To)
      message: message                          // {{message}}
    }).then(() => {
      if (formStatus) formStatus.textContent = '✅ Pesan terkirim! Terima kasih.';
      contactForm.reset();
    }).catch(err => {
      console.error('EmailJS Error:', err);
      if (formStatus) formStatus.textContent = '❌ Gagal mengirim. Coba lagi.';
      
    });
  });
});
/* Cursor Effect */
(function cursorLineTrail(){
  const canvas = document.getElementById('cursor-line');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const points = [];
  const maxPoints = 40; // Panjang trail
  let targetX = 0, targetY = 0;
  let drawX = 0, drawY = 0;
  const ease = 0.25; // Kecepatan follow

  window.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function addPoint(x, y){
    points.push({x, y, life: 1});
    if (points.length > maxPoints) points.shift();
  }

  function update(){
    drawX += (targetX - drawX) * ease;
    drawY += (targetY - drawY) * ease;
    addPoint(drawX, drawY);
    for (let p of points) p.life -= 0.02;
    for (let i = points.length - 1; i >= 0; i--){
      if (points[i].life <= 0) points.splice(i, 1);
    }
  }

  function render(){
    ctx.clearRect(0,0,w,h);
    if (points.length < 2) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const grad = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length-1].x, points[points.length-1].y);
    grad.addColorStop(0, 'rgba(108,99,255,0)'); // Warna awal transparan
    grad.addColorStop(1, 'rgba(108,99,255,0.8)'); // Warna akhir ungu
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }

  function loop(){
    update();
    render();
    requestAnimationFrame(loop);
  }
  loop();
})();
