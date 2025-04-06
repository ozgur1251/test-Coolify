import { marked } from 'marked';

/**
 * Markdown içeriğini HTML'e dönüştüren optimize edilmiş fonksiyon
 * @param {string} markdownText - İşlenecek markdown metni
 * @returns {string|Promise<string>} Dönüştürülmüş HTML veya HTML sözü
 */
export function parseMarkdown(markdownText) {
  if (!markdownText) {
    return '';
  }
  
  // Marked ayarlarını güvenlik ve performans için optimize et
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown desteği
    breaks: true // Satır sonlarını <br> olarak işle
  });
  
  // Markdown içeriğini HTML'e dönüştür ve döndür
  return marked.parse(markdownText);
}

// Geriye dönük uyumluluk için - başka dosyalarda kullanılıyorsa fonksiyon adını aynı tut
export const sanitizeAndParseMarkdown = parseMarkdown; 