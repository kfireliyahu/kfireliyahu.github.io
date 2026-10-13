/**
 * Every sentence the site prints lives here. Kfir writes them.
 *
 * Placeholders are wrapped in [[double brackets]]. The page renders them with a
 * dashed outline so they stand out in the preview, and `npm run check:copy`
 * (also run in CI before deploy) fails while any remain.
 *
 * Optional fields: set a link to `null` and the page omits it, so nothing on the
 * site points at something that does not exist yet.
 */

import type { IconName } from '../lib/icons';

export type Link = { label: string; href: string };

/**
 * A button for what the reader can do next (components/Actions.astro). While `href` is null the
 * address is not live yet: the button prints quiet and unclickable with its `soon` note, or not at
 * all without one. `primary` fills the button; one per row at most.
 */
export type Action = { label: string; href: string | null; icon: IconName; soon?: string | null; primary?: boolean };

export const site = {
  name: 'Kfir Raphael Eliyahu',
  domain: 'kfireliyahu.com',
  /** <title> and meta description of the home page. */
  title: 'Kfir Raphael Eliyahu',
  description: 'Kfir Raphael Eliyahu, software engineer and designer, fixing problems with creative software.',
  /** Printed in the footer. */
  copyright: '© 2026 Kfir Raphael Eliyahu',
};

/** Labels on controls. */
export const ui = {
  /** The theme toggle says what it will switch to. */
  theme: { toDark: 'Dark', toLight: 'Light', label: 'Colour scheme' },
  /** The first link on every page, shown only when focused: straight past the opening and the index. */
  skip: 'Skip to content',
  /** Printed on a button whose address is not live yet. */
  soon: 'Coming soon',
  /** Printed before a project's stack. */
  builtWith: 'Built with',
};

/** 1. Name and one line on what you make. The name is set edge to edge on one line. */
export const intro = {
  heading: site.name,
  line: 'Fixing problems with creative software',
  /** Printed small in the top bar, linking into the page. Set to null to omit. */
  now: { label: 'Now building', text: 'Emerald', href: '#emerald' } as (Link & { text: string }) | null,
  /** The arrow under the index that scrolls to the first chapter. */
  down: 'Start reading',
};

/**
 * Emerald's addresses (identity plan Q-11 and D-23, Emerald D-430). The site
 * goes live before these answer (identity plan D-25: site first, quietly), so
 * each has a switch below. While a switch is off the page prints nothing for
 * it: no link, no control, no iframe; only Emerald's own site shows, as a
 * "Coming soon" button that goes nowhere (Kfir, 2026-10-12). Flip it when the
 * address answers; nothing else on the page changes.
 */
const emeraldRepo = 'emerald-emd';
const emeraldRepoUrl = `https://github.com/kfireliyahu/${emeraldRepo}`;
/** Emerald's own domain, bought 2026-10-08. The demo base moves here (https://getemerald.dev/tour.html) once Emerald's Pages point at it. */
const emeraldSiteUrl = 'https://getemerald.dev/';
/**
 * The tour frame itself, not the folder: since Emerald's D-459 the demo build's index.html is
 * Emerald's own page and the frame is tour.html beside it (site.emd inbox, 2026-10-12).
 */
const emeraldDemoBase = `https://kfireliyahu.github.io/${emeraldRepo}/tour.html`;

const live = {
  /** github.com/kfireliyahu/emerald-emd is public. */
  emeraldRepo: false,
  /** getemerald.dev answers. */
  emeraldSite: false,
  /** The tour is deployed at emeraldDemoBase. */
  emeraldDemo: false,
};

/** The value while its switch is on, nothing while it is off. */
const when = <T>(on: boolean, value: T): T | null => (on ? value : null);

