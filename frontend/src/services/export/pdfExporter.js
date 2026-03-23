// frontend/src/services/export/pdfExporter.js
import { ImageFormat, ImageQuality, exportCanvasToBlob } from './imageExporter';

/**
 * PDF Export Service
 * Handles PDF generation with layout and formatting options
 */

export const PaperSize = {
  A4: { width: 210, height: 297, unit: 'mm' },
  A3: { width: 297, height: 420, unit: 'mm' },
  A5: { width: 148, height: 210, unit: 'mm' },
  LETTER: { width: 8.5, height: 11, unit: 'in' },
  LEGAL: { width: 8.5, height: 14, unit: 'in' },
  TABLOID: { width: 11, height: 17, unit: 'in' }
};

export const Orientation = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape'
};

export const FitMode = {
  CONTAIN: 'contain',
  COVER: 'cover',
  FILL: 'fill',
  ACTUAL: 'actual'
};

/**
 * Export canvas to PDF
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Object} options - PDF options
 * @returns {Promise<Blob>} - PDF blob
 */
export async function exportToPdf(canvas, options = {}) {
  const {
    paperSize = PaperSize.A4,
    orientation = Orientation.PORTRAIT,
    fitMode = FitMode.CONTAIN,
    margins = { top: 10, right: 10, bottom: 10, left: 10 },
    quality = ImageQuality.HIGH,
    title = '',
    author = '',
    subject = '',
    keywords = []
  } = options;

  // Check for jsPDF library
  if (window.jspdf || await tryLoadJsPdf()) {
    return await generatePdfWithJsPdf(canvas, {
      paperSize,
      orientation,
      fitMode,
      margins,
      quality,
      title,
      author,
      subject,
      keywords
    });
  }

  // Fallback: Generate PDF manually (basic)
  return await generatePdfManual(canvas, {
    paperSize,
    orientation,
    fitMode,
    margins,
    quality
  });
}

/**
 * Try to load jsPDF library
 */
async function tryLoadJsPdf() {
  if (window.jspdf) return true;

  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    return !!window.jspdf;
  } catch (error) {
    console.warn('jsPDF not available:', error);
    return false;
  }
}

/**
 * Load script dynamically
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Generate PDF using jsPDF
 */
async function generatePdfWithJsPdf(canvas, options) {
  const { jsPDF } = window.jspdf;
  const {
    paperSize,
    orientation,
    fitMode,
    margins,
    quality,
    title,
    author,
    subject,
    keywords
  } = options;

  // Get paper dimensions in mm
  let { width, height, unit } = paperSize;
  
  // Swap for landscape
  if (orientation === Orientation.LANDSCAPE) {
    [width, height] = [height, width];
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: orientation === Orientation.LANDSCAPE ? 'landscape' : 'portrait',
    unit: unit,
    format: [width, height]
  });

  // Set metadata
  doc.setProperties({
    title,
    author,
    subject,
    keywords: keywords.join(', '),
    creator: 'AI Media Editor',
    producer: 'AI Media Editor PDF Export'
  });

  // Convert canvas to image
  const imageData = canvas.toDataURL(ImageFormat.JPEG, quality);

  // Calculate image dimensions to fit page
  const imgDimensions = calculateImageDimensions(canvas, { width, height, unit }, fitMode, margins);

  // Add image to PDF
  doc.addImage(
    imageData,
    'JPEG',
    margins.left,
    margins.top,
    imgDimensions.width,
    imgDimensions.height,
    undefined,
    'FAST'
  );

  // Generate PDF blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

/**
 * Calculate image dimensions for fit mode
 */
