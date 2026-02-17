/**
 * Composite text overlays onto a slide image using Canvas 2D
 * Returns a data URL with the text "baked in" to the image
 */

/**
 * @param {Object} slideData - { imageDataUrl, elements, bgColor, width, height }
 * @returns {Promise<string>} composite image as data URL
 */
export function compositeSlideImage(slideData) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // 1. Draw the original slide image
      ctx.drawImage(img, 0, 0);

      // 2. Draw each text element overlay on top
      const elements = slideData.elements || [];
      for (const el of elements) {
        const x = (el.x / 100) * canvas.width;
        const y = (el.y / 100) * canvas.height;
        const w = (el.w / 100) * canvas.width;
        const h = (el.h / 100) * canvas.height;

        // Draw opaque background rectangle (sticker effect)
        const bgColor = el.bgColor || slideData.bgColor || '#ffffff';
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, w, h);

        // Draw text
        const fontSize = Math.max(8, (el.fontSize || 14) * (canvas.width / 960));
        const bold = el.bold ? 'bold ' : '';
        ctx.font = `${bold}${fontSize}px "Pretendard Variable", "Pretendard", -apple-system, sans-serif`;
        ctx.fillStyle = el.color || '#333333';
        ctx.textBaseline = 'top';

        // Text alignment
        const align = el.align || 'left';
        if (align === 'center') {
          ctx.textAlign = 'center';
        } else if (align === 'right') {
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'left';
        }

        // Word-wrap and render text
        const padding = 4;
        const lineHeight = fontSize * 1.3;
        const maxWidth = w - padding * 2;
        const content = el.content || '';
        const lines = wrapText(ctx, content, maxWidth);

        let textX;
        if (align === 'center') textX = x + w / 2;
        else if (align === 'right') textX = x + w - padding;
        else textX = x + padding;

        for (let i = 0; i < lines.length; i++) {
          const textY = y + padding + i * lineHeight;
          if (textY + fontSize > y + h) break; // clip to box
          ctx.fillText(lines[i], textX, textY);
        }
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = slideData.dataUrl || slideData.imageDataUrl;
  });
}

/**
 * Composite all slides and return array of data URLs
 */
export async function compositeAllSlides(analyzedSlides) {
  return Promise.all(analyzedSlides.map(compositeSlideImage));
}

/**
 * Simple word-wrap for canvas text rendering
 */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [''];

  // Split by explicit newlines first
  const paragraphs = text.split('\n');
  const result = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split('');
    let line = '';

    for (const char of words) {
      const testLine = line + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line.length > 0) {
        result.push(line);
        line = char;
      } else {
        line = testLine;
      }
    }
    result.push(line);
  }

  return result;
}
