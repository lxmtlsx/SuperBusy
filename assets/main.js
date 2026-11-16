(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('.nav');
  const links = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => { const o = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', o); });
  links.addEventListener('click', e => { if (e.target.tagName === 'A') links.classList.remove('open'); });

  // Hero parallax: scroll depth + pointer drift, one rAF loop.
  const layers = [...document.querySelectorAll('.hero [data-depth]')];
  let mx = 0, my = 0, tx = 0, ty = 0, sy = 0, ticking = false;
  const render = () => {
    tx += (mx - tx) * .08; ty += (my - ty) * .08;
    for (const el of layers) {
      const d = +el.dataset.depth;
      el.style.setProperty('--px', (tx * d * 40).toFixed(1) + 'px');
      el.style.setProperty('--py', (sy * d * .5 + ty * d * 26).toFixed(1) + 'px');
    }
    nav.classList.toggle('solid', sy > 40);
    if (Math.abs(mx - tx) > .001 || Math.abs(my - ty) > .001) requestAnimationFrame(render); else ticking = false;
  };
  const kick = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
  addEventListener('scroll', () => { sy = scrollY; if (sy < innerHeight * 1.2 || nav.classList.contains('solid') !== sy > 40) kick(); }, { passive: true });
  if (!reduce) addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; kick(); }, { passive: true });
  sy = scrollY; kick();

  // Hero cards: subtle depth on hover.
  if (!reduce) document.querySelectorAll('[data-tilt]').forEach(art => {
    const [bg, ...rest] = art.children;
    art.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      bg.style.transform = `translate(${x * -12}px,${y * -12}px) scale(1.04)`;
      rest.forEach((el, i) => el.style.transform = `translate(${x * (i === rest.length - 1 ? 18 : 6)}px,${y * (i === rest.length - 1 ? 10 : 4)}px)`);
    });
    art.addEventListener('pointerleave', () => { bg.style.transform = ''; rest.forEach(el => el.style.transform = ''); });
  });

  // Reveal on scroll.
  const targets = document.querySelectorAll('section:not(.hero) .wrap > *, .hero-card, .tile, .comic');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(t => { t.classList.add('reveal'); io.observe(t); });
  }

  // Keep the original image protection.
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());
})();
