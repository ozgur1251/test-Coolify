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
        // Sharp yapılandırma seçenekleri - WebP optimize edildi
        webp: { 
          quality: 65, 
          effort: 6,
          smartSubsample: true,
          reductionEffort: 4
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