function calculateImageDimensions(canvas, paper, fitMode, margins) {
  const canvasAspect = canvas.width / canvas.height;
  
  // Available space after margins (convert to same unit)
  const availableWidth = paper.width - margins.left - margins.right;
  const availableHeight = paper.height - margins.top - margins.bottom;
  const paperAspect = availableWidth / availableHeight;

  let width, height;

  switch (fitMode) {
    case FitMode.CONTAIN:
      if (canvasAspect > paperAspect) {
        width = availableWidth;
        height = availableWidth / canvasAspect;
      } else {
        height = availableHeight;
        width = availableHeight * canvasAspect;
      }
      break;

    case FitMode.COVER:
      if (canvasAspect > paperAspect) {
        height = availableHeight;
        width = availableHeight * canvasAspect;
      } else {
        width = availableWidth;
        height = availableWidth / canvasAspect;
      }
      break;

    case FitMode.FILL:
      width = availableWidth;
      height = availableHeight;
      break;

    case FitMode.ACTUAL:
    default:
      // Convert pixels to paper units (assuming 96 DPI)
      const dpi = 96;
      const mmPerInch = 25.4;
      width = (canvas.width / dpi) * mmPerInch;
      height = (canvas.height / dpi) * mmPerInch;
      break;
  }

  return { width, height };
}

/**
 * Generate PDF manually (basic implementation)
 */
async function generatePdfManual(canvas, options) {
  const { paperSize, orientation, fitMode, margins, quality } = options;
  
  // Get paper dimensions
  let { width, height, unit } = paperSize;
  
  if (orientation === Orientation.LANDSCAPE) {
    [width, height] = [height, width];
  }

  // Convert to pixels (assuming 96 DPI)
  const dpi = 96;
  const mmToPx = (mm) => (mm / 25.4) * dpi;
  const inToPx = (inch) => inch * dpi;

  const paperWidthPx = unit === 'mm' ? mmToPx(width) : inToPx(width);
  const paperHeightPx = unit === 'mm' ? mmToPx(height) : inToPx(height);

  // Create canvas for PDF page
  const pdfCanvas = document.createElement('canvas');
  pdfCanvas.width = Math.floor(paperWidthPx);
  pdfCanvas.height = Math.floor(paperHeightPx);
  const ctx = pdfCanvas.getContext('2d');

  // Fill white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);

  // Calculate image dimensions
  const marginsPx = {
    top: unit === 'mm' ? mmToPx(margins.top) : inToPx(margins.top),
    left: unit === 'mm' ? mmToPx(margins.left) : inToPx(margins.left),
    right: unit === 'mm' ? mmToPx(margins.right) : inToPx(margins.right),
    bottom: unit === 'mm' ? mmToPx(margins.bottom) : inToPx(margins.bottom)
  };

  const availableWidth = pdfCanvas.width - marginsPx.left - marginsPx.right;
  const availableHeight = pdfCanvas.height - marginsPx.top - marginsPx.bottom;

  const imgDimensions = calculateImageDimensionsPx(canvas, availableWidth, availableHeight, fitMode);

  // Draw image
  ctx.drawImage(
    canvas,
    marginsPx.left,
    marginsPx.top,
    imgDimensions.width,
    imgDimensions.height
  );

  // Export as PNG (PDF-like single page)
  return await new Promise(resolve => pdfCanvas.toBlob(resolve, ImageFormat.PNG, quality));
}

/**
 * Calculate image dimensions in pixels
 */
function calculateImageDimensionsPx(canvas, availableWidth, availableHeight, fitMode) {
  const canvasAspect = canvas.width / canvas.height;
  const paperAspect = availableWidth / availableHeight;

  let width, height;

  switch (fitMode) {
    case FitMode.CONTAIN:
      if (canvasAspect > paperAspect) {
        width = availableWidth;
        height = availableWidth / canvasAspect;
      } else {
        height = availableHeight;
        width = availableHeight * canvasAspect;
      }
      break;

    case FitMode.COVER:
      if (canvasAspect > paperAspect) {
        height = availableHeight;
        width = availableHeight * canvasAspect;
      } else {
        width = availableWidth;
        height = availableWidth / canvasAspect;
      }
      break;

    case FitMode.FILL:
      width = availableWidth;
      height = availableHeight;
      break;

    default:
      width = canvas.width;
      height = canvas.height;
  }

  return { width: Math.floor(width), height: Math.floor(height) };
}

