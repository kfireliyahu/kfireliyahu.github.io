# kfireliyahu.com

Static site for [kfireliyahu.com](https://kfireliyahu.com), built with [Astro](https://astro.build) and served by GitHub Pages from the repo `kfireliyahu/kfireliyahu.github.io`.

No framework runtime ships to the browser. The only scripts are the scroll reveal and Astro's page-transition router. No analytics, no CMS.

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
| `src/pages/index.astro` | The one page, six sections in order. |
| `src/pages/404.astro` | Served by GitHub Pages for unknown paths. |
| `src/layouts/Base.astro` | Head tags, fonts, page transitions, footer. |
| `src/styles/global.css` | Colours (light and dark), type, layout, motion. |
| `src/scripts/demo.ts` | The live Emerald demo: swaps the screenshot for an iframe on click, never before. Hidden until `emerald.demo.src` in copy.ts is a real URL. |
| `src/components/ClaimCheck.astro`, `src/scripts/claim.ts` | The claim check in Emerald's chapter: a receipt against a card charge, a claim that fails, and prices the reader can change. Stands in the poster's place while `emerald.poster` in copy.ts is `'claim'` and the demo is not live. |
| `src/components/Reel.astro`, `src/scripts/reel.ts` | A project's clips in one wide player with a row of steps under it, playing in turn while on screen. Usuals uses it (`usuals.reel` in copy.ts); its media is in `public/images/usuals/`, from the extension's `design-ref/demo/`. |
| `src/lib/public.ts` | Finds files in `public/` at build time. Images print only when their file is there. |
| `src/scripts/reveal.ts` | Reveal on scroll, the index highlight, and the light/dark toggle (stored in `localStorage` as `theme`; nothing stored means follow the system). Motion is off under `prefers-reduced-motion`. |
| `scripts/og-image.html` | The link preview card. `npm run og-image` draws it into `public/og.png` with a headless Chrome or Edge; run it again after changing its words. |
| `public/CNAME` | The custom domain. Must stay, or Pages drops the domain on the next deploy. |
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

## Deploy to GitHub Pages with the custom domain

The build runs in GitHub Actions and publishes with the Pages deployment action, so the `dist/` folder is never committed.

### 1. Repository

1. Create the public repo `kfireliyahu/kfireliyahu.github.io` on GitHub. Leave it empty (no README, no license).
2. From this folder:

```bash
git init -b main
```

```bash
git add -A && git commit -m "First version"
```

```bash
git remote add origin git@github.com:kfireliyahu/kfireliyahu.github.io.git
```

```bash
git push -u origin main
```

3. In the repo: **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**. The push above already triggered the workflow; it will have failed at that point only if placeholders remain in `copy.ts`.

### 2. Cloudflare DNS

In the Cloudflare dashboard for `kfireliyahu.com`, **DNS → Records**, add these. Leave the proxy switched **off (DNS only, grey cloud)** until GitHub has issued its certificate; see step 4.

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `kfireliyahu.github.io` | DNS only |

The AAAA rows are optional (IPv6). The four A records are GitHub's published Pages addresses; verify against [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) if this file is old.

Remove any other A, AAAA or CNAME record on `@` or `www` that Cloudflare created, or the domain will not resolve to Pages.

### 3. Custom domain in GitHub

In the repo, **Settings → Pages → Custom domain**: enter `kfireliyahu.com` and save. GitHub checks DNS; this can take a few minutes after the records go in. The `public/CNAME` file keeps this setting across deploys.

Optional but worth doing: **GitHub profile → Settings → Pages → Add a domain** to verify `kfireliyahu.com` for the account. It asks for one TXT record in Cloudflare and stops anyone else from claiming the domain on Pages.

### 4. HTTPS

Once the domain check passes, GitHub requests a Let's Encrypt certificate. When the **Enforce HTTPS** box in **Settings → Pages** becomes available, tick it. Issuance can take up to an hour.

After that, you may turn the Cloudflare proxy on (orange cloud) for the `@` and `www` records if you want Cloudflare in front. If you do, set **SSL/TLS → Overview** to **Full (strict)**. Any other mode either breaks the site or sends traffic in the clear between Cloudflare and GitHub. Leaving the proxy off is also fine; GitHub serves HTTPS directly.

`www.kfireliyahu.com` redirects to the apex automatically once the apex is the configured custom domain.

### 5. Check

- `https://kfireliyahu.com` loads with a valid certificate.
- `https://www.kfireliyahu.com` redirects to the apex.
- `https://kfireliyahu.com/anything` shows the 404 page.
