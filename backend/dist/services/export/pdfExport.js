// backend/src/services/export/pdfExport.js
const PDFDocument = require('pdfkit');
const sharp = require('sharp');

/**
 * Export project as PDF
 * @param {Object} project - Project document
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Exported PDF buffer and metadata
 */
async function exportPdf(project, options = {}) {
  const {
    pageSize = 'custom',
    orientation = 'landscape',
    fitToPage = true,
    includeMetadata = true,
    quality = 90
  } = options;
  return new Promise(async (resolve, reject) => {
    try {
      const chunks = [];
      const doc = new PDFDocument({
        size: getPageSize(pageSize, project.canvas, orientation),
        orientation,
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      });
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve({
          buffer: pdfBuffer,
          size: pdfBuffer.length,
          mimeType: 'application/pdf',
          format: 'pdf',
          pages: 1
        });
      });
      doc.on('error', reject);

      // Export project as image first
      const {
        exportImage
      } = require('./imageExport');
      const imageResult = await exportImage(project, {
        format: 'jpg',
        quality,
        ...options
      });

      // Calculate dimensions for PDF
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const imageAspectRatio = imageResult.dimensions.width / imageResult.dimensions.height;
      const pageAspectRatio = pageWidth / pageHeight;
      let drawWidth, drawHeight, x, y;
      if (fitToPage) {
        if (imageAspectRatio > pageAspectRatio) {
          drawWidth = pageWidth;
          drawHeight = pageWidth / imageAspectRatio;
        } else {
          drawHeight = pageHeight;
          drawWidth = pageHeight * imageAspectRatio;
        }
        x = (pageWidth - drawWidth) / 2;
        y = (pageHeight - drawHeight) / 2;
      } else {
        drawWidth = imageResult.dimensions.width;
        drawHeight = imageResult.dimensions.height;
        x = 0;
        y = 0;
      }

      // Add image to PDF
      doc.image(imageResult.buffer, x, y, {
        width: drawWidth,
        height: drawHeight
      });

      // Add metadata if requested
      if (includeMetadata) {
        doc.addPage();
        doc.fontSize(12).text('Project Metadata', 50, 50);
        doc.fontSize(10).text(`Name: ${project.name || 'Untitled'}`, 50, 80);
        doc.text(`Created: ${project.createdAt?.toLocaleString() || 'N/A'}`, 50, 100);
        doc.text(`Dimensions: ${project.canvas?.width}x${project.canvas?.height}`, 50, 120);
        doc.text(`Layers: ${project.layers?.length || 0}`, 50, 140);
      }
      doc.end();
    } catch (error) {
      reject(new Error(`PDF export failed: ${error.message}`));
    }
  });
}

/**
 * Get PDF page size
 */
function getPageSize(pageSize, canvas, orientation) {
  const sizes = {
    'A4': [595, 842],
    'A3': [842, 1191],
    'Letter': [612, 792],
    'Legal': [612, 1008],
    'Tabloid': [792, 1224]
  };
  if (pageSize === 'custom' && canvas) {
    // Convert pixels to points (72 DPI)
    const scale = 72 / 96; // Assuming 96 DPI screen
    return [canvas.width * scale, canvas.height * scale];
  }
  const size = sizes[pageSize] || sizes['A4'];
  if (orientation === 'landscape') {
    return [size[1], size[0]];
  }
  return size;
}
module.exports = {
  exportPdf
};