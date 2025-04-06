// Image optimization script
if (typeof window !== 'undefined') { // Yalnızca istemci tarafında çalıştır
  document.addEventListener('DOMContentLoaded', () => {
    // Featured image özel işleme - Doğru boyuta sahip resimler sorunu için
    const featuredImages = document.querySelectorAll('.featured-image');
    featuredImages.forEach(img => {
      // Görsel yüklenmeden önce konteynırı ayarla
      const container = img.closest('.featured-image-container');
      if (container) {
        container.style.minHeight = '400px'; // Minimum yükseklik ver
      }
      
      // Yükleme tamamlandığında
      if (img.complete) {
        if (container) container.style.minHeight = '';
      } else {
        img.addEventListener('load', function() {
          if (container) container.style.minHeight = '';
        });
      }
    });
    
    // Lazy loading optimizasyonu
    if ('loading' in HTMLImageElement.prototype) {
      const viewportImages = document.querySelectorAll('img[loading="lazy"]');
      
      viewportImages.forEach(function(img) {
        if (img.getBoundingClientRect().top < window.innerHeight) {
          img.loading = 'eager';
          img.setAttribute('fetchpriority', 'high');
        }
      });
    }
    
    // Mobil cihazlarda görsel optimizasyonu
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobil cihazlarda görsel boyutlarını düşür
      document.querySelectorAll('img:not(.featured-image)').forEach(img => {
        if (img.width > 600) {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        }
      });
    }
    
    // Eksik boyutları tamamla ve CLS'yi önle
    const imagesWithoutDimensions = document.querySelectorAll('img:not([width]):not([height])');
    
    imagesWithoutDimensions.forEach(function(img) {
      if (!img.width) img.width = 400;
      if (!img.height) img.height = 300;
      
      // CLS önleme
      img.style.aspectRatio = 'auto';
      img.style.height = 'auto';
    });
    
    // Yüklendikten sonra görüntü kalitesini artır
    document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
      if (img.complete) {
        img.style.filter = 'none';
      } else {
        img.addEventListener('load', function() {
          img.style.filter = 'none';
        });
      }
    });
  });
} 