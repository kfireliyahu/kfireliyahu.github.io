/**
 * The claim check (components/ClaimCheck.astro). The page prints it finished; once it is on screen
 * (and, on the wheel, once its chapter is the current one) it plays from the start:
 *
 *   step 0  the receipt and the statement, nothing marked; the claim waits, checking
 *   step 1  the receipt's total and the matching charge light up
 *   step 2  wires draw down from them and their figures arrive in the claim
 *   step 3  the verdict: failed, off by the difference; the prices open for editing
 *
 * It holds on the verdict for `HOLD_MS`, then plays again, on a loop. A turn waits while it is off
 * screen, while the tab is hidden, and while the pointer or focus is on it. The Pause button stops
 * the loop on the finished verdict, and Play starts it again (WCAG 2.2.2). Once the reader changes a
 * price the loop stops for good, so their figures stay: from then on any change adds the receipt up
 * again and re-checks the claim, and only then does the verdict speak to a screen reader, not on
 * every turn. Under prefers-reduced-motion it stays finished, still editable, with no button.
 * Re-bound on every `astro:page-load`, torn down before the next swap.
 */

/** When steps 1, 2 and 3 begin, in ms from the start. */
const STEPS = [450, 1150, 2350];
/** How long the verdict stays before the next turn. */
const HOLD_MS = 5000;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

type Verdict = 'checking' | 'holds' | 'failed';

/** A price as whole cents, or null if it is not a number. */
const cents = (s: string): number | null => {
  const t = s.trim().replace(',', '.');
  const n = Number(t);
  return t !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};
const money = (c: number) => (c / 100).toFixed(2);