/** 2. Emerald, in depth. */
export const emerald = {
  name: 'Emerald',
  /** Emerald's own icon, copied from its src/ui/emerald.svg. Beside the chapter heading and the "Now building" link. */
  icon: '/images/emerald-icon.svg',
  /**
   * The deck line under the chapter heading. Emerald's own sentence, the first
   * line of its README, as the Emerald session asked (its D-413): never "a
   * finance app". Set to null to omit.
   */
  tagline: 'Where what you and an AI worked out goes to stay true — in a file you own.' as string | null,
  /**
   * The three passages under the plate, in order. Condensed by Claude on 2026-10-11 from Kfir's own
   * rewrite, keeping its points; the depth (each pack, the comparison with spreadsheets and note
   * apps) went to Emerald's own site through its docs/memory.emd inbox. Kfir's to change.
   */
  problem: {
    label: 'The problem',
    body: [
      'When you work something out with an AI, what counts as a grocery charge, where a project stands, the answer lands in a chat log, or in a note that was right the day it was written. Change one figure underneath and the conclusion resting on it is quietly wrong, and nothing says so.',
      'AI raised how much we produce, not how sure we can be of it. Spreadsheets and note apps promise order, but none of them tells you when something stopped being true.',
    ],
  },
  whatItIs: {
    label: 'What it is',
    body: [
      'Emerald is the typed middle. You declare a format for anything you want to keep true like a book, a paycheck, a milestone, an idea. It becomes a real table with real types and checks that say when something stops adding up. You fill it by reading a document, by talking to a model, or by hand. It works with AI and without it.',
      'Formats can come in packs: a ledger for your finances, a development pack that gives AI agents a shared memory and a way to hand work to each other, and your own, built on top of them.',
    ],
  },
  yours: {
    label: 'Local, and yours',
    body: [
      // "Sends nothing anywhere itself": the app makes no network call, but what a model reads in a
      // conversation goes to that model's provider, so "your data never leaves" would overclaim.
      'Emerald runs on your machine, with no account and no server, and sends nothing anywhere itself. Your work is a plain file that ordinary tools can open, and you can back it up wherever you like. If the project stopped tomorrow, your data would still be yours.',
    ],
  },
  /**
   * The poster: a carousel of two pictures from Emerald's tour, each in a
   * light and a dark version, drawn by Emerald's `npm run demo:poster` and
   * copied into public/images/ by the Emerald session under these names
   * (1600x1000). The version shown follows the site's colour scheme. The
   * first is the end of the tour's first scene, the second its last scene.
   * A slide whose light file is missing is left out; with none, the page
   * prints no plate (a marked box in the dev preview only). Set `screenshot`
   * to null to leave it out for good. Alt texts as suggested by the Emerald
   * session; Kfir's to change.
   */
  screenshot: {
    slides: [
      {
        src: '/images/emerald.png',
        dark: '/images/emerald-dark.png',
        alt: 'Emerald’s walkthrough: a card statement open, the grocery-store charge outlined.',
      },
      {
        src: '/images/emerald-claim.png',
        dark: '/images/emerald-claim-dark.png',
        alt: 'The receipt says 84.00, the card charged 96.00: Emerald marks the claim failed, off by 12.00.',
      },
    ],
    caption: null as string | null,
    width: 1600,
    height: 1000,
    /** Names the dots under the carousel, as in "Picture 1 of 2". */
    picture: 'Picture',
  } as {
    slides: { src: string; dark: string | null; alt: string }[];
    caption: string | null;
    width: number;
    height: number;
    picture: string;
  } | null,
  /**
   * What stands in the plate's place while the live demo is not up. 'claim' prints the claim check
   * (src/components/ClaimCheck.astro): a receipt and the card statement it was paid on, a claim that
   * they agree drawing in and failing, then the receipt's prices left open for the reader to change
   * and watch the claim answer. 'screenshots' prints the carousel above. Once the demo is live the
   * plate returns either way, since the screenshots are its poster.
   */
  poster: 'claim' as 'claim' | 'screenshots',
  /**
   * The claim check's words and figures, from the tour's own receipt (Corner Market, 84.00 against
   * 96.00). The receipt's items must add up to its total. In the messages, {total}, {charge} and
   * {diff} are filled in as the reader changes the figures. Drafted by Claude, 2026-10-11; Kfir's to
   * rewrite.
   */
  claim: {
    question: 'Did the card charge what the receipt says?',
    receipt: {
      label: 'Receipt',
      shop: 'Corner Market',
      date: '29 Jul 2026',
      items: [
        { name: 'Bread', amount: '12.00' },
        { name: 'Olive oil', amount: '38.00' },
        { name: 'Tomatoes', amount: '9.50' },
        { name: 'Cheese', amount: '24.50' },
      ],
      total: 'Total',
    },
    statement: {
      label: 'Card statement',
      rows: [
        { date: '27 Jul', merchant: 'Book Nook', amount: '60.00' },
        { date: '29 Jul', merchant: 'Corner Market', amount: '96.00' },
        { date: '30 Jul', merchant: 'Town Bakery', amount: '18.00' },
      ],
      /** Which row the receipt was paid with. */
      match: 1,
    },
    name: 'total_adds_up',
    left: 'receipt.total',
    right: 'charge.amount',
    exactly: 'exactly',
    states: { checking: 'checking', holds: 'holds', failed: 'failed' },
    failed: 'The receipt says {total}, the card charged {charge}: off by {diff}, where 0.00 is allowed.',
    holds: 'The receipt and the card agree, to the cent.',
    waiting: 'Waiting for a number.',
    /** Under the plate once the check has played. */
    hint: 'Change any price on the receipt and the claim checks itself again.',
    /** The button that stops the loop, and starts it again. */
    pause: 'Pause',
    play: 'Play',
  },
  /**
   * The live demo: Emerald's tour (its D-413), the real app walked by a drawn
   * pointer through the custom-format workflow, on a synthetic document. The
   * visitor can stop it and take over; Reset replays. The site loads it only
   * when the reader clicks, with the screenshot above as the poster. While
   * `src` is a placeholder the button stays hidden and only the screenshot
   * shows. Below a width the frame renders itself scaled as a movie, so the
   * button shows on phones too.
   *
   * Contract (Emerald D-413, D-418): one deployed build serves Emerald's own
   * page and this site; `?tour=<name>` picks a tour and `?autoplay=1` plays
   * it. Without autoplay the frame shows the tour's poster under its own
   * "Watch the tour" control. This site keeps its own poster and click, then
   * loads the frame with autoplay, since the click already was the consent.
   * The frame posts `{source:'emerald-demo', event:'step'|'took-over'|'reset'}`
   * to its parent; nothing here listens. The app lays out no narrower than
   * about 960px and is a crop below 690px.
   *
   * The URL is the hosted build's tour frame, tour.html, plus
   * `?tour=custom&autoplay=1`. Emerald's repo publishes to GitHub Pages under
   * the same account as this site, so until Emerald's own domain points at it,
   * once the apex is this site's custom domain the demo is also served at
   * https://kfireliyahu.com/emerald-emd/tour.html (GitHub serves project sites
   * under the user site's custom domain).
   */
  demo: {
    src: when(live.emeraldDemo, `${emeraldDemoBase}?tour=custom&autoplay=1`),
    open: 'Open the live demo',
    close: 'Close the demo',
    /** Optional one line under the plate once the demo is live, e.g. that the figures are made up. Set to null to omit. */
    note: null as string | null,
    /**
     * Printed instead while the demo is not live. Wording suggested by the
     * identity session; Kfir's to change. Set to null to print nothing.
     */
    pending: 'The walkthrough arrives with the public release.' as string | null,
  },
  /** Printed small beside the links. Set to null to leave it out. */
  licence: 'AGPL-3.0' as string | null,
  /** What it is built with, printed above the links. Read off its package.json. Set to null to omit. */
  stack: ['TypeScript', 'React', 'SQLite', 'Electron', 'MCP'] as string[] | null,
  /** The buttons under the text. Emerald's own site first, shown as coming soon until it answers. */
  actions: [
    { label: 'getemerald.dev', href: when(live.emeraldSite, emeraldSiteUrl), icon: 'external', soon: ui.soon, primary: true },
    { label: 'Source on GitHub', href: when(live.emeraldRepo, emeraldRepoUrl), icon: 'github' },
  ] satisfies Action[] as Action[],
  /** Smaller links after the buttons. */
  links: {
    demo: null as Link | null,
    /** Room for the essay later. Leave null until /essays ships. */
    essay: null as Link | null,
  },
};

