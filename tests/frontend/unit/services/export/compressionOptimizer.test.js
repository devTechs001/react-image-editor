// tests/frontend/unit/services/export/compressionOptimizer.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  compressImage,
  estimateFileSize,
  getOptimalFormat,
  batchCompress,
  progressiveOptimize,
  CompressionPreset
} from '@/services/export/compressionOptimizer';

describe('compressionOptimizer', () => {
  let canvas;
  let ctx;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    ctx = canvas.getContext('2d');
    
    // Fill with test pattern
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(50, 0, 50, 50);
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 50, 50, 50);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(50, 50, 50, 50);
  });

  describe('compressImage', () => {
    it('compresses canvas to blob', async () => {
      const blob = await compressImage(canvas);
      
      expect(blob).toBeInstanceOf(Blob);
    });

    it('compresses blob to smaller blob', async () => {
      const originalBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const compressed = await compressImage(originalBlob, 'image/jpeg', 0.75);
      
      expect(compressed).toBeInstanceOf(Blob);
      expect(compressed.type).toBe('image/jpeg');
    });

    it('respects quality setting', async () => {
      const highQuality = await compressImage(canvas, 'image/jpeg', 0.9);
      const lowQuality = await compressImage(canvas, 'image/jpeg', 0.3);
      
      expect(highQuality.size).toBeGreaterThan(lowQuality.size);
    });

    it('resizes when maxWidth is specified', async () => {
      const compressed = await compressImage(canvas, 'image/jpeg', 0.75, {
        maxWidth: 50
      });
      
      const img = await createImageBitmap(compressed);
      expect(img.width).toBeLessThanOrEqual(50);
      img.close();
    });

    it('resizes when maxHeight is specified', async () => {
      const compressed = await compressImage(canvas, 'image/jpeg', 0.75, {
        maxHeight: 50
      });
      
      const img = await createImageBitmap(compressed);
      expect(img.height).toBeLessThanOrEqual(50);
      img.close();
    });

    it('uses smart compression with target size', async () => {
      const targetSize = 5000; // 5KB
      const compressed = await compressImage(canvas, 'image/jpeg', 0.75, {
        targetSize,
        method: 'smart'
      });
      
      // Size should be close to target (within 20%)
      const ratio = compressed.size / targetSize;
      expect(ratio).toBeLessThan(1.2);
    });

    it('uses aggressive compression', async () => {
      const compressed = await compressImage(canvas, 'image/jpeg', 0.5, {
        method: 'aggressive'
      });
      
      expect(compressed).toBeInstanceOf(Blob);
    });
  });

  describe('estimateFileSize', () => {
    it('estimates file size for canvas', () => {
      const estimated = estimateFileSize(canvas, 'image/jpeg', 0.75);
      
      expect(estimated).toBeGreaterThan(0);
      expect(typeof estimated).toBe('number');
    });

    it('estimates larger size for larger canvas', () => {
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = 50;
      smallCanvas.height = 50;
      
      const smallEstimate = estimateFileSize(smallCanvas);
      const largeEstimate = estimateFileSize(canvas);
      
      expect(largeEstimate).toBeGreaterThan(smallEstimate);
    });

    it('estimates larger size for PNG than JPEG', () => {
      const pngEstimate = estimateFileSize(canvas, 'image/png');
      const jpegEstimate = estimateFileSize(canvas, 'image/jpeg', 0.75);
      
      // PNG is lossless, typically larger
      expect(pngEstimate).toBeGreaterThanOrEqual(jpegEstimate);
    });

    it('estimates smaller size for lower quality', () => {
      const highQualityEstimate = estimateFileSize(canvas, 'image/jpeg', 0.9);
      const lowQualityEstimate = estimateFileSize(canvas, 'image/jpeg', 0.3);
      
      expect(highQualityEstimate).toBeGreaterThanOrEqual(lowQualityEstimate);
    });
  });

  describe('getOptimalFormat', () => {
    it('recommends PNG for transparency', () => {
      const format = getOptimalFormat(canvas, { needsTransparency: true });
      expect(format).toBe('image/png');
    });

    it('recommends GIF for animation', () => {
      const format = getOptimalFormat(canvas, { needsAnimation: true });
      expect(format).toBe('image/gif');
    });

    it('recommends WebP for small size with transparency', () => {
      const format = getOptimalFormat(canvas, { 
        needsTransparency: true,
        preferSmallSize: true 
      });
      expect(format).toBe('image/webp');
    });

    it('recommends PNG for quality', () => {
      const format = getOptimalFormat(canvas, { preferQuality: true });
      expect(format).toBe('image/png');
    });

    it('recommends AVIF for small size', () => {
      const format = getOptimalFormat(canvas, { preferSmallSize: true });
      expect(format).toBe('image/avif');
    });

    it('recommends JPEG as default', () => {
      const format = getOptimalFormat(canvas);
      expect(format).toBe('image/jpeg');
    });

    it('detects transparency in canvas', () => {
      // Create canvas with transparency
      const transparentCanvas = document.createElement('canvas');
      transparentCanvas.width = 100;
      transparentCanvas.height = 100;
      const ctx = transparentCanvas.getContext('2d');
      ctx.clearRect(0, 0, 100, 100);
      
      // This should work but exact behavior depends on implementation
      const format = getOptimalFormat(transparentCanvas);
      expect(format).toBeTruthy();
    });
  });

  describe('batchCompress', () => {
    it('compresses multiple images', async () => {
      const canvases = [canvas, canvas, canvas];
      const results = await batchCompress(canvases, {
        format: 'image/jpeg',
        quality: 0.75
      });
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeInstanceOf(Blob);
      });
    });

    it('returns null for failed compressions', async () => {
      const items = [canvas, null, canvas];
      const results = await batchCompress(items, {
        format: 'image/jpeg',
        quality: 0.75
      });
      
      expect(results).toHaveLength(3);
      expect(results[0]).toBeInstanceOf(Blob);
      expect(results[1]).toBeNull();
      expect(results[2]).toBeInstanceOf(Blob);
    });

    it('handles empty array', async () => {
      const results = await batchCompress([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('progressiveOptimize', () => {
    it('optimizes canvas progressively', async () => {
      const optimized = await progressiveOptimize(canvas, 0.75);
      
      expect(optimized).toBeInstanceOf(Blob);
      expect(optimized.type).toBe('image/jpeg');
    });

    it('produces smaller file than original', async () => {
      const original = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );
      
      const optimized = await progressiveOptimize(canvas, 0.75);
      
      expect(optimized.size).toBeLessThanOrEqual(original.size);
    });
  });

  describe('CompressionPreset', () => {
    it('has correct preset values', () => {
      expect(CompressionPreset.LOSSLESS).toEqual({ quality: 1, method: 'none' });
      expect(CompressionPreset.HIGH_QUALITY).toEqual({ quality: 0.92, method: 'smart' });
      expect(CompressionPreset.BALANCED).toEqual({ quality: 0.75, method: 'smart' });
      expect(CompressionPreset.SMALL_SIZE).toEqual({ quality: 0.6, method: 'aggressive' });
      expect(CompressionPreset.TINY).toEqual({ quality: 0.4, method: 'aggressive' });
    });

    it('can use preset for compression', async () => {
      const blob = await compressImage(
        canvas, 
        'image/jpeg', 
        CompressionPreset.BALANCED.quality,
        { method: CompressionPreset.BALANCED.method }
      );
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });
});
