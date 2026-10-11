/**
 * The opening, home page only. Re-bound on every `astro:page-load` and torn
 * down before the next swap.
 *
 * 1. Fit. The line under the name (`[data-fit]`) is set on one row at the size
 *    that fills the opening's width, re-measured on resize and once the fonts
 *    load. Where that size would drop below `MIN_FIT` px (phones) it is left to
 *    wrap at its CSS size.
 *
 * 2. Morph. On desktop the index has two states and nothing between: a row in
 *    the opening, or the rail's column. While the row is fully on screen the
 *    rail is hidden (`.index-row` on <html>). Once the row's top passes the top
 *    of the viewport, each rail link flies in from where its twin sits in the
 *    row, one after another, and the rest of the rail fades in; scrolling back
 *    sends them back. The flight is a timed animation, not tied to the scroll,
 *    so it always finishes and the scroll stays the reader's. Under
 *    prefers-reduced-motion the rail just appears.
 *
 * 3. Wheel. On desktop the rail is a drum, like an iOS picker (`.drum` on
 *    <html>): rows shrink back and fade with their distance from the middle
 *    (`LINE`), and the drum turns to the current row through a spring. A row
 *    is current once its part of the page comes up to `REACH`; it sits lit at
 *    the middle (aria-current). The rows turn where the chapters meet; one
 *    spacer at the end (`.wheel-spacer`) lets the last row be reached. The
 *    current chapter is lit and its content rises in (`.is-active`), and the
 *    address follows the current row (address.ts). On a phone there is no
 *    rail.
 */
import { showSection } from './address';

const MIN_FIT = 28;
const FLY_MS = 650;
const STAGGER_MS = 45;
/** The drum's middle, as a share of the viewport's height from the top. */
const LINE = 0.38;
/** A row is reached once its part of the page has come up to here, as a share of the viewport from the top. */
const REACH = 0.35;
/** When the screens are measured again after start, in ms, for layout that settles late. */
const SETTLE_FITS = [300, 1200, 3000];
/** Degrees between rows on the drum, and the drum's radius in pixels. */
const STEP = 20;
const RADIUS = 150;
/** The wheel's spring: how hard it pulls toward the scroll, and how much speed it keeps per frame. */
const SPRING = 0.14;
const DAMPING = 0.72;


const desktop = window.matchMedia('(min-width: 64rem)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function fit(open: HTMLElement): () => void {
  const line = open.querySelector<HTMLElement>('[data-fit]');
  const text = line?.firstElementChild as HTMLElement | null;
  if (!line || !text) return () => {};

  const measure = () => {
    // Measure at a known size on one row, then scale to the available width.
    line.removeAttribute('data-fitted');
    line.style.setProperty('--fit', '100px');
    line.setAttribute('data-fitted', '');
    const size = (100 * line.clientWidth) / text.getBoundingClientRect().width;
    if (size >= MIN_FIT) line.style.setProperty('--fit', `${Math.floor(size * 0.995 * 100) / 100}px`);
    else line.removeAttribute('data-fitted');
  };

  const ro = new ResizeObserver(measure);
  ro.observe(open);
  document.fonts.ready.then(measure);
  return () => ro.disconnect();
}

