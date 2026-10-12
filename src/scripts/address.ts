/**
 * The address follows the reader: the section being read is the address's
 * hash (#emerald), and nothing at the top of the page. It replaces the current
 * history entry rather than adding one, so Back still leaves the page instead
 * of stepping through every section, and it keeps the history state Astro's
 * router keeps there.
 *
 * Never while a scroll is moving. Changing the address mid-scroll is known to
 * stall or jerk scrolling on touch browsers (Astro's router had the same issue
 * on iOS; Firefox for Android had it with any hash change), and a friend's
 * iPhone recording of this site showed the page sliding back a section during
 * momentum scrolls. So on a touch screen the address is left alone, and with a
 * mouse or trackpad it is written once the page has been still for `SETTLE_MS`.
 */
const SETTLE_MS = 400;
const touch = window.matchMedia('(pointer: coarse)');

let timer = 0;
let pending: { hash: string; path: string } | null = null;

export function showSection(id: string | null) {
  if (touch.matches) return;
  pending = { hash: id ? `#${id}` : '', path: location.pathname };
  clearTimeout(timer);
  timer = window.setTimeout(write, SETTLE_MS);
}

function write() {
  const p = pending;
  pending = null;
  // Only on the page it was meant for: a navigation in between leaves the new page's address alone.
  if (!p || location.pathname !== p.path || location.hash === p.hash) return;
  history.replaceState(history.state, '', `${location.pathname}${location.search}${p.hash}`);
}

// A scroll still moving pushes the write back, so it lands after the scroll ends.
window.addEventListener(
  'scroll',
  () => {
    if (!pending) return;
    clearTimeout(timer);
    timer = window.setTimeout(write, SETTLE_MS);
  },
  { passive: true },
);

document.addEventListener('astro:before-swap', () => {
  clearTimeout(timer);
  pending = null;
});
