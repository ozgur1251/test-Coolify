// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Ortam değişkeninden site URL'sini al
const SITE_URL = process.env.SITE_URL;

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  site: SITE_URL
});