/**
 * Export multiple canvases as multi-page PDF
 * @param {Array<HTMLCanvasElement>} canvases - Array of canvases
 * @param {Object} options - PDF options
 * @returns {Promise<Blob>} - PDF blob
 */
export async function exportMultipleToPdf(canvases, options = {}) {
  const { jsPDF } = window.jspdf || (await tryLoadJsPdf()) ? window.jspdf : null;

  if (!jsPDF) {
    throw new Error('jsPDF library is required for multi-page PDF export');
  }

  const {
    paperSize = PaperSize.A4,
    orientation = Orientation.PORTRAIT,
    fitMode = FitMode.CONTAIN,
    margins = { top: 10, right: 10, bottom: 10, left: 10 }
  } = options;

  let { width, height, unit } = paperSize;

  if (orientation === Orientation.LANDSCAPE) {
    [width, height] = [height, width];
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: orientation === Orientation.LANDSCAPE ? 'landscape' : 'portrait',
    unit,
    format: [width, height]
  });

  // Add pages
  for (let i = 0; i < canvases.length; i++) {
    if (i > 0) {
      doc.addPage([width, height]);
    }

    const imageData = canvases[i].toDataURL(ImageFormat.JPEG, ImageQuality.HIGH);
    const imgDimensions = calculateImageDimensions(canvases[i], { width, height, unit }, fitMode, margins);

    doc.addImage(
      imageData,
      'JPEG',
      margins.left,
      margins.top,
      imgDimensions.width,
      imgDimensions.height,
      undefined,
      'FAST'
    );
  }

  return doc.output('blob');
}

/**
 * Create PDF with text and images
 * @param {Object} content - PDF content configuration
 * @returns {Promise<Blob>} - PDF blob
 */
export async function createPdfWithContent(content, options = {}) {
  const { jsPDF } = window.jspdf || (await tryLoadJsPdf()) ? window.jspdf : null;

  if (!jsPDF) {
    throw new Error('jsPDF library is required for rich PDF creation');
  }

  const {
    paperSize = PaperSize.A4,
    orientation = Orientation.PORTRAIT
  } = options;

  let { width, height, unit } = paperSize;

  if (orientation === Orientation.LANDSCAPE) {
    [width, height] = [height, width];
  }

  const doc = new jsPDF({
    orientation: orientation === Orientation.LANDSCAPE ? 'landscape' : 'portrait',
    unit,
    format: [width, height]
  });

  // Process content sections
  let yPosition = 10;
  const margin = 10;
  const pageWidth = width - margin * 2;

  for (const section of content.sections || []) {
    if (section.type === 'text') {
      doc.setFontSize(section.fontSize || 12);
      doc.setFont(section.fontStyle || 'normal');
      
      const lines = doc.splitTextToSize(section.text, pageWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * (section.fontSize || 12) * 0.35 + 5;
    } else if (section.type === 'image' && section.canvas) {
      const imageData = section.canvas.toDataURL(ImageFormat.JPEG, ImageQuality.HIGH);
      const imgHeight = section.height || (section.width || 100) * (section.canvas.height / section.canvas.width);
      
      doc.addImage(imageData, 'JPEG', margin, yPosition, section.width || 100, imgHeight);
      yPosition += imgHeight + 10;
    } else if (section.type === 'pagebreak') {
      doc.addPage();
      yPosition = 10;
    }
  }

  return doc.output('blob');
}

/**
 * Download PDF
 */
export function downloadPdf(blob, filename = 'document') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectObjectURL(url), 100);
}

/**
 * Print PDF (opens print dialog)
 */
export function printPdf(blob) {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    iframe.contentWindow.print();
  };
}

export default {
  exportToPdf,
  exportMultipleToPdf,
  createPdfWithContent,
  downloadPdf,
  printPdf,
  PaperSize,
  Orientation,
  FitMode
};
