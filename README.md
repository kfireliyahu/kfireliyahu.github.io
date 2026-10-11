# kfireliyahu.com

Static site for [kfireliyahu.com](https://kfireliyahu.com), built with [Astro](https://astro.build) and served by GitHub Pages from the repo `kfireliyahu/kfireliyahu.github.io`.

No framework runtime ships to the browser: the scripts are a few small modules in `src/scripts/` (the opening and the index wheel, scroll reveal, the claim check, the clip player) and Astro's page-transition router. All motion stops under `prefers-reduced-motion`. No analytics, no CMS.

## Work on it

Requires Node 22.12 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # writes dist/
npm run preview    # serves dist/
npm run check      # type-checks the .astro files
npm run check:copy # fails while any [[placeholder]] remains in src/data/copy.ts
npm run og-image   # redraws public/og.png, the link preview card
```

## Where things are

| Path | What |
| --- | --- |
| `src/data/copy.ts` | Every sentence the site prints. Placeholders are in `[[double brackets]]`. |
| `src/pages/index.astro` | The front page: the opening, then five chapters in order. |
| `src/pages/404.astro` | Served by GitHub Pages for unknown paths. |
| `src/layouts/Base.astro` | Head tags, fonts, page transitions, footer. |
| `src/styles/global.css` | Colours (light and dark), type, layout, motion. |
| `src/scripts/demo.ts` | The live Emerald demo: swaps the screenshot for an iframe on click, never before. Hidden until `emerald.demo.src` in copy.ts is a real URL. |
| `src/components/ClaimCheck.astro`, `src/scripts/claim.ts` | The claim check in Emerald's chapter: a receipt against a card charge, a claim that fails, and prices the reader can change. Stands in the poster's place while `emerald.poster` in copy.ts is `'claim'` and the demo is not live. |
| `src/components/Reel.astro`, `src/scripts/reel.ts` | A project's clips in one wide player with a row of steps under it, playing in turn while on screen. Usuals uses it (`usuals.reel` in copy.ts); its media is in `public/images/usuals/`, from the extension's `design-ref/demo/`. |
| `src/lib/public.ts` | Finds files in `public/` at build time. Images print only when their file is there. |
| `src/scripts/reveal.ts` | Reveal on scroll, the index highlight, and the light/dark toggle (stored in `localStorage` as `theme`; nothing stored means follow the system). Motion is off under `prefers-reduced-motion`. |
| `scripts/og-image.html` | The link preview card. `npm run og-image` draws it into `public/og.png` with a headless Chrome or Edge; run it again after changing its words. |
| `public/CNAME` | The custom domain, for a branch deploy. This site deploys through Actions, where GitHub ignores the file; the domain is set once in the repo's Pages settings. |
| `public/images/` | Screenshots. The Emerald poster is four files, `emerald.png`, `emerald-dark.png`, `emerald-claim.png` and `emerald-claim-dark.png`, copied in by Emerald's session. |
| `.github/workflows/deploy.yml` | Builds and deploys on every push to `main`. |

### Filling in the copy

Edit `src/data/copy.ts`. Placeholders render with a dashed outline in the preview so none can hide. The deploy workflow runs `npm run check:copy` before building and stops if any remain, so the live site never prints a placeholder. Set a link field to `null` to leave that link out entirely.

### Switching on the Emerald links and demo

The site goes live before Emerald's repo, domain and demo answer. Each has a switch in the `live` object near the top of `src/data/copy.ts`; while a switch is off the page prints nothing for it, no link, no control, no iframe, and a one-line note says the walkthrough is coming. Flip a switch when its address answers. Nothing else on the page changes.

### Usuals: entry page and privacy policy

Usuals (the Google Calendar extension, called Weekly Life Pool until 2026-10-11) has an entry page at `/calendar-usuals`, `src/pages/calendar-usuals.astro`. The extension links there, so the path must stay. Its title, heading and `og:site_name` read exactly `Usuals`, because Google's OAuth brand check compares them with the consent screen. Keep Google's name out of the product name: "Works with Google Calendar" under it is fine, "Usuals for Google Calendar" is not.

The privacy policy is live at `/calendar-usuals/privacy` (`src/pages/calendar-usuals/privacy.astro`). Its text, `src/content/calendar-usuals-privacy.md`, is published as written from the extension's `PRIVACY.md`; when that changes, replace the copy here and keep the effective date in its frontmatter. The entry page links to it.

### Adding `/essays` or `/resume` later

Add `src/pages/essays/index.astro` (or `src/pages/resume.astro`) using `Base.astro`. Inner pages show the small name link at the top; the home page does not. Then add the link where it belongs in `copy.ts`. Nothing links to those paths until you do.

## Deploy

Every push to `main` builds the site in GitHub Actions and publishes it to GitHub Pages (`.github/workflows/deploy.yml`), so `dist/` is never committed. The build refuses to run while any placeholder remains in `copy.ts`. A run can also be started by hand from the repo's Actions tab.

The custom domain is set in the repo's **Settings → Pages**, with HTTPS enforced, and its DNS points at GitHub Pages' published addresses.
