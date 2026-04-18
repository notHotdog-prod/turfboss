(function () {
  'use strict';

  // Mobile nav
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => { mobileNav.classList.add('open'); document.body.style.overflow = 'hidden'; });
  }
  if (mobileClose && mobileNav) {
    mobileClose.addEventListener('click', () => { mobileNav.classList.remove('open'); document.body.style.overflow = ''; });
  }

  // Sticky nav
  const header = document.querySelector('.site-header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

  // Scroll to top
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top'; scrollBtn.innerHTML = '↑'; scrollBtn.title = 'Back to top';
  document.body.appendChild(scrollBtn);
  window.addEventListener('scroll', () => scrollBtn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Accordion
  document.querySelectorAll('.accordion-header').forEach(h => {
    h.addEventListener('click', () => {
      const body = h.nextElementSibling;
      const isOpen = h.classList.contains('active');
      document.querySelectorAll('.accordion-header').forEach(hh => { hh.classList.remove('active'); const b = hh.nextElementSibling; if (b) b.classList.remove('open'); });
      if (!isOpen) { h.classList.add('active'); if (body) body.classList.add('open'); }
    });
  });

  // Counter animation
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1800; const step = 16; const inc = target / (dur / step); let current = 0;
      const timer = setInterval(() => { current += inc; if (current >= target) { current = target; clearInterval(timer); } el.textContent = Math.floor(current) + suffix; }, step);
    };
    const observer = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); observer.unobserve(e.target); } }); }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  // Fade in on scroll
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const fadeObs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); } }); }, { threshold: 0.12 });
    fadeEls.forEach(el => fadeObs.observe(el));
  }

  // ─── Cloudflare Worker URL ───────────────────────────────────────────────────
  // After deploying turfboss-worker.js to Cloudflare Workers, paste the
  // Worker URL here (e.g. https://turfboss-form.YOUR-SUBDOMAIN.workers.dev)
  const WORKER_URL = 'https://turfboss-form.bryan-boutin.workers.dev';
  // ─────────────────────────────────────────────────────────────────────────────

  // Quote form
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = quoteForm.querySelector('[type="submit"]'); const orig = btn.textContent;
      btn.textContent = 'Sending…'; btn.disabled = true;
      const data = Object.fromEntries(new FormData(quoteForm).entries());

      if (WORKER_URL !== 'YOUR_CLOUDFLARE_WORKER_URL_HERE') {
        try {
          await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } catch (err) { console.error('Form submission error:', err); }
      } else {
        console.log('Worker not configured yet. Form data:', data);
      }

      showToast('✅ Request received! We\'ll contact you within 24 hours.', 'success');
      quoteForm.reset(); btn.textContent = orig; btn.disabled = false;
    });
  }


  // ── Free Quote Modal ─────────────────────────────────────────────────────────
  const WORKER_URL = 'https://turfboss-form.bryan-boutin.workers.dev';

  function openQuoteModal() {
    const overlay = document.getElementById('quoteModal');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const first = overlay.querySelector('input, select, textarea');
        if (first) first.focus();
      }, 100);
    } else {
      window.location.href = (window.location.pathname.includes('/services/') ||
        window.location.pathname.includes('/resources/')) ? '../contact.html' : 'contact.html';
    }
  }

  // Wire all CTA buttons to open modal
  document.querySelectorAll('a[href*="contact"], .btn-cta, [data-modal="quote"]').forEach(btn => {
    const href = btn.getAttribute('href') || '';
    if (href.includes('contact') || btn.classList.contains('btn-cta') || btn.dataset.modal === 'quote') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openQuoteModal();
      });
    }
  });

  // Also wire buttons with "FREE QUOTE", "Get Quote", "Request Quote" text
  document.querySelectorAll('a, button').forEach(el => {
    const txt = el.textContent.trim().toUpperCase();
    if ((txt.includes('FREE QUOTE') || txt.includes('GET QUOTE') || txt.includes('REQUEST') && txt.includes('QUOTE'))
        && !el.closest('.quote-modal')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openQuoteModal();
      });
    }
  });

  const modalClose = document.getElementById('quoteModalClose');
  const modalOverlay = document.getElementById('quoteModal');
  if (modalClose) modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }
  });

  // Quote form
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = quoteForm.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Sending…'; btn.disabled = true;
      const fd = new FormData(quoteForm);
      const data = Object.fromEntries(fd.entries());
      // Split name into first/last for Monday
      const nameParts = (data.name || '').trim().split(/\s+/);
      data.first_name = nameParts[0] || '';
      data.last_name = nameParts.slice(1).join(' ') || '';
      try {
        await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) { console.error('Form error:', err); }
      showToast('✅ Request received! We\'ll contact you within 24 hours.', 'success');
      quoteForm.reset();
      btn.textContent = orig; btn.disabled = false;
      if (modalOverlay) { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }
    });
  }

  function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${type==='success'?'#2E7D32':'#333'};color:#fff;padding:16px 28px;border-radius:8px;font-family:Montserrat,sans-serif;font-weight:600;font-size:0.95rem;box-shadow:0 8px 32px rgba(0,0,0,0.25);z-index:9999;`;
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.4s'; }, 3500);
    setTimeout(() => t.remove(), 4000);
  }

  // Mobile submenu
  document.querySelectorAll('.mobile-has-sub > a').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); const sub = link.nextElementSibling; if (sub) sub.style.display = sub.style.display === 'block' ? 'none' : 'block'; });
  });

  // Sticky CTA
  const stickyCTA = document.querySelector('.sticky-cta');
  if (stickyCTA) window.addEventListener('scroll', () => stickyCTA.classList.toggle('visible', window.scrollY > 400), { passive: true });

  // Turf calculator (if present)
  const calcForm = document.getElementById('turf-calc');
  if (calcForm) {
    calcForm.addEventListener('input', updateCalc);
    calcForm.addEventListener('change', updateCalc);
    updateCalc();
    function updateCalc() {
      const w = parseFloat(document.getElementById('calc-width')?.value) || 0;
      const l = parseFloat(document.getElementById('calc-length')?.value) || 0;
      const sqft = w && l ? w * l : parseFloat(document.getElementById('calc-sqft')?.value) || 0;
      const tier = document.getElementById('calc-tier')?.value || 'standard';
      const rates = { standard: [8, 12], premium: [12, 17], ultra: [17, 24] };
      const r = rates[tier] || rates.standard;
      const low = sqft * r[0]; const high = sqft * r[1];
      const waterSavings = sqft * 0.006 * 60;
      const yearlyNatural = sqft * 0.006 * 60 + 1800 + 200 + 100;
      const payback = sqft > 0 ? Math.round(((low + high) / 2) / yearlyNatural) : 0;
      if (document.getElementById('calc-sqft-display')) document.getElementById('calc-sqft-display').textContent = sqft.toLocaleString();
      if (document.getElementById('calc-cost-range')) document.getElementById('calc-cost-range').textContent = sqft > 0 ? `$${low.toLocaleString()} – $${high.toLocaleString()}` : '--';
      if (document.getElementById('calc-water-savings')) document.getElementById('calc-water-savings').textContent = sqft > 0 ? `~$${Math.round(waterSavings).toLocaleString()}/yr` : '--';
      if (document.getElementById('calc-payback')) document.getElementById('calc-payback').textContent = payback > 0 ? `~${payback} years` : '--';
      if (document.getElementById('calc-10yr-savings')) document.getElementById('calc-10yr-savings').textContent = sqft > 0 ? `~$${Math.round(yearlyNatural * 10 - ((low+high)/2)).toLocaleString()}` : '--';
    }
  }
})();
