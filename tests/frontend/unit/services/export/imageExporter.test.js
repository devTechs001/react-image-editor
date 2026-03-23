// tests/frontend/unit/services/export/imageExporter.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportCanvasToBlob,
  exportCanvasToDataURL,
  downloadImage,
  exportWithMetadata,
  createThumbnail,
  exportResponsiveImages,
  ImageFormat,
  ImageQuality
} from '@/services/export/imageExporter';

describe('imageExporter', () => {
  let canvas;
  let ctx;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 100, 100);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportCanvasToBlob', () => {
    it('exports canvas to PNG blob by default', async () => {
      const blob = await exportCanvasToBlob(canvas);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('exports canvas to JPEG with specified format', async () => {
      const blob = await exportCanvasToBlob(canvas, { format: ImageFormat.JPEG });
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('exports canvas to WEBP format', async () => {
      const blob = await exportCanvasToBlob(canvas, { format: ImageFormat.WEBP });
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/webp');
    });

    it('applies quality setting for lossy formats', async () => {
      const blobHigh = await exportCanvasToBlob(canvas, { 
        format: ImageFormat.JPEG,
        quality: ImageQuality.HIGH 
      });
      
      const blobLow = await exportCanvasToBlob(canvas, { 
        format: ImageFormat.JPEG,
        quality: ImageQuality.LOW 
      });
      
      // Higher quality should generally produce larger file
      expect(blobHigh.size).toBeGreaterThanOrEqual(blobLow.size);
    });

    it('scales canvas when scale option is provided', async () => {
      const blob = await exportCanvasToBlob(canvas, { scale: 2 });
      
      // Create image to check dimensions
      const img = await createImageBitmap(blob);
      expect(img.width).toBe(200);
      expect(img.height).toBe(200);
      img.close();
    });

    it('respects maxWidth option', async () => {
      const blob = await exportCanvasToBlob(canvas, { maxWidth: 50 });
      
      const img = await createImageBitmap(blob);
      expect(img.width).toBeLessThanOrEqual(50);
      img.close();
    });

    it('respects maxHeight option', async () => {
      const blob = await exportCanvasToBlob(canvas, { maxHeight: 50 });
      
      const img = await createImageBitmap(blob);
      expect(img.height).toBeLessThanOrEqual(50);
      img.close();
    });
  });

  describe('exportCanvasToDataURL', () => {
    it('exports canvas to data URL', () => {
      const dataUrl = exportCanvasToDataURL(canvas);
      
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('exports to specified format', () => {
      const dataUrl = exportCanvasToDataURL(canvas, { format: ImageFormat.JPEG });
      
      expect(dataUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('applies quality setting', () => {
      const dataUrlHigh = exportCanvasToDataURL(canvas, { quality: ImageQuality.HIGH });
      const dataUrlLow = exportCanvasToDataURL(canvas, { quality: ImageQuality.LOW });
      
      // Higher quality data URL should be longer (more data)
      expect(dataUrlHigh.length).toBeGreaterThanOrEqual(dataUrlLow.length);
    });
  });

  describe('downloadImage', () => {
    it('creates download link with correct filename', () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      
      // Mock createElement and appendChild
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      createElementSpy.mockReturnValue(mockLink);

      downloadImage(blob, 'test-image');

      expect(mockLink.download).toBe('test-image.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('uses correct extension for JPEG', () => {
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadImage(blob, 'test-image');

      expect(mockLink.download).toBe('test-image.jpg');

      createElementSpy.mockRestore();
    });

    it('uses correct extension for WEBP', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadImage(blob, 'test-image');

      expect(mockLink.download).toBe('test-image.webp');

      createElementSpy.mockRestore();
    });
  });

  describe('createThumbnail', () => {
    it('creates thumbnail with specified size', async () => {
      const thumbnail = await createThumbnail(canvas, 50);
      
      expect(thumbnail).toBeInstanceOf(Blob);
      
      const img = await createImageBitmap(thumbnail);
      expect(Math.max(img.width, img.height)).toBe(50);
      img.close();
    });

    it('maintains aspect ratio', async () => {
      const rectCanvas = document.createElement('canvas');
      rectCanvas.width = 200;
      rectCanvas.height = 100;
      
      const thumbnail = await createThumbnail(rectCanvas, 50);
      const img = await createImageBitmap(thumbnail);
      
      // Aspect ratio should be maintained (2:1)
      expect(img.width / img.height).toBeCloseTo(2, 1);
      expect(Math.max(img.width, img.height)).toBe(50);
      img.close();
    });

    it('returns JPEG format', async () => {
      const thumbnail = await createThumbnail(canvas, 50);
      expect(thumbnail.type).toBe('image/jpeg');
    });
  });

  describe('exportResponsiveImages', () => {
    it('exports multiple sizes', async () => {
      const sizes = [100, 200, 300];
      const exports = await exportResponsiveImages(canvas, sizes);
      
      expect(exports).toBeInstanceOf(Map);
      expect(exports.size).toBe(sizes.length);
      
      for (const size of sizes) {
        expect(exports.has(size)).toBe(true);
        const blob = exports.get(size);
        expect(blob).toBeInstanceOf(Blob);
      }
    });

    it('respects max width for each size', async () => {
      const sizes = [50, 100];
      const exports = await exportResponsiveImages(canvas, sizes);
      
      for (const [size, blob] of exports.entries()) {
        const img = await createImageBitmap(blob);
        expect(Math.max(img.width, img.height)).toBeLessThanOrEqual(size);
        img.close();
      }
    });
  });

  describe('exportWithMetadata', () => {
    it('exports image with metadata', async () => {
      const metadata = {
        title: 'Test Image',
        artist: 'Test Artist',
        copyright: 'Test Copyright'
      };
      
      const blob = await exportWithMetadata(canvas, metadata, {
        format: ImageFormat.JPEG
      });
      
      expect(blob).toBeInstanceOf(Blob);
      // Note: Full metadata verification would require EXIF parsing
    });

    it('handles empty metadata', async () => {
      const blob = await exportWithMetadata(canvas, {}, {
        format: ImageFormat.JPEG
      });
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('ImageFormat constants', () => {
    it('has correct MIME types', () => {
      expect(ImageFormat.PNG).toBe('image/png');
      expect(ImageFormat.JPEG).toBe('image/jpeg');
      expect(ImageFormat.WEBP).toBe('image/webp');
      expect(ImageFormat.AVIF).toBe('image/avif');
      expect(ImageFormat.BMP).toBe('image/bmp');
      expect(ImageFormat.TIFF).toBe('image/tiff');
    });
  });

  describe('ImageQuality constants', () => {
    it('has correct quality values', () => {
      expect(ImageQuality.LOSSLESS).toBe(1);
      expect(ImageQuality.HIGH).toBe(0.92);
      expect(ImageQuality.MEDIUM).toBe(0.75);
      expect(ImageQuality.LOW).toBe(0.5);
    });
  });
});
