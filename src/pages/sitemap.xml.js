import { generateSitemapXml } from '../lib/sitemap.js';

export async function GET({ site }) {
  try {
    const siteUrl = site ? site.toString() : process.env.SITE_URL;
    
    console.log('Sitemap oluşturuluyor. Site URL:', siteUrl);
    
    const xml = await generateSitemapXml(siteUrl);
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Sitemap endpoint hatası:', error);
    
    // Basit bir varsayılan sitemap döndür
    const today = new Date().toISOString().split('T')[0];
    const siteUrl = site ? site.toString() : process.env.SITE_URL;
    
    console.error('Fallback sitemap oluşturuluyor. Site URL:', siteUrl);
    
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new Response(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600, s-maxage=3600'
      }
    });
  }
} 