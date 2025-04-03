import { getCategories, getAllBlogPosts } from './supabase.js';

/**
 * Sitemap XML içeriğini oluşturur
 * 
 * @param {string} siteUrl - Site URL'si
 * @returns {Promise<string>} - XML formatında sitemap içeriği
 */
export async function generateSitemapXml(siteUrl) {
  try {
    // Site URL'sinin sonunda / varsa kaldırıyoruz
    siteUrl = siteUrl.replace(/\/$/, '');
    
    // Bugünün tarihi
    const today = new Date().toISOString().split('T')[0];
    
    // XML başlık
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';
    
    // Ana Sayfa
    xml += addUrlToSitemap({
      loc: `${siteUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0
    });
    
    // Hakkımızda Sayfası
    xml += addUrlToSitemap({
      loc: `${siteUrl}/hakkinda`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8
    });
    
    try {
      // Kategorileri al
      const categories = await getCategories();
      
      // Kategori sayfaları
      for (const category of categories) {
        xml += addUrlToSitemap({
          loc: `${siteUrl}/kategori/${category.slug}`,
          lastmod: today,
          changefreq: 'weekly',
          priority: 0.8
        });
      }
    } catch (error) {
      console.error('Sitemap için kategoriler getirilirken hata oluştu:', error);
    }
    
    try {
      // Blog yazılarını al
      const blogPosts = await getAllBlogPosts();
      
      // Blog sayfaları
      for (const post of blogPosts) {
        let lastmod = post.updated_at || post.created_at;
        if (lastmod) {
          lastmod = new Date(lastmod).toISOString().split('T')[0];
        } else {
          lastmod = today;
        }
        
        xml += addUrlToSitemap({
          loc: `${siteUrl}/blog/${post.slug}`,
          lastmod: lastmod,
          changefreq: 'monthly',
          priority: 0.7
        });
      }
    } catch (error) {
      console.error('Sitemap için blog yazıları getirilirken hata oluştu:', error);
    }
    
    // XML kapanış
    xml += '</urlset>';
    
    return xml;
  } catch (error) {
    console.error('Sitemap oluşturulurken hata oluştu:', error);
    return getDefaultSitemap(siteUrl);
  }
}

/**
 * Sitemap'e URL ekler
 * 
 * @param {Object} options - URL seçenekleri
 * @param {string} options.loc - Konum URL'si
 * @param {string} options.lastmod - Son değiştirilme tarihi (YYYY-MM-DD)
 * @param {string} options.changefreq - Değişim sıklığı
 * @param {number} options.priority - Öncelik (0.0 - 1.0)
 * @returns {string} - URL XML içeriği
 */
function addUrlToSitemap({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>\n`;
}

/**
 * XML içindeki özel karakterleri escape eder
 * 
 * @param {string} str - Orijinal string
 * @returns {string} - Escape edilmiş string
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Varsayılan sitemap içeriğini döndürür
 * 
 * @param {string} siteUrl - Site URL'si
 * @returns {string} - Varsayılan sitemap XML içeriği
 */
function getDefaultSitemap(siteUrl) {
  const today = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/hakkinda</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
}

/**
 * Robots.txt içeriğini oluşturur
 * 
 * @param {string} siteUrl - Site URL'si
 * @returns {string} - Robots.txt içeriği
 */
export function generateRobotsTxt(siteUrl) {
  try {
    // Site URL'sinin sonunda / varsa kaldırıyoruz
    siteUrl = siteUrl.replace(/\/$/, '');
    
    return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`;
  } catch (error) {
    console.error('Robots.txt oluşturulurken hata oluştu:', error);
    return `User-agent: *
Allow: /`;
  }
} 