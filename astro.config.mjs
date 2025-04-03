// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from 'astro-sitemap';

// Ortam değişkeninden site URL'sini al veya varsayılan değer kullan
const SITE_URL = process.env.SITE_URL || 'https://binaguclendirme.com';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  site: SITE_URL,
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date()
    })
  ]
});
