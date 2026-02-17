import PptxGenJS from 'pptxgenjs';
import { saveAs } from 'file-saver';

/**
 * Generate a PPTX file from analyzed slides
 * @param {Array} analyzedSlides - Slides with elements and images
 * @param {string} mode - 'editable' | 'image'
 * @param {string} filename - Output filename
 */
export async function generatePptx(analyzedSlides, mode = 'editable', filename = 'output.pptx') {
  const pptx = new PptxGenJS();

  // Set slide dimensions (16:9 widescreen)
  pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
  pptx.layout = 'WIDE';

  for (const slideData of analyzedSlides) {
    const slide = pptx.addSlide();

    if (mode === 'image') {
      // Image mode: just the slide image as background
      slide.addImage({
        data: slideData.imageDataUrl,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    } else {
      // Editable mode: background image + text boxes
      // Add background image with slight transparency
      slide.addImage({
        data: slideData.imageDataUrl,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });

      // Overlay each text element
      for (const el of slideData.elements) {
        const x = (el.x / 100) * 13.333;
        const y = (el.y / 100) * 7.5;
        const w = Math.max((el.w / 100) * 13.333, 0.5);
        const h = Math.max((el.h / 100) * 7.5, 0.3);

        const fontSize = el.fontSize || 14;
        const color = (el.color || '#333333').replace('#', '');
        const bold = el.bold || false;
        const align = el.align || 'left';

        slide.addText(el.content || '', {
          x,
          y,
          w,
          h,
          fontSize,
          color,
          bold,
          align,
          fontFace: 'Pretendard',
          lang: 'ko-KR',
          valign: 'top',
          wrap: true,
          shrinkText: true,
        });
      }

      // Add full text to slide notes for reference
      const notesText = slideData.elements
        .map((el) => el.content)
        .filter(Boolean)
        .join('\n');
      if (notesText) {
        slide.addNotes(notesText);
      }
    }
  }

  // Generate and download
  const blob = await pptx.write({ outputType: 'blob' });
  saveAs(blob, filename);
}