function bind(fig: HTMLElement): () => void {
  const q = <T extends Element>(sel: string) => fig.querySelector<T>(sel)!;
  const items = Array.from(fig.querySelectorAll<HTMLInputElement>('[data-item]'));
  const total = q<HTMLElement>('[data-total]');
  const left = q<HTMLElement>('[data-left]');
  const right = q<HTMLElement>('[data-right]');
  const check = q<HTMLElement>('.claim__check');
  const badge = q<HTMLElement>('[data-badge]');
  const eq = q<HTMLElement>('[data-eq]');
  const msg = q<HTMLElement>('[data-msg]');
  const toggle = q<HTMLButtonElement>('[data-claim-toggle]');
  const charge = cents(right.textContent ?? '') ?? 0;

  let steps: number[] = [];
  let turn = 0;
  /** On screen, enough to play. */
  let seen = false;
  /** The pointer or focus is on it. */
  let held = false;
  /** The reader has changed a price; no more turns. */
  let taken = false;
  /** A turn came due while it could not play; it plays as soon as it can. */
  let owed = true;
  /** Stopped with the Pause button. */
  let paused = false;
  /** It has played once. The first play does not wait for the pointer: a reader scrolling may rest it there. */
  let played = false;

  const say = (verdict: Verdict, text: string) => {
    check.dataset.verdict = verdict;
    badge.textContent = badge.dataset[verdict] ?? verdict;
    eq.textContent = verdict === 'failed' ? '≠' : '=';
    msg.textContent = text;
  };

  // Adds the receipt up and checks the claim against the charge.
  const evaluate = () => {
    const parts = items.map((i) => cents(i.value));
    items.forEach((i, k) => (parts[k] === null ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid')));
    const sum = parts.some((p) => p === null) ? null : (parts as number[]).reduce((a, b) => a + b, 0);
    total.textContent = left.textContent = sum === null ? '—' : money(sum);
    if (sum === null) return say('checking', msg.dataset.waiting ?? '');
    if (sum === charge) return say('holds', msg.dataset.holds ?? '');
    say(
      'failed',
      (msg.dataset.failed ?? '')
        .replace('{total}', money(sum))
        .replace('{charge}', money(charge))
        .replace('{diff}', money(Math.abs(sum - charge))),
    );
  };

  // On the wheel it plays only once its chapter is lit, not while dimmed.
  const chapter = fig.closest<HTMLElement>('.chapter');
  const lit = () => !chapter || !document.documentElement.classList.contains('drum') || chapter.classList.contains('is-active');
  const free = () => seen && !(held && played) && !taken && !paused && !document.hidden && !reduced.matches && lit();

  // After the verdict has been read, the next turn: now if nothing is in the way, else when it clears.
  const next = () => {
    clearTimeout(turn);
    if (!taken) turn = window.setTimeout(() => (free() ? play() : (owed = true)), HOLD_MS);
  };
  const settle = () => {
    for (const t of steps) clearTimeout(t);
    steps = [];
    fig.dataset.step = '3';
    evaluate();
  };

  const play = () => {
    owed = false;
    played = true;
    clearTimeout(turn);
    for (const t of steps) clearTimeout(t);
    for (const i of items) i.value = i.dataset.default ?? i.value;
    evaluate();
    // Back to the start: nothing marked, the claim still checking.
    say('checking', '');
    fig.dataset.step = '0';
    void fig.offsetWidth; // so the steps transition from here rather than from the finished state
    steps = STEPS.map((ms, k) => window.setTimeout(() => (k === 2 ? (settle(), next()) : (fig.dataset.step = String(k + 1))), ms));
  };
  const resume = () => {
    if (owed && free()) play();
  };

  const looping = (on: boolean) => fig.classList.toggle('claim--looping', on);
  const onToggle = () => {
    paused = !paused;
    toggle.textContent = (paused ? toggle.dataset.play : toggle.dataset.pause) ?? '';
    toggle.setAttribute('aria-pressed', String(paused));
    if (paused) {
      clearTimeout(turn);
      settle();
    } else play();
  };
  toggle.addEventListener('click', onToggle);
  looping(!reduced.matches);

  // A price changed: the reader has it now. The loop stops, the claim re-checks at once, and from
  // here its verdict is announced.
  const onInput = () => {
    taken = true;
    looping(false);
    msg.setAttribute('aria-live', 'polite');
    clearTimeout(turn);
    if (fig.dataset.step === '3') evaluate();
    else settle();
  };
  // Prices settle to two places when the reader leaves them.
  const onBlur = (e: Event) => {
    const i = e.target as HTMLInputElement;
    const c = cents(i.value);
    if (c !== null) i.value = money(c);
  };
  for (const i of items) {
    i.readOnly = false;
    i.addEventListener('input', onInput);
    i.addEventListener('blur', onBlur);
  }
  // Focus on the Pause button is not a reason to hold: it is how the loop is restarted.
  const hold = (e: Event) => (held = e.target !== toggle);
  const release = () => {
    held = fig.matches(':hover') || (fig.contains(document.activeElement) && document.activeElement !== toggle);
    resume();
  };
  const onFocusOut = () => setTimeout(release);
  fig.addEventListener('pointerenter', hold);
  fig.addEventListener('pointerleave', release);
  fig.addEventListener('focusin', hold);
  fig.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', resume);
  fig.classList.add('claim--live');

  // On screen it may play; while it is on screen but its chapter is not lit yet, check again shortly.
  let poll = 0;
  const io = new IntersectionObserver(
    ([entry]) => {
      seen = entry.isIntersecting;
      clearInterval(poll);
      if (!seen) return;
      resume();
      if (owed) poll = window.setInterval(() => (owed ? resume() : clearInterval(poll)), 150);
    },
    { threshold: 0.45 },
  );
  io.observe(fig);

  return () => {
    io.disconnect();
    clearInterval(poll);
    clearTimeout(turn);
    for (const t of steps) clearTimeout(t);
    for (const i of items) {
      i.removeEventListener('input', onInput);
      i.removeEventListener('blur', onBlur);
    }
    fig.removeEventListener('pointerenter', hold);
    fig.removeEventListener('pointerleave', release);
    fig.removeEventListener('focusin', hold);
    fig.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', resume);
    toggle.removeEventListener('click', onToggle);
  };
}

let teardown: (() => void) | null = null;

document.addEventListener('astro:page-load', () => {
  teardown?.();
  const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-claim]')).map(bind);
  teardown = () => stops.forEach((stop) => stop());
});

document.addEventListener('astro:before-swap', () => {
  teardown?.();
  teardown = null;
});

export {};
