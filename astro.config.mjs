/// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import 'dotenv/config'; // Dotenv'i yapılandırma dosyasında doğrudan yükle

// Ortam değişkenine erişim
const siteUrl = process.env.SITE_URL;
const supabaseUrl = process.env.SUPABASE_URL || 'https://blog.istanbulbinaguclendirme.com';

// Supabase URL'inden hostname çıkarımı
const supabaseHostname = new URL(supabaseUrl).hostname;

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  site: siteUrl,
  trailingSlash: 'always',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // Sharp yapılandırma seçenekleri - WebP'ye odaklanıyoruz
        webp: { 
          quality: 55, // Daha agresif sıkıştırma
          effort: 6,   // Maksimum sıkıştırma çabası
          smartSubsample: true, // Chroma alt örnekleme
          reductionEffort: 6, // Maksimum boyut azaltma çabası
          nearLossless: false // Kayıplı sıkıştırma kullan
        }
      }
    },
    // Görüntü işleme davranışı
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  }
});