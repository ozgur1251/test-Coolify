/// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
// import critters from 'astro-critters'; // Critters kaldırıldı
import 'dotenv/config'; // Dotenv'i yapılandırma dosyasında doğrudan yükle

// Ortam değişkenine erişim
const siteUrl = process.env.SITE_URL || 'https://tr.istanbulbinaguclendirme.com';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  // integrations: [critters()], // Critters kaldırıldı
  site: siteUrl,
  trailingSlash: 'always',
  // CSS işleme için build optimizasyonları
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto' // Astro'nun varsayılanına geri dönüldü ('auto')
  },
  vite: {
    build: {
      cssCodeSplit: true, // CSS modüllerini sayfa başına böl
      cssMinify: true // CSS'i minimize et
    }
  }
});