// Image optimization script
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
}); 