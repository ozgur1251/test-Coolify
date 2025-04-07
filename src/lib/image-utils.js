// @ts-nocheck
// image-utils.js - Basit yardımcı fonksiyonlar

/**
 * Responsive görsel için en-boy oranı hesaplama
 * @param {number} width - Görsel genişliği
 * @param {number} height - Görsel yüksekliği
 * @returns {number} - En-boy oranı
 */
export function calculateAspectRatio(width, height) {
  return width / height;
}

/**
 * Belirli bir genişlik için orantılı yükseklik hesaplama 
 * @param {number} width - Hedef genişlik
 * @param {number} aspectRatio - En-boy oranı
 * @returns {number} - Orantılı yükseklik
 */
export function calculateProportionalHeight(width, aspectRatio) {
  return Math.round(width / aspectRatio);
}

/**
 * Responsive görsel için boyut dizisi oluştur
 * @param {Array<number>} breakpoints - Farklı ekran boyutları için kırılma noktaları (px)
 * @param {number} originalWidth - Orijinal görsel genişliği
 * @param {number} originalHeight - Orijinal görsel yüksekliği
 * @returns {Array<{width: number, height: number}>} - Farklı boyutlar
 */
export function generateResponsiveSizes(breakpoints = [360, 768, 1024, 1320], originalWidth = 1320, originalHeight = 920) {
  const aspectRatio = originalWidth / originalHeight;
  const responsiveSizes = [];
  
  breakpoints.sort((a, b) => a - b).forEach(width => {
    if (width > originalWidth) {
      width = originalWidth;
    }
    
    const height = Math.round(width / aspectRatio);
    
    responsiveSizes.push({
      width,
      height
    });
  });
  
  return responsiveSizes;
}

/**
 * HTML data öznitelikleri için şablon dizesi oluştur
 * @param {string} imageUrl - Görsel URL'si
 * @param {number} originalWidth - Orijinal genişlik
 * @param {number} originalHeight - Orijinal yükseklik
 * @returns {string} - Data öznitelikleri için şablon dizesi
 */
export function getImageDataAttributes(imageUrl, originalWidth = 1320, originalHeight = 920) {
  return `
    data-src="${imageUrl}"
    data-width="${originalWidth}"
    data-height="${originalHeight}"
    data-aspect-ratio="${originalWidth / originalHeight}"
  `;
}

/**
 * Supabase'den gelen görselleri yeniden boyutlandırmak için yardımcı fonksiyon
 * @param {string} imageUrl - Supabase'den gelen görsel URL'si
 * @param {ImageOptions} options - Yeniden boyutlandırma seçenekleri
 * @returns {Promise<Buffer>} - İşlenmiş görsel buffer'ı
 */
export async function resizeSupabaseImage(imageUrl, options = {}) {
  try {
    // Varsayılan değerleri ayarla
    const width = options.width || 800;
    const height = options.height;
    const keepAspectRatio = options.keepAspectRatio !== false;
    const format = options.format || 'webp';
    const quality = options.quality || 80;
    
    // Görsel URL'inden fetch ile veriyi al
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Görsel alınamadı: ${response.statusText}`);
    }
    
    // Buffer'a dönüştür
    const imageBuffer = await response.arrayBuffer();
    
    // Sharp ile işleme
    let sharpInstance = sharp(Buffer.from(imageBuffer));
    
    // Yeniden boyutlandırma işlemi
    const resizeOptions = {
      width: width,
      fit: keepAspectRatio ? sharp.fit.inside : sharp.fit.fill
    };
    
    // TypeScript hatası nedeniyle height değerini ayrı bir şekilde ekliyoruz
    if (height) {
      // @ts-ignore
      resizeOptions.height = height;
    }
    
    sharpInstance = sharpInstance.resize(resizeOptions);
    
    // Format ve kalite ayarları
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    } else if (format === 'jpeg' || format === 'jpg') {
      sharpInstance = sharpInstance.jpeg({ quality });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ quality: Math.floor(quality / 100 * 9) }); // PNG kalitesi 0-9 arasında
    }
    
    // İşlenmiş görseli buffer olarak döndür
    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error('Görsel işleme hatası:', error);
    throw error;
  }
}

/**
 * Görseli yeniden boyutlandırıp Base64 formatında döndürür
 * @param {string} imageUrl - Supabase'den gelen görsel URL'si
 * @param {ImageOptions} options - Boyutlandırma seçenekleri
 * @returns {Promise<string>} - Base64 formatında görsel verisi
 */
export async function getResizedImageAsBase64(imageUrl, options = {}) {
  try {
    const imageBuffer = await resizeSupabaseImage(imageUrl, options);
    // @ts-ignore
    const format = options.format || 'webp';
    return `data:image/${format};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Base64 dönüşüm hatası:', error);
    throw error;
  }
}

