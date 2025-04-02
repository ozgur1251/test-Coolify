import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;
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
export async function getAllBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, categories(*)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all blog posts:', error);
    return [];
  }
  
  return data;
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