import { generateRobotsTxt } from '../lib/sitemap.js';

export async function GET({ site }) {
  try {
    const siteUrl = site ? site.toString() : process.env.SITE_URL;
    
    console.log('Robots.txt oluşturuluyor. Site URL:', siteUrl);
    
    const robotsTxt = generateRobotsTxt(siteUrl);
    
    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Robots.txt endpoint hatası:', error);
    console.error('Fallback robots.txt oluşturuluyor.');
    
    // Basit bir varsayılan robots.txt döndür
    return new Response(`User-agent: *
Allow: /`, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'max-age=3600, s-maxage=3600'
      }
    });
  }
} 