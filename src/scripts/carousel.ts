/**
 * The poster carousel. A click on the picture shows the next slide; a dot
 * shows its slide; arrow keys on the dots move between them. Bound once by
 * delegation, so it survives page swaps. While the live demo is open over the
 * poster, the picture's click is the demo's, not the carousel's.
 *
 * It also turns by itself every `AUTOPLAY_MS`, so a reader who never clicks
 * still sees the second picture, which is the tour's point. Only while it is
 * on screen; paused while the pointer is over it or focus is in it; stopped
 * for good once the reader picks a slide; never under prefers-reduced-motion
 * or while the demo is open.
 */
const AUTOPLAY_MS = 10_000;
/** Figures the reader has taken over; they no longer turn by themselves. */
const taken = new WeakSet<Element>();

function show(figure: Element, index: number) {
  const slides = Array.from(figure.querySelectorAll<HTMLElement>('[data-slides] > .slide'));
  if (slides.length === 0) return;
  const at = (index + slides.length) % slides.length;
  slides.forEach((s, i) => {
    s.classList.toggle('is-current', i === at);
    if (i === at) s.removeAttribute('aria-hidden');
    else s.setAttribute('aria-hidden', 'true');
  });
  figure.querySelectorAll<HTMLButtonElement>('[data-slide-to]').forEach((d, i) => d.setAttribute('aria-pressed', String(i === at)));
}

function current(figure: Element): number {
  return Array.from(figure.querySelectorAll('[data-slides] > .slide')).findIndex((s) => s.classList.contains('is-current'));
}

document.addEventListener('click', (e) => {
  const t = e.target as Element | null;
  const figure = t?.closest('figure');
  if (!t || !figure) return;
  const dot = t.closest<HTMLElement>('[data-slide-to]');
  if (dot || t.closest('[data-slides]')) taken.add(figure);
  if (dot) return show(figure, Number(dot.dataset.slideTo));
  if (t.closest('[data-slides]') && !figure.matches('[data-demo-state="open"]')) show(figure, current(figure) + 1);
});

document.addEventListener('keydown', (e) => {
  const dot = (e.target as Element | null)?.closest?.<HTMLElement>('[data-slide-to]');
  const figure = dot?.closest('figure');
  if (!dot || !figure || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
  e.preventDefault();
  taken.add(figure);
  show(figure, current(figure) + (e.key === 'ArrowRight' ? 1 : -1));
  figure.querySelector<HTMLButtonElement>('[data-slide-to][aria-pressed="true"]')?.focus();
});

function autoplay(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const stops = Array.from(document.querySelectorAll<HTMLElement>('figure:has([data-slides] > .slide + .slide)')).map((figure) => {
    let seen = false;
    let held = false;
    const io = new IntersectionObserver(([entry]) => (seen = entry.isIntersecting), { threshold: 0.4 });
    io.observe(figure);
    const hold = () => (held = true);
    const release = () => (held = figure.matches(':hover') || figure.contains(document.activeElement));
    figure.addEventListener('pointerenter', hold);
    figure.addEventListener('pointerleave', release);
    figure.addEventListener('focusin', hold);
    figure.addEventListener('focusout', () => setTimeout(release));
    const timer = window.setInterval(() => {
      if (seen && !held && !taken.has(figure) && !figure.matches('[data-demo-state="open"]') && !document.hidden) show(figure, current(figure) + 1);
    }, AUTOPLAY_MS);
    return () => {
      clearInterval(timer);
      io.disconnect();
    };
  });
  return () => stops.forEach((stop) => stop());
}

let stopAutoplay: (() => void) | null = null;
document.addEventListener('astro:page-load', () => {
  stopAutoplay?.();
  stopAutoplay = autoplay();
});
document.addEventListener('astro:before-swap', () => {
  stopAutoplay?.();
  stopAutoplay = null;
});

export {};
