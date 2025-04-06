/// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import 'dotenv/config'; // Dotenv'i yapılandırma dosyasında doğrudan yükle

// Ortam değişkenine erişim
const siteUrl = process.env.SITE_URL;

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  site: siteUrl,
  trailingSlash: 'always',
  // CSS işleme için build optimizasyonları
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto' // Eşik değerinden küçük CSS'leri otomatik olarak inline yap
  },
  vite: {
    build: {
      cssCodeSplit: true, // CSS modüllerini sayfa başına böl
      cssMinify: true // CSS'i minimize et
    }
  }
});