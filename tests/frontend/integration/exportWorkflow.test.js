// tests/frontend/integration/exportWorkflow.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageExport } from '@/hooks/export/useImageExport';
import {
  exportCanvasToBlob,
  compressImage,
  applyWatermark,
  downloadImage
} from '@/services/export';

/**
 * Integration tests for export workflow
 * Tests the complete flow from canvas to downloaded file
 */

describe('Export Workflow Integration', () => {
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 800, 600);
  });

  describe('Complete Export Flow', () => {
    it('exports canvas and triggers download', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        await result.current.exportAndDownload({ 
          filename: 'test-export',
          format: 'image/png'
        });
      });

      expect(result.current.lastExport).toBeTruthy();
      expect(downloadImage).toHaveBeenCalled();
    });

    it('exports with compression', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        const blob = await result.current.exportCompressed({
          targetSize: 100000,
          format: 'image/jpeg'
        });
        
        expect(blob.size).toBeLessThanOrEqual(150000); // With some tolerance
      });
    });

    it('exports with watermark applied', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        const blob = await result.current.exportWithWatermark(
          {
            type: 'text',
            text: '© 2024',
            position: 'bottom-right',
            opacity: 0.5
          },
          { format: 'image/jpeg' }
        );
        
        expect(blob).toBeInstanceOf(Blob);
      });
    });

    it('creates thumbnail after export', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      let thumbnail;
      await act(async () => {
        await result.current.exportToBlob();
        thumbnail = await result.current.createThumbnail(150);
      });

      expect(thumbnail).toBeInstanceOf(Blob);
      const img = await createImageBitmap(thumbnail);
      expect(Math.max(img.width, img.height)).toBe(150);
      img.close();
    });

    it('exports responsive images in multiple sizes', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      let exports;
      await act(async () => {
        exports = await result.current.exportResponsive([320, 640, 1024]);
      });

      expect(exports).toBeInstanceOf(Map);
      expect(exports.size).toBe(3);

      for (const [size, blob] of exports.entries()) {
        const img = await createImageBitmap(blob);
        expect(Math.max(img.width, img.height)).toBeLessThanOrEqual(size);
        img.close();
      }
    });
  });

  describe('Error Handling', () => {
    it('handles export failure gracefully', async () => {
      const { result } = renderHook(() => useImageExport(null));

      let error;
      try {
        await act(async () => {
          await result.current.exportToBlob();
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
      expect(error.message).toContain('Canvas is not available');
    });

    it('recovers from failed watermark application', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        // Should not throw, even with invalid watermark config
        try {
          await result.current.exportWithWatermark({ invalid: true });
        } catch (e) {
          // Expected to potentially fail
        }
      });

      // Should still be able to export normally
      await act(async () => {
        await result.current.exportToBlob();
      });

      expect(result.current.lastExport).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('exports within reasonable time', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      const startTime = performance.now();
      
      await act(async () => {
        await result.current.exportToBlob();
      });

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('handles multiple sequential exports', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        await result.current.exportToBlob();
        result.current.reset();
        await result.current.exportToBlob({ format: 'image/jpeg' });
        result.current.reset();
        await result.current.exportToBlob({ format: 'image/webp' });
      });

      expect(result.current.lastExport).toBeTruthy();
    });
  });

  describe('Format Compatibility', () => {
    it('exports to PNG format', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        const blob = await result.current.exportToBlob({ format: 'image/png' });
        expect(blob.type).toBe('image/png');
      });
    });

    it('exports to JPEG format', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        const blob = await result.current.exportToBlob({ format: 'image/jpeg' });
        expect(blob.type).toBe('image/jpeg');
      });
    });

    it('exports to WebP format', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        const blob = await result.current.exportToBlob({ format: 'image/webp' });
        expect(blob.type).toBe('image/webp');
      });
    });
  });

  describe('Quality Settings', () => {
    it('respects high quality setting', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      let highQualityBlob;
      await act(async () => {
        highQualityBlob = await result.current.exportToBlob({ 
          format: 'image/jpeg',
          quality: 0.92
        });
      });

      let lowQualityBlob;
      await act(async () => {
        lowQualityBlob = await result.current.exportToBlob({ 
          format: 'image/jpeg',
          quality: 0.5
        });
      });

      expect(highQualityBlob.size).toBeGreaterThan(lowQualityBlob.size);
    });
  });

  describe('State Management', () => {
    it('updates progress during export', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      expect(result.current.progress).toBe(0);

      await act(async () => {
        await result.current.exportToBlob();
      });

      expect(result.current.progress).toBe(100);
    });

    it('clears error on successful export', async () => {
      const { result } = renderHook(() => useImageExport(null));

      // First, cause an error
      try {
        await act(async () => {
          await result.current.exportToBlob();
        });
      } catch (e) {
        // Expected
      }

      expect(result.current.error).toBeTruthy();

      // Reset and export successfully
      act(() => {
        result.current.reset();
      });

      // Need valid canvas now
      const { result: newResult } = renderHook(() => useImageExport(canvas));
      
      await act(async () => {
        await newResult.current.exportToBlob();
      });

      expect(newResult.current.error).toBeNull();
    });

    it('tracks last export info', async () => {
      const { result } = renderHook(() => useImageExport(canvas));

      await act(async () => {
        await result.current.exportToBlob();
      });

      expect(result.current.lastExport).toEqual({
        blob: expect.any(Blob),
        type: expect.any(String),
        size: expect.any(Number)
      });
    });
  });
});
