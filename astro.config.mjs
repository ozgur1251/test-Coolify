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
  trailingSlash: 'always',
  // Görsel optimizasyonu için yerleşik assets özelliğini etkinleştir
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // Sharp yapılandırması
        jpeg: { quality: 80 },
        jpg: { quality: 80 },
        png: { quality: 80 },
        webp: { quality: 70 },
        avif: { quality: 70 },
        defaults: {
          format: 'webp',
          quality: 'medium',
        }
      }
    },
    // LCP optimizasyonu için önbellek ayarları
    cacheDir: './node_modules/.astro/image',
    domains: ['blog.istanbulbinaguclendirme.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.istanbulbinaguclendirme.com', port: '' }
    ]
  }
});