/**
 * A project as the Project component prints it. Everything optional is left
 * out of the page when null or empty; an image renders only if its file is in
 * public/. `points` fold under a "More" disclosure.
 */
export type Point = { title: string; text: string };
/**
 * Short silent clips played one after another in a wide player, each named in a row of steps under
 * it (components/Reel.astro). The poster stands in where the clips do not play: without script,
 * and under reduced motion until a step is picked. A clip whose file is missing is left out.
 */
export type Reel = {
  poster: { src: string; dark: string | null; alt: string; width: number; height: number };
  clips: { src: string; label: string; alt: string }[];
  /** Names the row of steps for screen readers. */
  label: string;
  pause: string;
  play: string;
};
export type Project = {
  id: string;
  name: string;
  /** Where the name links, if anywhere. */
  href?: string | null;
  /** Public path of a small icon, e.g. /images/tetra-icon.svg. */
  icon?: string | null;
  /** Small running label: platform and years. */
  kicker?: string | null;
  /** Row variant only: printed at the end of the line. */
  platform?: string | null;
  /** The one line. */
  line?: string | null;
  body?: string[] | null;
  points?: Point[] | null;
  shot?: { src: string; alt: string; width: number; height: number } | null;
  /** Clips that show it working, printed wide under the header, above the text. */
  reel?: Reel | null;
  /** Buttons for what to do next (get it, read more), printed above the links. */
  actions?: Action[] | null;
  links?: Link[] | null;
  /** What it is built with, a few names, printed above the links. */
  stack?: string[] | null;
  /**
   * A live demo, loaded in the capture's place when the reader clicks. Same
   * contract as Emerald's: nothing loads before the click, and the control
   * stays hidden while `src` is a placeholder.
   */
  demo?: { src: string | null; open?: string; close?: string; note?: string | null } | null;
};

