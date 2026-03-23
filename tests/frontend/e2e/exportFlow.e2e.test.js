// tests/frontend/e2e/exportFlow.e2e.test.js
import { describe, it, expect, vi } from 'vitest';

/**
 * E2E-style tests for export functionality
 * These tests simulate real user workflows
 */

describe('Export E2E Flow', () => {
  describe('User Export Journey', () => {
    it('completes full export journey', async () => {
      // Simulate user creating and exporting an image
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      // User draws something
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.arc(960, 540, 200, 0, Math.PI * 2);
      ctx.fill();
      
      // User exports
      const blob = await canvasToBlob(canvas, 'image/png');
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe('image/png');
    });

    it('exports edited image with adjustments', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      // Original image
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 600);
      
      // User applies brightness adjustment
      ctx.filter = 'brightness(1.2)';
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(100, 100, 200, 200);
      
      // User applies contrast
      ctx.filter = 'contrast(1.1)';
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(400, 100, 200, 200);
      
      // Export
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
      expect(blob).toBeInstanceOf(Blob);
    });

    it('exports with watermark for protection', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      
      // Create image
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 1000, 1000);
      
      // Add watermark
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.font = '48px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.fillText('© My Company', 980, 980);
      ctx.restore();
      
      const blob = await canvasToBlob(canvas, 'image/jpeg');
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('Batch Export Workflow', () => {
    it('exports multiple images in sequence', async () => {
      const canvases = [];
      
      // Create multiple images
      for (let i = 0; i < 5; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = `hsl(${i * 72}, 70%, 50%)`;
        ctx.fillRect(0, 0, 500, 500);
        canvases.push(canvas);
      }
      
      // Export all
      const exports = [];
      for (const canvas of canvases) {
        const blob = await canvasToBlob(canvas, 'image/png');
        exports.push(blob);
      }
      
      expect(exports).toHaveLength(5);
      exports.forEach(blob => {
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(0);
      });
    });

    it('exports with different formats in batch', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#abcdef';
      ctx.fillRect(0, 0, 400, 400);
      
      const formats = ['image/png', 'image/jpeg', 'image/webp'];
      const results = new Map();
      
      for (const format of formats) {
        const blob = await canvasToBlob(canvas, format, 0.8);
        results.set(format, blob);
      }
      
      expect(results.size).toBe(3);
      
      // PNG should be largest (lossless)
      const pngSize = results.get('image/png').size;
      const jpegSize = results.get('image/jpeg').size;
      expect(pngSize).toBeGreaterThanOrEqual(jpegSize);
    });
  });

  describe('Responsive Export Workflow', () => {
    it('exports for multiple device sizes', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1500;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#123456';
      ctx.fillRect(0, 0, 2000, 1500);
      
      const deviceSizes = {
        mobile: 375,
        tablet: 768,
        desktop: 1440,
        retina: 2000
      };
      
      const exports = {};
      
      for (const [device, size] of Object.entries(deviceSizes)) {
        const exportCanvas = document.createElement('canvas');
        const ratio = size / Math.max(canvas.width, canvas.height);
        exportCanvas.width = canvas.width * ratio;
        exportCanvas.height = canvas.height * ratio;
        
        const exportCtx = exportCanvas.getContext('2d');
        exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
        
        const blob = await canvasToBlob(exportCanvas, 'image/jpeg', 0.8);
        exports[device] = blob;
      }
      
      // Verify sizes are appropriate
      expect(exports.mobile.size).toBeLessThan(exports.tablet.size);
      expect(exports.tablet.size).toBeLessThan(exports.desktop.size);
      expect(exports.desktop.size).toBeLessThanOrEqual(exports.retina.size);
    });
  });

  describe('Optimization Workflow', () => {
    it('optimizes for web export', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      
      // Create detailed image
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * 3000,
          Math.random() * 2000,
          Math.random() * 100 + 50,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      
      // Original export
      const originalBlob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
      
      // Optimized export
      const optimizedCanvas = document.createElement('canvas');
      optimizedCanvas.width = 1920;
      optimizedCanvas.height = 1280;
      const optCtx = optimizedCanvas.getContext('2d');
      optCtx.drawImage(canvas, 0, 0, 1920, 1280);
      const optimizedBlob = await canvasToBlob(optimizedCanvas, 'image/jpeg', 0.75);
      
      // Verify optimization
      expect(optimizedBlob.size).toBeLessThan(originalBlob.size);
      const savings = ((originalBlob.size - optimizedBlob.size) / originalBlob.size) * 100;
      expect(savings).toBeGreaterThan(50); // At least 50% savings
    });
  });

  describe('Error Recovery', () => {
    it('handles export failure and retries', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 100, 100);
      
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!success && attempts < maxAttempts) {
        attempts++;
        try {
          const blob = await canvasToBlob(canvas, 'image/png');
          if (blob.size > 0) {
            success = true;
          }
        } catch (e) {
          // Retry
        }
      }
      
      expect(success).toBe(true);
      expect(attempts).toBeLessThanOrEqual(maxAttempts);
    });
  });
});

// Helper function
async function canvasToBlob(canvas, type = 'image/png', quality = 1) {
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}
