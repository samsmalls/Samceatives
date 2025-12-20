const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('site-nav');
const overlay = document.getElementById('overlay');

function openNav() {
  hamburger.classList.add('open');
  nav.classList.add('open');
  overlay.classList.add('visible');
  overlay.hidden = false;
  hamburger.setAttribute('aria-expanded', 'true');
  nav.setAttribute('aria-hidden', 'false');
}

function closeNav() {
  hamburger.classList.remove('open');
  nav.classList.remove('open');
  
  overlay.classList.remove('visible');
  overlay.hidden = true;
  hamburger.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-hidden', 'true');
}

hamburger.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  expanded ? closeNav() : openNav();
});

overlay.addEventListener('click', closeNav);

// Close nav when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close nav on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) {
    closeNav();
  }
});

const FORM_ENDPOINT = 'https://formspree.io/f/xanrdjen'; 
const SITE_OWNER_EMAIL = 'samuelnduta91@gmail.com';

const contactForm = document.getElementById('contact-form');
if (contactForm){
  const submitBtn = document.getElementById('contact-submit');
  const statusEl = document.getElementById('contact-status');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!submitBtn) return;

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message){
      statusEl.textContent = 'Please fill all fields.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.textContent = '';

    // Endpoint preference: data-endpoint on form overrides FORM_ENDPOINT constant
    const endpoint = contactForm.dataset.endpoint?.trim() || FORM_ENDPOINT.trim();

    try {
      if (endpoint){
        // send JSON via fetch — most form endpoints including Formspree accept application/json
        // Set a timeout using AbortController so the request can't hang indefinitely
        const controller = new AbortController();
        const FETCH_TIMEOUT = 10000; // 10 seconds
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name, email, message }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (res.ok){
            statusEl.textContent = 'Message sent successfully! Thank you for reaching out.';
            contactForm.reset();
          } else {
            // try to parse JSON message for debugging
            let text = 'Failed to send message.';
            try { const json = await res.json(); if (json?.error) text = json.error; } catch(e){}
            statusEl.textContent = text;
          }
        } catch (err) {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError'){
            statusEl.textContent = 'Request timed out — please try again later.';
          } else {
            console.error('Fetch error', err);
            statusEl.textContent = 'Network error while sending. Please check your connection and try again.';
          }
        }

      } else {
        // fallback: open user's mail client addressed to SITE_OWNER_EMAIL so messages reach you
        const subject = encodeURIComponent('Website contact from ' + name);
        const body = encodeURIComponent(`From: ${name} <${email}>%0A%0A${message}`);
        window.location.href = `mailto:${encodeURIComponent(SITE_OWNER_EMAIL)}?subject=${subject}&body=${body}`;
        statusEl.textContent = 'Opening your email client so you can send the message…';
      }

    } catch (err) {
      console.error('Contact submit error', err);
      statusEl.textContent = 'An unexpected error occurred. Please try again later.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
}

  /* Scroll/observer animation handler — works with IntersectionObserver or falls back to scroll+rAF */
  document.addEventListener('DOMContentLoaded', () => {
    const selectors = ['.home-anima', '.about-anima', '.projects-anima'];
    const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
    if (!nodes.length) return;

    function getClassFor(el){
      if (el.classList.contains('home-anima')) return 'inview-slide-right';
      if (el.classList.contains('about-anima')) return 'inview-zoom-in';
      if (el.classList.contains('projects-anima')) return 'inview-slide-left';
      return '';
    }

    const options = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12
    };

    if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const cls = getClassFor(el);
        // debug: log intersection changes for troubleshooting
        console.debug('IO', el.className, 'isIntersecting=', entry.isIntersecting, 'ratio=', entry.intersectionRatio.toFixed(3));
        if (entry.isIntersecting) {
          if (cls) el.classList.add(cls);
          } else if (entry.intersectionRatio <= 0.01) {
          // only remove when element is essentially out of view to avoid flicker
          el.classList.remove('inview-slide-right','inview-zoom-in','inview-slide-left');
        }
      });
    }, options);

    nodes.forEach(node => observer.observe(node));
  } else {
      // Fallback for older browsers: use scroll/resize with rAF to toggle classes
      const threshold = 0.12;
      let ticking = false;

      function isVisible(el){
        const rect = el.getBoundingClientRect();
        const winH = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= winH * (1 - threshold) && rect.bottom >= winH * threshold;
      }

      function onScroll(){
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          nodes.forEach(el => {
            const cls = getClassFor(el);
            if (isVisible(el)) {
              if (cls) el.classList.add(cls);
            } else {
              el.classList.remove('inview-slide-right','inview-zoom-in','inview-slide-left');
            }
          });
          ticking = false;
        });
      }

      // initial check and listeners
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }
  });