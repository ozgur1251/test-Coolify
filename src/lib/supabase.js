import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Basit önbellek yönetimi
const cache = {
  data: new Map(),
  timestamp: new Map(),
  ttl: 60 * 1000, // 1 dakika önbellek süresi (millisaniye)
  
  /**
   * Önbellekten veri alma
   * @param {string} key - Önbellek anahtarı
   * @returns {*} Önbellekteki veri veya null
   */
  get(key) {
    const now = Date.now();
    const timestamp = this.timestamp.get(key) || 0;
    
    // Önbellek süresi dolmuşsa null döndür
    if (now - timestamp > this.ttl) {
      return null;
    }
    
    return this.data.get(key);
  },
  
  /**
   * Önbelleğe veri ekleme
   * @param {string} key - Önbellek anahtarı
   * @param {*} data - Kaydedilecek veri
   * @returns {*} Kaydedilen veri
   */
  set(key, data) {
    this.data.set(key, data);
    this.timestamp.set(key, Date.now());
    return data;
  },
  
  // Önbelleği temizleme
  clear() {
    this.data.clear();
    this.timestamp.clear();
  }
};

/**
 * Hata işleme yardımcı fonksiyonu
 * @param {Error|null} error - Oluşan hata
 * @param {string} errorMessage - Hata mesajı
 * @param {*} defaultValue - Hata durumunda döndürülecek varsayılan değer
 * @returns {*} Varsayılan değer
 */
function handleError(error, errorMessage, defaultValue) {
  if (error) {
    console.error(errorMessage, error);
    return defaultValue;
  }
}

/**
 * JSON alanlarını parse eden yardımcı fonksiyon
 * @param {any} post - İşlenecek blog yazısı
 * @returns {any|null} İşlenmiş blog yazısı
 */
function parsePostJsonFields(post) {
  if (!post) return null;
  
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
}

/**
 * Birden çok postu işleyen yardımcı fonksiyon
 * @param {any[]} posts - İşlenecek blog yazıları
 * @returns {any[]} İşlenmiş blog yazıları
 */
function parsePostsJsonFields(posts) {
  if (!posts || !posts.length) return [];
  return posts.map(post => parsePostJsonFields(post));
}

/**
 * Önbellekli veri çeken yardımcı fonksiyon
 * @param {string} cacheKey - Önbellek anahtarı
 * @param {Function} fetchFunction - Veri çekme fonksiyonu
 * @returns {Promise<any>} Veri
 */
async function fetchWithCache(cacheKey, fetchFunction) {
  // Önbellekten veri kontrolü
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Veri yoksa veya süresi dolmuşsa yeni veri çek
  const data = await fetchFunction();
  
  // Veriyi önbelleğe kaydet
  return cache.set(cacheKey, data);
}

// Tüm kategorileri getir
export async function getCategories() {
  return fetchWithCache('all_categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      return handleError(error, 'Error fetching categories:', []);
    }
    
    return data;
  });
}

/**
 * Belirli bir kategoriye ait blog yazılarını getir
 * @param {number|string} categoryId - Kategori ID'si
 * @returns {Promise<any[]>} Blog yazıları
 */
export async function getBlogPostsByCategory(categoryId) {
  return fetchWithCache(`category_posts_${categoryId}`, async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return handleError(error, 'Error fetching blog posts by category:', []);
    }
    
    return parsePostsJsonFields(data);
  });
}

// Tüm blog yazılarını getir
export async function getAllBlogPosts(limit = null) {
  const cacheKey = `all_posts_${limit || 'all'}`;
  
  return fetchWithCache(cacheKey, async () => {
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
      return handleError(error, 'Error fetching all blog posts:', []);
    }
    
    return parsePostsJsonFields(data);
  });
}

/**
 * URL slug'ına göre blog yazısını getir
 * @param {string} slug - Blog yazısı URL slug'ı
 * @returns {Promise<any|null>} Blog yazısı
 */
export async function getBlogPostBySlug(slug) {
  return fetchWithCache(`post_${slug}`, async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      return handleError(error, 'Error fetching blog post by slug:', null);
    }
    
    return parsePostJsonFields(data);
  });
}

/**
 * Kategori slug'ına göre kategori bilgisini getir
 * @param {string} slug - Kategori URL slug'ı
 * @returns {Promise<any|null>} Kategori bilgisi
 */
export async function getCategoryBySlug(slug) {
  return fetchWithCache(`category_${slug}`, async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      return handleError(error, 'Error fetching category by slug:', null);
    }
    
    return data;
  });
}

// Kategori bazında post sayılarını getiren fonksiyon
export async function getCategoryPostCounts() {
  return fetchWithCache('category_post_counts', async () => {
    const { data, error } = await supabase
      .from('category_post_counts')
      .select('*')
      .order('name');
    
    if (error) {
      return handleError(error, 'Kategori post sayıları getirilirken hata oluştu:', []);
    }
    
    return data;
  });
}

/**
 * Limitle blog yazılarını getir (ana sayfa veya listeleme sayfaları için)
 * @param {number} [limit=50] - Maksimum blog yazısı sayısı
 * @param {{
 *   selectFields?: string,
 *   withCategories?: boolean,
 *   orderBy?: string,
 *   ascending?: boolean,
 *   filters?: {
 *     categoryId?: number|string,
 *     publishedOnly?: boolean,
 *     fromDate?: string,
 *     searchTerm?: string
 *   }
 * }} [options={}] - Sorgulama seçenekleri
 * @returns {Promise<any[]>} Blog yazıları
 */
export async function getBlogPosts(limit = 50, options = {}) {
  // Önbellek anahtarı oluştur (farklı parametreler için farklı anahtarlar)
  const filterKey = options.filters 
    ? Object.entries(options.filters).map(([k, v]) => `${k}:${v}`).join('_')
    : 'no_filters';
  const cacheKey = `blog_posts_${limit}_${options.orderBy || 'created_at'}_${filterKey}`;
  
  return fetchWithCache(cacheKey, async () => {
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
      return handleError(error, 'Error fetching blog posts:', []);
    }
    
    return parsePostsJsonFields(data);
  });
}

// Önbelleği temizleme fonksiyonu (gerektiğinde kullanmak için dışa aktar)
export function clearCache() {
  cache.clear();
} 