/**
 * Two small behaviours, both re-run after each ClientRouter page swap.
 *
 * 1. Reveal on scroll. Elements carrying `data-reveal` start hidden (CSS, only
 *    when the html element has the `js` class) and get `.is-visible` once they
 *    enter the viewport. Under prefers-reduced-motion everything shows at once.
 *
 * 2. The index. The rail link whose chapter is crossing the middle of the
 *    viewport gets aria-current, so a reader always knows where they are, and
 *    the address follows it (address.ts).
 */
import { showSection } from './address';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Observers watching the current page, switched off before the next one swaps in. */
const observers: IntersectionObserver[] = [];

function reveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (items.length === 0) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    for (const el of items) el.classList.add('is-visible');
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  observers.push(io);

  for (const el of items) {
    // Anything already on screen fades in right away rather than waiting for a scroll event.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => el.classList.add('is-visible'));
    } else {
      io.observe(el);
    }
  }
}

function index() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.rail__item a[href^="#"]'));
  if (links.length === 0 || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map((a) => [a.getAttribute('href')!.slice(1), a]));
  const targets = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  // The current entry is the last target whose top has passed the middle of the viewport.
  // A sub-chapter sits inside its chapter, so it wins while the reader is in it.
  const update = () => {
    // On a wide screen the wheel (opening.ts) marks the current row and sets the address.
    if (document.documentElement.classList.contains('drum')) return;
    const middle = window.innerHeight * 0.45;
    let current: HTMLElement | null = null;
    for (const t of targets) {
      if (t.getBoundingClientRect().top <= middle) current = t;
    }
    for (const a of links) a.removeAttribute('aria-current');
    if (current) byId.get(current.id)?.setAttribute('aria-current', 'true');
    showSection(current?.id ?? null);
  };

  const io = new IntersectionObserver(update, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  for (const t of targets) io.observe(t);
  observers.push(io);
  update();
}

/**
 * 3. The colour scheme. With nothing stored the page follows the system; the
 *    toggle stores `light` or `dark` and sets data-theme on <html>. The button
 *    shows the scheme it would switch to. Re-applied after a page swap, since
 *    the router replaces the <html> attributes.
 */
type Theme = 'light' | 'dark';

function stored(): Theme | null {
  try {
    const t = localStorage.getItem('theme');
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

function current(): Theme {
  return stored() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme() {
  const s = stored();
  if (s) document.documentElement.dataset.theme = s;
  else delete document.documentElement.dataset.theme;
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    b.dataset.current = current();
  }
}

function theme() {
  applyTheme();
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    b.addEventListener('click', () => {
      const next: Theme = current() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* private mode: the choice lasts for this page only */
      }
      document.documentElement.dataset.theme = next;
      for (const x of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) x.dataset.current = next;
    });
  }
}

function init() {
  reveal();
  index();
  theme();
}

init();
document.addEventListener('astro:after-swap', init);
// Off before the swap: once its sections leave the page, the index would take the last of them for
// the current one and write it into the next page's address.
document.addEventListener('astro:before-swap', () => {
  for (const io of observers.splice(0)) io.disconnect();
});
// With nothing stored, a system change flips the button label too.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

// A module, so its top-level names stay its own.
export {};
