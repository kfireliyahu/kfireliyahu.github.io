/**
 * The reel (components/Reel.astro). Its clips play one after another, round and round, while the
 * player is on screen; off screen, or with the tab hidden, the clip waits where it is. The step
 * under the frame for the clip playing fills as it plays; the steps before it stand full. A step
 * plays its clip and the sequence carries on from there. The button, or a click on the frame,
 * pauses and plays.
 *
 * Nothing loads before the player first comes on screen, and each clip fetches the next as it
 * starts. Under prefers-reduced-motion nothing plays by itself: the poster stays until the reader
 * picks a step or presses play. Re-bound on every `astro:page-load`, torn down before the next swap.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function bind(fig: HTMLElement): () => void {
  const clips = Array.from(fig.querySelectorAll<HTMLVideoElement>('[data-clip]'));
  const steps = Array.from(fig.querySelectorAll<HTMLButtonElement>('[data-step-to]'));
  const toggle = fig.querySelector<HTMLButtonElement>('[data-reel-toggle]')!;
  const frame = fig.querySelector<HTMLElement>('.reel__frame')!;
  if (clips.length === 0) return () => {};

  let at = 0;
  /** Paused by the reader, or not yet started under reduced motion. */
  let paused = reduced.matches;
  /** Enough of it on screen to be worth playing. */
  let seen = false;
  let raf = 0;

  const clip = () => clips[at];
  const canPlay = () => seen && !paused && !document.hidden;

  // The bars: the steps before the current one full, the current one as far as its clip has played.
  const fill = () => {
    const v = clip();
    const p = v.duration ? v.currentTime / v.duration : 0;
    steps.forEach((s, k) => s.style.setProperty('--p', String(k < at ? 1 : k === at ? p : 0)));
  };
  const loop = () => {
    fill();
    raf = clip().paused ? 0 : requestAnimationFrame(loop);
  };

  const label = () => {
    toggle.textContent = (paused ? toggle.dataset.play : toggle.dataset.pause) ?? '';
    toggle.setAttribute('aria-pressed', String(paused));
  };

  // Plays the current clip if it may, else holds it.
  const sync = () => {
    const v = clip();
    if (canPlay()) {
      v.preload = 'auto';
      void v.play().catch(() => {});
    } else v.pause();
    label();
  };

  const show = (k: number) => {
    const prev = clip();
    at = (k + clips.length) % clips.length;
    if (prev !== clip()) {
      prev.pause();
      prev.currentTime = 0;
    }
    clips.forEach((v, j) => v.classList.toggle('is-current', j === at));
    steps.forEach((s, j) => s.setAttribute('aria-pressed', String(j === at)));
    clip().currentTime = 0;
    fill();
    sync();
  };

  const onPlaying = (e: Event) => {
    // The first frame is on screen: the poster can go, and the next clip can start loading.
    fig.classList.add('reel--rolling');
    clips[(clips.indexOf(e.target as HTMLVideoElement) + 1) % clips.length].preload = 'auto';
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  };
  const onEnded = () => show(at + 1);
  for (const v of clips) {
    v.addEventListener('playing', onPlaying);
    v.addEventListener('ended', onEnded);
  }

  const onStep = (e: Event) => {
    paused = false;
    show(Number((e.currentTarget as HTMLElement).dataset.stepTo));
  };
  for (const s of steps) s.addEventListener('click', onStep);

  const onToggle = () => {
    paused = !paused;
    sync();
  };
  toggle.addEventListener('click', onToggle);
  const onFrame = (e: Event) => {
    if (e.target !== toggle) onToggle();
  };
  frame.addEventListener('click', onFrame);

  const io = new IntersectionObserver(
    ([entry]) => {
      seen = entry.isIntersecting;
      sync();
    },
    { threshold: 0.35 },
  );
  io.observe(fig);
  document.addEventListener('visibilitychange', sync);

  fig.classList.add('reel--live');
  show(0);

  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', sync);
    for (const v of clips) {
      v.pause();
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('ended', onEnded);
    }
    for (const s of steps) s.removeEventListener('click', onStep);
    toggle.removeEventListener('click', onToggle);
    frame.removeEventListener('click', onFrame);
  };
}

let teardown: (() => void) | null = null;

document.addEventListener('astro:page-load', () => {
  teardown?.();
  const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-reel]')).map(bind);
  teardown = () => stops.forEach((stop) => stop());
});

document.addEventListener('astro:before-swap', () => {
  teardown?.();
  teardown = null;
});

export {};
