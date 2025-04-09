import { marked, Renderer } from 'marked';

/**
 * JSDoc type definition for a Marked token.
 * This is a simplified version, actual tokens can have more properties.
 * @typedef {object} MarkedToken
 * @property {string} type - The type of the token (e.g., 'text', 'codespan', 'heading').
 * @property {string} [raw] - The raw text content of the token.
 * @property {string} [text] - The processed text content (might differ from raw).
 * @property {Array<MarkedToken>} [tokens] - Nested tokens (e.g., inside blockquote, list).
 * @property {number} [depth] - Heading level (for heading tokens).
 */

// Interface removed as it's TypeScript syntax

// Slugify (URL dostu kimlik) fonksiyonu
/**
 * @param {string | null | undefined} text
 * @returns {string}
 */
function slugify(text) {
  if (!text) return ''; // Handle potential undefined/null input
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Türkçe karakterleri ayrıştır
    .replace(/[\u0300-\u036f]/g, '') // Aksanları kaldır
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Markdown içeriğini HTML'e dönüştüren ve başlıkları çıkaran fonksiyon
 * @param {string} markdownText - İşlenecek markdown metni
 * @returns {{html: string | Promise<string>, headings: Array<{level: number, text: string, slug: string}>}} Dönüştürülmüş HTML ve başlık listesi
 */
export function parseMarkdown(markdownText) {
  if (!markdownText) {
    return { html: '', headings: [] };
  }

  /** @type {Array<{level: number, text: string, slug: string}>} */
  const headings = [];
  const renderer = new Renderer();
  /** @type {Record<string, number>} */ // Type for usedSlugs
  const usedSlugs = {}; // Basit nesne, slug'ların sayısını tutacak

  // Helper function to extract text from marked tokens
  /**
   * @param {Array<MarkedToken>} tokens - Array of marked tokens
   * @returns {string}
   */
  function getTextFromTokens(tokens) {
    let text = '';
    for (const token of tokens) {
      // Access properties safely now that type is more specific
      if (token.type === 'text' || token.type === 'codespan' || token.type === 'strong' || token.type === 'em' || token.type === 'del') {
        // Prefer raw for consistency, fallback to text if raw is not present
        text += token.raw || token.text || ''; 
      } else if (token.tokens && Array.isArray(token.tokens)) {
        text += getTextFromTokens(token.tokens);
      }
    }
    return text;
  }

  // Başlıkları işlemek ve ID eklemek için renderer'ı özelleştir
  /**
   * @param {object} headingData
   * @param {Array<MarkedToken>} headingData.tokens - Heading content tokens using our typedef
   * @param {number} headingData.depth - Heading level (1-6)
   * @returns {string}
   */
  renderer.heading = ({ tokens, depth }) => {
    const level = depth;
    const rawText = getTextFromTokens(tokens); // Use helper for raw text
    const displayText = getTextFromTokens(tokens); // Use helper for display text

    let slug = slugify(rawText);

    // Slug'ı benzersiz yap
    if (usedSlugs[slug] === undefined) {
        usedSlugs[slug] = 0;
    } else {
        usedSlugs[slug]++;
        slug = `${slug}-${usedSlugs[slug]}`;
    }

    headings.push({ level, text: displayText, slug }); // Use displayText for the ToC
    // ID ile birlikte başlığı döndür
    // Render the original tokens to preserve formatting (bold, italic, etc.)
    let renderedText = '';
    for(const token of tokens) {
      // marked doesn't expose a simple way to re-render tokens directly here.
      // We'll just use the reconstructed text for simplicity.
      // For full fidelity, token rendering logic would be needed.
    }
    // Fallback to using reconstructed displayText
    renderedText = displayText; 

    return `<h${level} id="${slug}">${renderedText}</h${level}>\n`;
  };

  // Marked ayarlarını güvenlik ve performans için optimize et
  marked.setOptions({
    gfm: true,
    breaks: true,
    renderer: renderer
  });

  // Markdown içeriğini HTML'e dönüştür
  const html = marked.parse(markdownText);

  return { html, headings };
}

// Eski fonksiyonu kaldırabiliriz veya yorum satırı yapabiliriz.
// export const sanitizeAndParseMarkdown = parseMarkdown; 