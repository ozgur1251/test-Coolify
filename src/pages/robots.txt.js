import { generateRobotsTxt } from '../lib/sitemap.js';

export async function GET({ site }) {
  try {
    const siteUrl = site ? site.toString() : process.env.SITE_URL || 'https://binaguclendirme.com';
    
    const robotsTxt = generateRobotsTxt(siteUrl);
    
    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Robots.txt endpoint hatası:', error);
    
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