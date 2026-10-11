/**
 * The live demo. The plate starts as a poster (the screenshot). A click on the
 * open control replaces the poster with an iframe of Emerald's web build in
 * demo mode; the close control puts the poster back. Nothing is fetched until
 * the first click. Bound once by delegation, so it survives page swaps.
 */
function plateOf(el: Element): HTMLElement | null {
  return el.closest<HTMLElement>('[data-demo]');
}

function open(plate: HTMLElement) {
  const src = plate.dataset.demo;
  if (!src || plate.querySelector('iframe')) return;

  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = plate.dataset.demoTitle ?? 'Live demo';
  frame.loading = 'lazy';
  frame.referrerPolicy = 'no-referrer';
  frame.setAttribute('allow', '');
  frame.className = 'plate__frame';

  const img = plate.querySelector<HTMLElement>('.plate__img');
  img?.classList.add('plate__img--live');
  img?.appendChild(frame);
  plate.dataset.demoState = 'open';
  plate.querySelector<HTMLButtonElement>('[data-demo-close]')?.focus();
}

function close(plate: HTMLElement) {
  plate.querySelector('iframe')?.remove();
  plate.querySelector('.plate__img')?.classList.remove('plate__img--live');
  delete plate.dataset.demoState;
  plate.querySelector<HTMLButtonElement>('[data-demo-open]')?.focus();
}

document.addEventListener('click', (e) => {
  const t = e.target as Element | null;
  if (!t) return;
  const openBtn = t.closest('[data-demo-open]');
  const closeBtn = t.closest('[data-demo-close]');
  if (openBtn) {
    const p = plateOf(openBtn);
    if (p) open(p);
  } else if (closeBtn) {
    const p = plateOf(closeBtn);
    if (p) close(p);
  }
});
