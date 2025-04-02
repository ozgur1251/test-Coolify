import { createClient } from '@supabase/supabase-js';

// Environment değişkenlerinden Supabase bilgilerini alıyoruz
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

// Supabase istemcisini oluşturuyoruz
export const supabase = createClient(supabaseUrl, supabaseKey);

// Kategorileri getiren fonksiyon
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Kategoriler getirilirken hata oluştu:', error);
    return [];
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

// İlgili kategoriye ait blog postlarını getiren fonksiyon
export async function getBlogPostsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Blog postları getirilirken hata oluştu:', error);
    return [];
  }
  
  return data;
}

// Tüm blog postlarını getiren fonksiyon
export async function getAllBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Blog postları getirilirken hata oluştu:', error);
    return [];
  }
  
  return data;
}

// Slug'a göre blog postu getiren fonksiyon
export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Blog postu getirilirken hata oluştu:', error);
    return null;
  }
  
  return data;
} 