/**
 * The address follows the reader: the section being read is the address's
 * hash (#emerald), and nothing at the top of the page. It replaces the current
 * history entry rather than adding one, so Back still leaves the page instead
 * of stepping through every section, and it keeps the history state Astro's
 * router keeps there.
 */
export function showSection(id: string | null) {
  const hash = id ? `#${id}` : '';
  if (location.hash === hash) return;
  history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`);
}
