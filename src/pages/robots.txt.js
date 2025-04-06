/**
 * @param {Object} context - Astro context
 * @param {Object} context.site - Site information
 * @param {string} context.site.origin - Base URL of the site
 * @returns {Promise<Response>} Response containing the robots.txt file
 */
export async function GET({ site }) {
  // Site nesnesinden veya ortam değişkeninden URL al
  const siteUrl = site ? site.origin : process.env.SITE_URL || '';
  
  // URL bulunamazsa uyarı logla ve boş kullan
  if (!siteUrl) {
    console.error('UYARI: SITE_URL ortam değişkeni veya site.origin bulunamadı.');
    console.error('robots.txt için tam site URL\'si belirlenemedi.');
  }
  
  // Robots.txt içeriği - ASCII karakterler kullanılarak
  const robotsTxt = `# robots.txt - Istanbul Bina Guclendirme
User-agent: *
Allow: /

# Sitemap
${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : '# Sitemap URL bulunamadı'}

# Izin verilen yollar
Allow: /blog/
Allow: /kategori/
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'max-age=3600, s-maxage=3600'
    }
  });
} 