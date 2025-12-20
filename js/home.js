/* Home page scroll animations */

document.addEventListener('DOMContentLoaded', () => {
  const selectors = ['.welcome', '.tools', '.to-the-link'];
  const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
  if (!nodes.length) return;

  function getClassFor(el) {
    if (el.classList.contains('welcome')) return 'inview-slide-right';
    if (el.classList.contains('tools')) return 'inview-zoom-in';
    if (el.classList.contains('to-the-link')) return 'inview-slide-left';
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
        if (entry.isIntersecting) {
          if (cls) el.classList.add(cls);
        } else if (entry.intersectionRatio <= 0.01) {
          el.classList.remove('inview-slide-right', 'inview-zoom-in', 'inview-slide-left');
        }
      });
    }, options);

    nodes.forEach(node => observer.observe(node));
  } else {
    // Fallback for older browsers: use scroll/resize with rAF
    const threshold = 0.12;
    let ticking = false;

    function isVisible(el) {
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight || document.documentElement.clientHeight;
      return rect.top <= winH * (1 - threshold) && rect.bottom >= winH * threshold;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nodes.forEach(el => {
          const cls = getClassFor(el);
          if (isVisible(el)) {
            if (cls) el.classList.add(cls);
          } else {
            el.classList.remove('inview-slide-right', 'inview-zoom-in', 'inview-slide-left');
          }
        });
        ticking = false;
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
});
