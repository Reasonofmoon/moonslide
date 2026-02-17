import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Load a PDF file and return the document proxy
 */
export async function loadPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf;
}

/**
 * Render a single PDF page to a base64 PNG image
 */
export async function renderPageToImage(pdf, pageNum, scale = 2) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Render all pages of a PDF to images
 */
export async function renderAllPages(pdf, scale = 2, onProgress) {
  const pages = [];
  const totalPages = pdf.numPages;

  for (let i = 1; i <= totalPages; i++) {
    const pageData = await renderPageToImage(pdf, i, scale);
    pages.push({ pageNum: i, ...pageData });
    if (onProgress) onProgress(i, totalPages);
  }

  return pages;
}

/**
 * Read an image file (PNG/JPG/WEBP) as a data URL
 */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl: reader.result,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
