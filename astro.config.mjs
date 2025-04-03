// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import 'dotenv/config'; // Dotenv'i yapılandırma dosyasında doğrudan yükle

// Ortam değişkenine erişim
const siteUrl = process.env.SITE_URL;

/** @type {import('astro').AstroUserConfig} */
const config = {
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
};

// Ortam değişkeni varsa site ayarını ekle
if (siteUrl) {
  // Trailing slash olmadan URL kullan
  config.site = siteUrl.replace(/\/$/, '');
  console.log('Site URL yapılandırıldı:', config.site);
} else {
  // Ortam değişkeni bulunamazsa uyarı ver
  console.error('UYARI: SITE_URL ortam değişkeni bulunamadı!');
  console.error('Bu değişken .env dosyasında veya Coolify ortam değişkenlerinde tanımlanmalıdır.');
  console.error('Site URL yapılandırması eksik olduğu için bazı özellikler düzgün çalışmayabilir.');
}

// https://astro.build/config
export default defineConfig(config);
