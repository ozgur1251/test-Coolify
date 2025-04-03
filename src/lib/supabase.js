import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Tüm kategorileri getir
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data;
}

// Belirli bir kategoriye ait blog yazılarını getir
export async function getBlogPostsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching blog posts by category:', error);
    return [];
  }
  
  return data;
}

// Tüm blog yazılarını getir
export async function getAllBlogPosts(limit = null) {
  // Sorguyu oluştur
  let query = supabase
    .from('blog_posts')
    .select('*, categories(*)');
  
  // Limit belirtilmişse uygula
  if (limit) {
    query = query.limit(limit);
  }
  
  // Sıralama yap
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching all blog posts:', error);
    return [];
  }
  
  // Her bir blogu işleyelim
  if (data && data.length > 0) {
    return data.map(post => {
      // JSON alanları parse et
      
      // FAQ alanını işle
      if (post.faq && typeof post.faq === 'string') {
        try {
          post.faq = JSON.parse(post.faq);
        } catch (e) {
          console.error(`Error parsing faq JSON for post ${post.id}:`, e);
          post.faq = [];
        }
      } else if (!post.faq) {
        post.faq = [];
      } else if (post.faq && !Array.isArray(post.faq)) {
        post.faq = Object.values(post.faq);
      }
      
      // keywords alanını işle
      if (post.keywords && typeof post.keywords === 'string') {
        try {
          post.keywords = JSON.parse(post.keywords);
        } catch (e) {
          console.error(`Error parsing keywords JSON for post ${post.id}:`, e);
          post.keywords = [];
        }
      } else if (!post.keywords) {
        post.keywords = [];
      }
      
      // social_media alanını işle
      if (post.social_media && typeof post.social_media === 'string') {
        try {
          post.social_media = JSON.parse(post.social_media);
        } catch (e) {
          console.error(`Error parsing social_media JSON for post ${post.id}:`, e);
          post.social_media = {};
        }
      } else if (!post.social_media) {
        post.social_media = {};
      }
      
      return post;
    });
  }
  
  return data || [];
}

// URL slug'ına göre blog yazısını getir
export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
  
  // JSON verilerini parse et
  if (data) {
    // FAQ alanını işle
    if (data.faq && typeof data.faq === 'string') {
      try {
        data.faq = JSON.parse(data.faq);
      } catch (e) {
        console.error('Error parsing faq JSON:', e);
        data.faq = [];
      }
    } else if (!data.faq) {
      data.faq = [];
    } else if (data.faq && !Array.isArray(data.faq)) {
      data.faq = Object.values(data.faq);
    }
    
    // keywords alanını işle
    if (data.keywords && typeof data.keywords === 'string') {
      try {
        data.keywords = JSON.parse(data.keywords);
      } catch (e) {
        console.error('Error parsing keywords JSON:', e);
        data.keywords = [];
      }
    }
    
    // social_media alanını işle
    if (data.social_media && typeof data.social_media === 'string') {
      try {
        data.social_media = JSON.parse(data.social_media);
      } catch (e) {
        console.error('Error parsing social_media JSON:', e);
        data.social_media = {};
      }
    } else if (!data.social_media) {
      data.social_media = {};
    }
  }
  
  return data;
}

// Kategori slug'ına göre kategori bilgisini getir
export async function getCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
  
  return data;
}

// Kategori bazında post sayılarını getiren fonksiyon
export async function getCategoryPostCounts() {
  const { data, error } = await supabase
    .from('category_post_counts')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Kategori post sayıları getirilirken hata oluştu:', error);
    return [];
  }
  
  return data;
}

// Limitle blog yazılarını getir (ana sayfa veya listeleme sayfaları için)
export async function getBlogPosts(limit = 50, options = {}) {
  // Varsayılan seçenekleri belirle
  const {
    selectFields = '*',
    withCategories = true,
    orderBy = 'created_at',
    ascending = false,
    filters = null
  } = options;
  
  // Kategori bilgisiyle mi yoksa sadece kategori ID'si ile mi getireceğiz?
  const selectQuery = withCategories 
    ? `${selectFields}, categories(*)` 
    : selectFields;
  
  // Sorguyu oluştur
  let query = supabase
    .from('blog_posts')
    .select(selectQuery);
  
  // Filtreleri uygula
  if (filters) {
    // CategoryId ile filtreleme
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    // Yayınlanmış olanları filtrele
    if (filters.publishedOnly) {
      const now = new Date().toISOString();
      query = query.lt('published_at', now);
    }
    
    // Belirli bir tarihe göre filtreleme
    if (filters.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    
    // Arama terimi ile filtreleme (başlık ve içerik)
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%, content.ilike.%${filters.searchTerm}%`);
    }
  }
  
  // Sıralama yap
  query = query.order(orderBy, { ascending });
  
  // Limit uygula
  if (limit) {
    query = query.limit(limit);
  }
  
  // Sorguyu çalıştır
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
  
  // Her bir blogu işleyelim
  if (data && data.length > 0) {
    return data.map(post => {
      // JSON alanları parse et
      
      // FAQ alanını işle
      if (post.faq && typeof post.faq === 'string') {
        try {
          post.faq = JSON.parse(post.faq);
        } catch (e) {
          post.faq = [];
        }
      } else if (!post.faq) {
        post.faq = [];
      } else if (post.faq && !Array.isArray(post.faq)) {
        post.faq = Object.values(post.faq);
      }
      
      // keywords alanını işle
      if (post.keywords && typeof post.keywords === 'string') {
        try {
          post.keywords = JSON.parse(post.keywords);
        } catch (e) {
          post.keywords = [];
        }
      } else if (!post.keywords) {
        post.keywords = [];
      }
      
      // social_media alanını işle
      if (post.social_media && typeof post.social_media === 'string') {
        try {
          post.social_media = JSON.parse(post.social_media);
        } catch (e) {
          post.social_media = {};
        }
      } else if (!post.social_media) {
        post.social_media = {};
      }
      
      return post;
    });
  }
  
  return data || [];
} 