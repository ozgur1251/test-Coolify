// Image optimization script
// @ts-nocheck
document.addEventListener('DOMContentLoaded', () => {
  // Lazy loading optimizasyonu
  if ('loading' in HTMLImageElement.prototype) {
    const viewportImages = document.querySelectorAll('img[loading="lazy"]');
    
    viewportImages.forEach(function(img) {
      if (img.getBoundingClientRect().top < window.innerHeight) {
        if (img instanceof HTMLImageElement) {
          img.loading = 'eager';
        }
        img.setAttribute('fetchpriority', 'high');
      }
    });
  }
  
  // Eksik boyutları tamamla
  const imagesWithoutDimensions = document.querySelectorAll('img:not([width]):not([height])');
  
  imagesWithoutDimensions.forEach(function(img) {
    if (img instanceof HTMLImageElement) {
      if (!img.width) img.width = 400;
      if (!img.height) img.height = 225;
    }
  });
  
  // Resim kapsayıcılarına aspect-ratio belirle
  const imageContainers = document.querySelectorAll('.img-container');
  imageContainers.forEach(container => {
    const img = container.querySelector('img');
    if (img && img instanceof HTMLImageElement && img.width && img.height && container instanceof HTMLElement) {
      container.style.aspectRatio = `${img.width} / ${img.height}`;
    }
  });
  
  // Görüntü kalitesini optimize et - Bağlantı tipini kontrol et
  try {
    if ('connection' in navigator && navigator.connection) {
      const conn = navigator.connection;
      
      // Veri tasarrufu modu veya yavaş bağlantı kontrolü
      const isSaveDataEnabled = !!(conn && 'saveData' in conn && conn.saveData);
      const isSlowConnection = !!(conn && 'effectiveType' in conn && 
                                (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g'));
      
      if (isSaveDataEnabled || isSlowConnection) {
        // Düşük kalitede resimler için
        document.querySelectorAll('img').forEach(img => {
          if (img instanceof HTMLImageElement && img.srcset) {
            // En düşük çözünürlüğü seç
            const srcSetItems = img.srcset.split(',');
            if (srcSetItems.length > 0) {
              const lowestRes = srcSetItems[0].trim().split(' ')[0];
              img.srcset = '';
              img.src = lowestRes;
            }
          }
        });
      }
    }
  } catch (e) {
    console.log('Bağlantı türü kontrol edilirken hata oluştu:', e);
  }
}); 