function morph(open: HTMLElement): () => void {
  const root = document.documentElement;
  const list = open.querySelector<HTMLElement>('.open__index ol');
  const rail = document.querySelector<HTMLElement>('.rail__list');
  // While the opening's row shows, the rail is hidden; inert keeps keyboard and screen readers out of it too.
  const aside = document.querySelector<HTMLElement>('aside.rail');
  const hide = (yes: boolean) => {
    root.classList.toggle('index-row', yes);
    if (aside) aside.inert = yes;
  };
  const pairs = Array.from(open.querySelectorAll<HTMLAnchorElement>('[data-morph]'))
    .map((from) => ({ from, to: document.querySelector<HTMLAnchorElement>(`.rail__list > .rail__item > a[href="#${from.dataset.morph}"]`) }))
    .filter((p): p is { from: HTMLAnchorElement; to: HTMLAnchorElement } => p.to !== null);
  if (!list || pairs.length === 0) return () => {};

  let state: 'row' | 'column' | null = null;
  let frame = 0;

  // Each rail row flies between its twin in the opening's row and its place on the drum. The row
  // (the <li>) is what moves, from flat at the twin's place to the pose the drum gives it (its
  // transform and opacity as drawn), so the flight ends exactly where the drum has it. The link inside
  // is held visible meanwhile, over the CSS that hides it while the opening's row shows.
  const fly = (toColumn: boolean) => {
    const box = rail?.getBoundingClientRect();
    if (!box) return;
    pairs.forEach(({ from, to }, i) => {
      const li = to.parentElement!;
      for (const a of [...li.getAnimations(), ...to.getAnimations()]) if (!('transitionProperty' in a)) a.cancel();
      const f = from.getBoundingClientRect();
      const flat = { transform: `translate3d(${f.left - box.left}px, ${f.top - box.top}px, 0)`, opacity: 1 };
      const posed = { transform: li.style.transform || 'none', opacity: Number(li.style.opacity || 1) };
      const timing = {
        duration: FLY_MS,
        delay: (toColumn ? i : pairs.length - 1 - i) * STAGGER_MS,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards' as const,
      };
      li.animate(toColumn ? [flat, posed] : [posed, { ...flat, opacity: 0 }], timing);
      to.animate([{ opacity: 1 }, { opacity: 1 }], timing);
    });
  };

  const update = () => {
    frame = 0;
    if (!desktop.matches) {
      state = null;
      hide(false);
      return;
    }
    const next = list.getBoundingClientRect().top < 0 ? 'column' : 'row';
    if (next === state) return;
    const first = state === null;
    state = next;
    hide(next === 'row');
    if (!first && !reduced.matches) fly(next === 'column');
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  desktop.addEventListener('change', schedule);
  update();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    desktop.removeEventListener('change', schedule);
    hide(false);
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

type Row = {
  li: HTMLElement;
  link: HTMLAnchorElement;
  /** Where the row's stretch of the page starts: the chapter, or the project for a sub-chapter. */
  target: HTMLElement;
  chapter: HTMLElement | null;
};

function drum(): () => void {
  const root = document.documentElement;
  const list = document.querySelector<HTMLElement>('.rail__list');
  const rows: Row[] = [];
  for (const li of list?.querySelectorAll<HTMLElement>(':scope > .rail__item') ?? []) {
    const link = li.querySelector<HTMLAnchorElement>('a[href^="#"]');
    const target = link ? document.getElementById(decodeURIComponent(link.hash.slice(1))) : null;
    if (!link || !target) continue;
    rows.push({ li, link, target, chapter: target.closest<HTMLElement>('section.chapter') });
  }
  if (!list || rows.length === 0) return () => {};
  const last = rows.length - 1;

  let pos = -1; // where the drum is drawn, in rows
  let vel = 0;
  let target = -1; // the current row, as the scroll has it; -1 before the first
  let rowHeight = 0;
  let frame = 0;
  let active: HTMLElement | null = null;
  let on = false;

  /**
   * The rows turn where their chapters meet, at the page's own spacing. The one spacer, at the end of
   * the last row's chapter, gives the page just enough room below for the last row to come up to
   * `REACH`; without it a short last chapter could never become current.
   */
  const spacer = document.createElement('div');
  spacer.className = 'wheel-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  const placeSpacer = () => (rows[last].chapter ?? rows[last].target).append(spacer);
  const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
  // Repeated until nothing changes: a spacer growing from nothing can stop margins collapsing through
  // it, which moves what was just measured.
  const fitScreens = () => {
    for (let pass = 0; pass < 4 && fitOnce(); pass++);
  };
  const fitOnce = () => {
    const screen = window.innerHeight;
    // How far the page scrolls without the spacer, against how far it must for the last row to be reached.
    const room = document.documentElement.scrollHeight - spacer.offsetHeight - screen;
    const want = Math.max(0, Math.ceil(docTop(rows[last].target) - screen * REACH - room) + 2);
    if (Math.abs(spacer.offsetHeight - want) <= 0.5) return false;
    spacer.style.height = `${want}px`;
    return true;
  };
  let refit = 0;
  const timers: number[] = [];
  const scheduleFit = () => {
    if (on && !refit) refit = requestAnimationFrame(() => ((refit = 0), fitScreens(), onScroll()));
  };
  // Re-fit when the text column changes size, and when an image or the page finishes loading, which can
  // move things inside it without changing its size.
  const ro = new ResizeObserver(scheduleFit);
  const onLoad = (e: Event) => {
    if (e.type === 'load' && (e.target === window || e.target instanceof HTMLImageElement)) scheduleFit();
  };

  // A row is current once its stretch's top has come up to REACH; whole rows only.
  const fromScroll = () => {
    const line = window.innerHeight * REACH;
    let i = -1;
    rows.forEach((r, k) => {
      if (r.target.getBoundingClientRect().top <= line) i = k;
    });
    return i;
  };

  // The drum: rows shrink back and fade with distance from the middle.
  const draw = () => {
    const box = list.getBoundingClientRect();
    const band = window.innerHeight * LINE - box.top;
    list.style.setProperty('--band', `${band}px`);
    rows.forEach((r, k) => {
      const d = k - pos;
      const angle = clamp(d * STEP, -90, 90);
      const rad = (angle * Math.PI) / 180;
      const y = band + RADIUS * Math.sin(rad) - rowHeight / 2;
      const z = RADIUS * (Math.cos(rad) - 1);
      r.li.style.transform = `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${(-angle).toFixed(2)}deg)`;
      r.li.style.opacity = String(clamp(1 - Math.abs(d) * 0.26, 0, 1));
      // Past the drum's edge a row is out of sight and out of the pointer's way, but not out of the
      // keyboard's: focus on it turns the drum to it.
      r.li.style.pointerEvents = Math.abs(d) > 3.6 ? 'none' : '';
    });
  };

  // The current row is marked on the drum, so it lights as the drum turns to it.
  const mark = () =>
    rows.forEach((r, k) => (k === target ? r.link.setAttribute('aria-current', 'true') : r.link.removeAttribute('aria-current')));

  // The chapter of the current row is lit, and its content rises in.
  const light = () => {
    const next = target < 0 ? null : rows[target].chapter;
    if (next === active) return;
    active?.classList.remove('is-active');
    next?.classList.add('is-active');
    active = next;
  };

  // A row the keyboard is on is turned to the middle, like a picker, so focus never sits on a row
  // faded out at the drum's edge; when focus leaves the rail the drum turns back to the scroll's row.
  let focused: number | null = null;
  const goal = () => focused ?? target;

  // The drum turns to its row through a spring, on its own time, not the scroll's.
  const tick = () => {
    if (reduced.matches) {
      pos = goal();
      vel = 0;
    } else {
      vel = (vel + (goal() - pos) * SPRING) * DAMPING;
      pos += vel;
    }
    draw();
    if (Math.abs(goal() - pos) < 0.0005 && Math.abs(vel) < 0.0005) {
      pos = goal();
      draw();
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const onFocusIn = (e: FocusEvent) => {
    const k = rows.findIndex((r) => r.li.contains(e.target as Node));
    focused = k < 0 ? null : k;
    run();
  };
  const onFocusOut = (e: FocusEvent) => {
    if (list.contains(e.relatedTarget as Node)) return;
    focused = null;
    run();
  };

  const onScroll = () => {
    if (!on) return;
    const next = fromScroll();
    if (next !== target) {
      target = next;
      showSection(next < 0 ? null : rows[next].target.id);
      mark();
      light();
      run();
    }
    if (!frame) draw();
  };

  const clear = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('drum');
    ro.disconnect();
    for (const t of timers.splice(0)) clearTimeout(t);
    cancelAnimationFrame(refit);
    refit = 0;
    spacer.remove();
    list.style.removeProperty('--band');
    for (const r of rows) r.li.style.transform = r.li.style.opacity = r.li.style.pointerEvents = '';
    active?.classList.remove('is-active');
    active = null;
  };

  const start = () => {
    on = desktop.matches;
    if (!on) return clear();
    root.classList.add('drum');
    if (!spacer.isConnected) placeSpacer();
    rowHeight = rows[0].li.offsetHeight;
    fitScreens();
    ro.observe(document.querySelector('.main')!);
    // And again once the page has settled: layout can still move in the first moments without
    // resizing the text column (images sizing in, fonts swapping).
    for (const ms of SETTLE_FITS) timers.push(window.setTimeout(scheduleFit, ms));
    target = fromScroll();
    mark();
    pos = target;
    vel = 0;
    draw();
    light();
  };

  const onResize = () => {
    start();
    onScroll();
  };

  start();
  document.fonts.ready.then(() => on && (fitScreens(), onScroll(), draw()));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onLoad);
  list.addEventListener('focusin', onFocusIn);
  list.addEventListener('focusout', onFocusOut);
  document.addEventListener('load', onLoad, true);
  desktop.addEventListener('change', onResize);

  return () => {
    window.removeEventListener('load', onLoad);
    document.removeEventListener('load', onLoad, true);
    list.removeEventListener('focusin', onFocusIn);
    list.removeEventListener('focusout', onFocusOut);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    desktop.removeEventListener('change', onResize);
    clear();
  };
}

let teardown: (() => void) | null = null;

document.addEventListener('astro:page-load', () => {
  teardown?.();
  teardown = null;
  const open = document.querySelector<HTMLElement>('.open');
  if (!open) return;
  const stops = [fit(open), morph(open), drum()];
  teardown = () => stops.forEach((stop) => stop());
});

document.addEventListener('astro:before-swap', () => {
  teardown?.();
  teardown = null;
});

export {};
