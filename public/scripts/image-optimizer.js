// Image optimization script
if (typeof window !== 'undefined') { // Yalnızca istemci tarafında çalıştır
  document.addEventListener('DOMContentLoaded', () => {
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
    
    // Eksik boyutları tamamla ve CLS'yi önle
    const imagesWithoutDimensions = document.querySelectorAll('img:not([width]):not([height])');
    
    imagesWithoutDimensions.forEach(function(img) {
      if (!img.width) img.width = 400;
      if (!img.height) img.height = 225;
      
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