/**
 * Blob URL oluştur (tarayıcı tarafında çalışır)
 * @param {string} imageUrl - Supabase'den gelen görsel URL'si
 * @param {ImageOptions} options - Boyutlandırma seçenekleri
 * @returns {Promise<string>} - Blob URL
 */
export async function getResizedImageAsBlobUrl(imageUrl, options = {}) {
  if (typeof window === 'undefined') {
    throw new Error('Bu fonksiyon sadece tarayıcıda çalışır');
  }
  
  try {
    const imageBuffer = await resizeSupabaseImage(imageUrl, options);
    // @ts-ignore
    const format = options.format || 'webp';
    const blob = new Blob([imageBuffer], { type: `image/${format}` });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Blob URL oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Astro bileşenlerinde kullanım için optimum görsel URL'i oluştur
 * @param {string} imageUrl - Supabase'den gelen görsel URL'si
 * @param {number} width - İstenen genişlik
 * @param {number} height - İstenen yükseklik (isteğe bağlı)
 * @param {string} format - Görsel formatı (opsiyonel)
 * @param {number} quality - Görsel kalitesi (opsiyonel)
 * @returns {string} - İşlenmiş görsel URL'i
 */
export function getOptimizedImageUrl(imageUrl, width = 800, height, format = 'webp', quality = 80) {
  if (!imageUrl) return '';
  
  try {
    // Görsel hali hazırda optimize edilmiş mi kontrol et
    if (imageUrl.includes('/api/image?')) {
      return imageUrl;
    }
    
    // Sunucu tarafı (SSR) veya istemci tarafı (CSR) kontrolü
    if (typeof window === 'undefined') {
      // SSR: Astro.site burada kullanılamaz, bu nedenle doğrudan göreli yol kullanıyoruz
      const apiUrl = new URL('/api/image', 'http://localhost');
      apiUrl.searchParams.set('url', encodeURIComponent(imageUrl));
      if (width) apiUrl.searchParams.set('width', width.toString());
      if (height) apiUrl.searchParams.set('height', height.toString());
      if (format) apiUrl.searchParams.set('format', format);
      if (quality) apiUrl.searchParams.set('quality', quality.toString());
      
      // URL'in hostname kısmını çıkarıp, path kısmını döndür (istemcide farklı hostname kullanılabileceği için)
      return apiUrl.pathname + apiUrl.search;
    } else {
      // CSR: Tarayıcı tarafında tam URL oluştur
      const apiUrl = new URL('/api/image', window.location.origin);
      apiUrl.searchParams.set('url', encodeURIComponent(imageUrl));
      if (width) apiUrl.searchParams.set('width', width.toString());
      if (height) apiUrl.searchParams.set('height', height.toString());
      if (format) apiUrl.searchParams.set('format', format);
      if (quality) apiUrl.searchParams.set('quality', quality.toString());
      
      return apiUrl.toString();
    }
  } catch (error) {
    console.error('URL oluşturma hatası:', error);
    return imageUrl; // Hata durumunda orijinal URL'yi döndür
  }
}

/**
 * Responsive srcset oluşturmak için yardımcı fonksiyon
 * @param {string} imageUrl - Orijinal görsel URL'si
 * @param {number} originalWidth - Orijinal görsel genişliği
 * @param {number} originalHeight - Orijinal görsel yüksekliği
 * @param {Array<number>} breakpoints - Farklı genişlikler için kırılma noktaları
 * @returns {string} - srcset string
 */
export function generateSrcsetString(imageUrl, originalWidth = 1320, originalHeight = 920, breakpoints = [480, 768, 1024, 1320]) {
  if (!imageUrl) return '';
  
  const aspectRatio = originalWidth / originalHeight;
  const srcsetParts = [];
  
  // Her bir kırılma noktası için URL oluştur
  breakpoints.sort((a, b) => a - b).forEach(width => {
    // Orijinal boyuttan büyük boyutlar için orijinal genişliği kullan
    if (width > originalWidth) {
      width = originalWidth;
    }
    
    // Yüksekliği hesapla
    const height = Math.round(width / aspectRatio);
    
    // Resim optimize etmek için fonksiyon varsa kullan, yoksa normal URL'yi kullan
    // Not: getOptimizedImageUrl fonksiyonu varsa burada kullanılabilir
    let url = imageUrl;
    if (typeof getOptimizedImageUrl === 'function') {
      url = getOptimizedImageUrl(imageUrl, width, height, 'webp', 80);
    }
    
    srcsetParts.push(`${url} ${width}w`);
  });
  
  return srcsetParts.join(', ');
} 