import { getBlogPosts, getCategories, getAllBlogPosts } from '../lib/supabase';

export async function GET({ site }) {
  // Site nesnesinden veya ortam değişkeninden URL al
  const siteUrl = site ? site.origin : process.env.SITE_URL || '';
  
  // URL bulunamazsa uyarı logla
  if (!siteUrl) {
    console.error('UYARI: SITE_URL ortam değişkeni veya site.origin bulunamadı.');
    console.error('sitemap.xml için tam site URL\'si belirlenemedi.');
    // Hata durumunda uygun bir HTTP yanıtı dön
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- SITE_URL ortam değişkeni bulunamadı. Sitemap oluşturulamadı. -->
</urlset>`,
      {
        headers: {
          'Content-Type': 'application/xml',
          'Status': '500 Internal Server Error'
        },
      }
    );
  }

  // Trailing slash olmadan site URL'sini al
  const baseUrl = siteUrl.replace(/\/$/, '');
  
  // Kategorileri getir
  const categories = await getCategories();
  
  // Blog yazılarını getir - tüm blog yazılarını getiren fonksiyonu kullanıyoruz
  const posts = await getAllBlogPosts();
  console.log(`Sitemap için ${posts.length} blog yazısı bulundu`);
  
  // Ana sayfanın bugünün tarihi ile en yüksek öncelik değeri olan sitemap girişi
  const today = new Date().toISOString().split('T')[0];
  
  // Sadece HTTP yanıtı dön, dosya sistemine yazma
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/hakkinda/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/iletisim/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ${categories
    .map(
      (category) => `  <url>
    <loc>${baseUrl}/kategori/${category.slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
    )
    .join('')}
  ${posts && posts.length > 0 ? posts
    .map(
      (post) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}/</loc>
    <lastmod>${new Date(post.updated_at || post.published_at || post.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
    )
    .join('') : ''}
</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600'
      },
    }
  );
} 