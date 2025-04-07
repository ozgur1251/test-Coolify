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
      apiUrl.searchParams.set('url', encodeURIComponent(imageUrl));
      if (width) apiUrl.searchParams.set('width', width.toString());
      if (height) apiUrl.searchParams.set('height', height.toString());
      if (format) apiUrl.searchParams.set('format', format);
      if (quality) apiUrl.searchParams.set('quality', quality.toString());
      
      // URL'in hostname kısmını çıkarıp, path kısmını döndür (istemcide farklı hostname kullanılabileceği için)
      return apiUrl.pathname + apiUrl.search;
    } else {
      // CSR: Tarayıcı tarafında tam URL oluştur
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
export function generateSrcsetString(imageUrl, originalWidth = 1320, originalHeight = 920, breakpoints = [320, 360, 480, 640, 720, 768, 1024, 1320]) {
  if (!imageUrl) return '';

  // URL'yi ayrıştırarak Supabase projesi, bucket ve path bilgilerini al
  let urlParts;
  try {
    // Supabase'in standart /object/public/ URL formatını varsayalım
    // Örnek: https://<id>.supabase.co/storage/v1/object/public/<bucket>/<path>
    urlParts = imageUrl.match(/^(https:\/\/[^/]+\/storage\/v1)\/object\/public\/([^/]+)\/(.+)$/);
    if (!urlParts || urlParts.length < 4) {
      console.warn(`Beklenmeyen Supabase URL formatı: ${imageUrl}. Dönüşüm uygulanamadı.`);
      return ''; // Geçersiz formatta dönüşüm yapma
    }
  } catch (e) {
    console.error(`URL ayrıştırma hatası: ${imageUrl}`, e);
    return '';
  }

  const baseUrl = urlParts[1]; // https://<id>.supabase.co/storage/v1
  const bucketName = urlParts[2];
  const imagePath = urlParts[3];

  const aspectRatio = originalWidth / originalHeight;
  const srcsetParts = [];

  // Her bir kırılma noktası için dönüşüm URL'si oluştur
  breakpoints.sort((a, b) => a - b).forEach(targetWidth => {
    // Orijinal boyuttan büyük boyutlar için orijinal genişliği kullan
    let width = targetWidth > originalWidth ? originalWidth : targetWidth;

    // Yüksekliği en-boy oranına göre hesapla
    const height = Math.round(width / aspectRatio);

    // Küçük boyutlar için kaliteyi biraz düşür (örn. 480px ve altı)
    const quality = width <= 480 ? 70 : 80;

    // Supabase dönüşüm URL'sini oluştur
    // Format: https://<id>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=...&height=...&resize=contain
    const transformationUrl = `${baseUrl}/render/image/public/${bucketName}/${imagePath}?width=${width}&height=${height}&resize=contain&quality=${quality}`;

    srcsetParts.push(`${transformationUrl} ${width}w`);
  });

  return srcsetParts.join(', ');
} 