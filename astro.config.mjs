// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Ortam değişkeninden site URL'sini al
const SITE_URL = process.env.SITE_URL;

// Site URL yoksa özelliği yapılandırmadan geç, varsa site özelliğini ekle
/** @type {import('astro').AstroUserConfig} */
const config = {
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
};

// Site URL varsa site özelliğini ekle
if (SITE_URL) {
  config.site = SITE_URL;
  console.log('Site URL yapılandırıldı:', SITE_URL);
} else {
  console.warn('SITE_URL ortam değişkeni tanımlanmamış. Site URL yapılandırılmadı.');
}

// https://astro.build/config
export default defineConfig(config);
