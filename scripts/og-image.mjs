// Draws the link preview card: scripts/og-image.html, screenshotted at 1200x630 by a headless
// Chrome or Edge into public/og.png. Run it again after changing the words in the template.
//
//   npm run og-image
//
// Set CHROME to a browser's path if none of the usual places has one.

import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const template = fileURLToPath(new URL('./og-image.html', import.meta.url));
const out = fileURLToPath(new URL('../public/og.png', import.meta.url));

const candidates = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error('No Chrome or Edge found. Set CHROME to its path.');
  process.exit(1);
}

execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  // Time for the fonts to load before the shot.
  '--virtual-time-budget=3000',
  `--screenshot=${out}`,
  pathToFileURL(template).href,
], { stdio: 'inherit' });

console.log(`wrote ${out} (${statSync(out).size} bytes)`);