/**
 * Usuals in the Chrome Web Store: the first button on the front page and on its own page. Set
 * `href` to the listing once it is published; until then the button says it is coming.
 */
const usualsStore: Action = { label: 'Chrome Web Store', href: null, icon: 'extension', soon: ui.soon, primary: true };

/**
 * 3. Usuals, shorter. Printed with the Project component, full variant.
 * Called Weekly Life Pool until 2026-10-11 (pool.emd D-27).
 */
export const usuals: Project = {
  id: 'usuals',
  name: 'Usuals',
  icon: '/images/usuals-icon.svg',
  kicker: 'Chrome extension, 2026',
  /** Also the deck on the Usuals page. */
  line: 'Your usual events, kept beside Google Calendar and one drag away from your week.',
  /** Also the body of the Usuals page. */
  body: [
    'Most weeks are built from the same few events: a workout, a call home, deep work, groceries. ' +
      'Usuals keeps them in a sidebar in Google Calendar’s Week and Day views; drag one onto a time slot and it becomes a real event.',
  ],
  /** Optional. Each point is a short title and one sentence. Leave empty for none. */
  points: [
    { title: 'No server', text: 'Items travel through your own Chrome sync; nothing is sent anywhere except Google’s Calendar API.' },
    { title: 'Keyboard path', text: 'Everything you can drag, you can also do from the keyboard: pick an item, then a slot.' },
    // From the extension's site.emd inbox row of 2026-10-11 (pool.emd M8 U18).
    { title: 'Export and import', text: 'Your usuals go out to a file and come back in, since Chrome is the only other place they are kept.' },
  ],
  /** Read off the extension's package.json and manifest. */
  stack: ['TypeScript', 'React', 'Tailwind CSS', 'Chrome Manifest V3', 'Google Calendar API'],
  /**
   * The four clips and the store screenshots, recorded on a demo calendar by the extension's session
   * (google-calendar-pool/design-ref/demo; site.emd inbox, 2026-10-11, re-cut the same day with the
   * camera following the pointer) and copied into
   * public/images/usuals/. Recorded on a demo account; the clips are light only. Order, step lines
   * and what each clip shows are the author's, from that inbox row. Never imply Google made it.
   */
  reel: {
    poster: {
      src: '/images/usuals/week-light.png',
      dark: '/images/usuals/week-dark.png',
      alt: 'The Usuals sidebar beside a week in Google Calendar, with usuals grouped under Work, Home, Health and People.',
      width: 1280,
      height: 800,
    },
    clips: [
      { src: '/images/usuals/1-add-a-usual.mp4', label: 'Keep your usual events beside your week', alt: 'Typing “Workout” into the sidebar under the Health calendar; it appears as a chip.' },
      { src: '/images/usuals/2-drag-onto-a-time.mp4', label: 'Drag one onto a time, and it’s a real event', alt: 'Dragging Workout onto Sunday at 1 pm, where it becomes a real event.' },
      { src: '/images/usuals/3-pick-and-click.mp4', label: 'Or pick one and click a time', alt: 'Picking Workout with its calendar button, then clicking Thursday at 1 pm, with no dragging.' },
      { src: '/images/usuals/4-shift-repeats-weekly.mp4', label: 'Hold Shift to make it repeat weekly', alt: 'Shift-dragging House Cleanup onto Friday; in the next week it is there again.' },
    ],
    label: 'What the clip shows',
    pause: 'Pause',
    play: 'Play',
  },
  actions: [usualsStore, { label: 'About Usuals', href: '/calendar-usuals', icon: 'arrow-right' }],
  /** A live demo, if one is ever made. Its control shows only beside a `shot`, its poster; the reel above has none. */
  demo: { src: null, open: 'Open the live demo', close: 'Close the demo', note: null },
};

