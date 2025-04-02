import { marked } from 'marked';

// Markdown içeriğini HTML'e dönüştüren fonksiyon
export function parseMarkdown(markdownText) {
  if (!markdownText) {
    return '';
  }
  
  // Markdown içeriğini HTML'e dönüştür
  return marked.parse(markdownText);
}

// Markdown içeriğini güvenli şekilde HTML'e dönüştüren fonksiyon
export function sanitizeAndParseMarkdown(markdownText) {
  if (!markdownText) {
    return '';
  }
  
  // Önce markdown içeriğini HTML'e dönüştür
  const html = marked.parse(markdownText);
  
  // HTML çıktısını döndür
  return html;
} 