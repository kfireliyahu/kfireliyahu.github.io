// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Apex domain with CNAME; a user site repo (kfireliyahu.github.io) takes no `base`.
  site: 'https://kfireliyahu.com',
  output: 'static',
  integrations: [sitemap()],
  trailingSlash: 'never',
  // Astro 7 defaults to JSX whitespace rules, which can eat spaces between inline elements in prose.
  compressHTML: true,
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
});