/**
 * Pages beyond the front page. Each ships only when its text exists: the page
 * file lives in src/pages/_drafts/ until then, and nothing links to it.
 */
export const pages = {
  /**
   * Usuals' entry page, src/pages/calendar-usuals.astro. The extension's
   * sidebar footer link and its manifest homepage_url point here, so the path
   * must exist at launch (pool.emd M7 U6, D-27). Its line and body are
   * usuals.line and usuals.body above.
   */
  usuals: {
    path: '/calendar-usuals',
    /**
     * Must read exactly "Usuals": it is the page title, the heading and
     * og:site_name, and Google's OAuth brand check compares it with the
     * consent screen's app name.
     */
    name: 'Usuals',
    /** Google's own permitted phrasing. Never "Usuals for Google Calendar", never a Google logo. */
    worksWith: 'Works with Google Calendar',
    description: 'Usuals keeps your usual events in a sidebar beside Google Calendar’s week and day views; drag one onto a time and it becomes an event.',
    /** The Chrome Web Store button; its address is set on usualsStore above. */
    store: usualsStore,
    /** The button back to the front page, at the top of the page. */
    back: { label: 'Back to kfireliyahu.com', href: '/#usuals' } as Link,
    /** The privacy link prints once the privacy page is built (see usualsPrivacy). */
    privacy: 'Privacy policy',
    support: 'Support',
    trademark: 'Google Calendar is a trademark of Google LLC.',
  },
  /**
   * Usuals' privacy policy, for its Chrome Web Store OAuth review.
   * Stable path: /calendar-usuals/privacy. Kfir writes the text as Markdown in
   * src/content/calendar-usuals-privacy.md; then the page file moves from
   * src/pages/_drafts/calendar-usuals/privacy.astro to
   * src/pages/calendar-usuals/privacy.astro and the route goes live.
   */
  usualsPrivacy: {
    path: '/calendar-usuals/privacy',
    title: 'Usuals Privacy Policy',
    /** The button back to the Usuals page, at the top of the page. */
    back: { label: 'Back to Usuals', href: '/calendar-usuals' } as Link,
    description: 'How Usuals handles your data: it has no server, and sends nothing anywhere except Google’s Calendar API.',
  },
};

/** 4. How I work: one paragraph. */
export const howIWork = {
  heading: 'How I work',
  body: 'With attentive focus, will, insight, and care. Listening to the problem finding a creative solution, then implementing it with the right tools and the right design.',
};

/**
 * 5. Earlier work: one sub-chapter per project (04.1, 04.2), each printed with
 * the same Project component as everything else. Icons and screenshots came
 * over from the old site.
 */
export const earlierWork = {
  heading: 'Earlier work',
  /** Optional one line under the heading. Set to null to omit. */
  lead: null as string | null,
  items: [
    // Earlier work is a showcase now, not a pitch: written as a look back at what was built, not an
    // advert. Tetra's code is not on this machine, so its text says only what the old copy and the
    // capture show; Kfir's to add what was hard or notable in it.
    {
      id: 'tetra',
      name: 'Tetra',
      icon: '/images/tetra-icon.svg',
      kicker: '2022 to 2024',
      platform: 'Android',
      line: 'An AI day planner for Android.',
      body: [
        'Tetra brought tasks, goals and the calendar into one app, with an AI planner arranging the day around them: the month on top, the day’s plan below.',
      ],
      /** Optional short points. Leave the list empty for none. */
      points: [],
      shot: { src: '/images/tetra-shot.png', alt: 'Tetra: a month calendar on a phone, with the day planner below it.', width: 379, height: 758 },
      /** Its code is not on this machine; fill in from memory, or leave null to print nothing. */
      stack: null,
      /** Its Google Play listing, found under Mooncrest's other apps on 24 Hours' page, 2026-10-12. */
      actions: [{ label: 'Get it on Google Play', href: 'https://play.google.com/store/apps/details?id=com.mooncrest.tetra', icon: 'download', primary: true }],
      links: [],
    },
    // Facts read off the app's code (TwentyFourHours, version 2.7.11) on 2026-10-11; the
    // download count is Kfir's, from the old site.
    {
      id: '24-hours',
      name: '24 Hours',
      icon: '/images/24-hours-icon.svg',
      kicker: '2022 to 2024',
      platform: 'Android',
      line: 'A habit tracker built around a 24-hour dial.',
      body: [
        'The day is drawn as a dial, with habits and timed activities as arcs around it. I built it alone and shipped it on Google Play in English and Hebrew, where it passed 10,000 downloads: about 22,000 lines of Kotlin over two years of releases.',
      ],
      points: [
        { title: 'Drawn by hand', text: 'The dial and every chart are drawn on a Compose canvas, no chart library.' },
        { title: 'Local first', text: 'A Room database on the phone; sign-in is optional, for a Firebase backup.' },
        { title: 'Calendar sync', text: 'Each category becomes its own device calendar, kept in step with the habits.' },
        { title: 'Structure', text: 'Hilt, a state-and-events model per screen, a nightly WorkManager job.' },
      ],
      shot: { src: '/images/24-hours-shot.png', alt: '24 Hours: the 24-hour watch face on a phone, with habits placed around the dial.', width: 380, height: 759 },
      /** Read off app/build.gradle. */
      stack: ['Kotlin', 'Jetpack Compose', 'Room', 'Hilt', 'Firebase'],
      /** Its Google Play listing; the id is the applicationId in app/build.gradle. Checked live 2026-10-12. */
      actions: [{ label: 'Get it on Google Play', href: 'https://play.google.com/store/apps/details?id=com.mooncrest.twentyfourhours', icon: 'download', primary: true }],
      links: [],
    },
  ] satisfies Project[],
};

/** 6. Contact. */
export const contact = {
  heading: 'Contact',
  /** Optional one line above the links. Set to null to omit. */
  lead: null as string | null,
  email: 'me@kfireliyahu.com',
  github: { label: 'github.com/kfireliyahu', href: 'https://github.com/kfireliyahu' },
  /** Printed once its address is set. Set to null to leave it out. */
  linkedin: null as Link | null,
};

/** True when a string is still a [[placeholder]]. */
export const isPlaceholder = (s: string | null | undefined): boolean =>
  typeof s === 'string' && /\[\[.*?\]\]/.test(s);
