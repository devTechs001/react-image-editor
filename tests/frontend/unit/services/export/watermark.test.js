// tests/frontend/unit/services/export/watermark.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyWatermark,
  removeWatermark,
  batchApplyWatermark,
  WatermarkPosition,
  WatermarkType,
  WatermarkPresets
} from '@/services/export/watermark';

describe('watermark', () => {
  let canvas;
  let ctx;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    ctx = canvas.getContext('2d');
    
    // Fill with test color
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 200, 200);
  });

  describe('applyWatermark', () => {
    it('applies text watermark to canvas', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test Watermark'
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('applies watermark with custom opacity', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        opacity: 0.3
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('positions watermark at bottom-right by default', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        position: WatermarkPosition.BOTTOM_RIGHT
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('positions watermark at top-left', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        position: WatermarkPosition.TOP_LEFT
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('positions watermark at center', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        position: WatermarkPosition.CENTER
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('applies tiled watermark', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        position: WatermarkPosition.TILE
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('applies watermark with rotation', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        rotation: 45
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('applies watermark with custom font', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        fontSize: 32,
        fontFamily: 'Arial'
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('applies watermark with custom color', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        color: '#FF0000'
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('applies watermark with background', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        backgroundColor: '#000000',
        backgroundOpacity: 0.5
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('applies image watermark', async () => {
      const watermarkImage = document.createElement('canvas');
      watermarkImage.width = 50;
      watermarkImage.height = 50;
      
      const result = await applyWatermark(canvas, {
        type: WatermarkType.IMAGE,
        image: watermarkImage
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('scales watermark image', async () => {
      const watermarkImage = document.createElement('canvas');
      watermarkImage.width = 100;
      watermarkImage.height = 100;
      
      const result = await applyWatermark(canvas, {
        type: WatermarkType.IMAGE,
        image: watermarkImage,
        scale: 0.5
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('applies watermark with blend mode', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test',
        blendMode: 'multiply'
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('handles multiline text', async () => {
      const result = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Line 1\nLine 2\nLine 3'
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('uses preset configuration', async () => {
      const result = await applyWatermark(canvas, {
        ...WatermarkPresets.discreet,
        type: WatermarkType.TEXT,
        text: 'Test'
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });
  });

  describe('removeWatermark', () => {
    it('attempts to remove watermark from canvas', async () => {
      const watermarkedCanvas = await applyWatermark(canvas, {
        type: WatermarkType.TEXT,
        text: 'Test'
      });
      
      const result = await removeWatermark(watermarkedCanvas, {
        x: 150,
        y: 150,
        width: 40,
        height: 20
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('handles invalid watermark area', async () => {
      const result = await removeWatermark(canvas, {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
      
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });
  });

  describe('batchApplyWatermark', () => {
    it('applies watermark to multiple canvases', async () => {
      const canvases = [canvas, canvas, canvas];
      
      const results = await batchApplyWatermark(canvases, {
        type: WatermarkType.TEXT,
        text: 'Test'
      });
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeInstanceOf(HTMLCanvasElement);
      });
    });

    it('handles empty array', async () => {
      const results = await batchApplyWatermark([]);
      expect(results).toHaveLength(0);
    });

    it('applies same watermark to all canvases', async () => {
      const canvases = [canvas, canvas];
      
      const results = await batchApplyWatermark(canvases, {
        type: WatermarkType.TEXT,
        text: 'Consistent'
      });
      
      expect(results).toHaveLength(2);
    });
  });

  describe('WatermarkPosition', () => {
    it('has all position constants', () => {
      expect(WatermarkPosition.TOP_LEFT).toBe('top-left');
      expect(WatermarkPosition.TOP_CENTER).toBe('top-center');
      expect(WatermarkPosition.TOP_RIGHT).toBe('top-right');
      expect(WatermarkPosition.MIDDLE_LEFT).toBe('middle-left');
      expect(WatermarkPosition.CENTER).toBe('center');
      expect(WatermarkPosition.MIDDLE_RIGHT).toBe('middle-right');
      expect(WatermarkPosition.BOTTOM_LEFT).toBe('bottom-left');
      expect(WatermarkPosition.BOTTOM_CENTER).toBe('bottom-center');
      expect(WatermarkPosition.BOTTOM_RIGHT).toBe('bottom-right');
      expect(WatermarkPosition.TILE).toBe('tile');
    });
  });

  describe('WatermarkType', () => {
    it('has all type constants', () => {
      expect(WatermarkType.TEXT).toBe('text');
      expect(WatermarkType.IMAGE).toBe('image');
      expect(WatermarkType.LOGO).toBe('logo');
    });
  });

  describe('WatermarkPresets', () => {
    it('has discreet preset', () => {
      expect(WatermarkPresets.discreet).toHaveProperty('opacity');
      expect(WatermarkPresets.discreet).toHaveProperty('position');
    });

    it('has bold preset', () => {
      expect(WatermarkPresets.bold).toHaveProperty('opacity');
      expect(WatermarkPresets.bold).toHaveProperty('rotation');
    });

    it('has tiled preset', () => {
      expect(WatermarkPresets.tiled).toHaveProperty('position');
      expect(WatermarkPresets.tiled.position).toBe(WatermarkPosition.TILE);
    });

    it('has professional preset', () => {
      expect(WatermarkPresets.professional).toHaveProperty('opacity');
      expect(WatermarkPresets.professional).toHaveProperty('scale');
    });

    it('has copyright preset', () => {
      expect(WatermarkPresets.copyright).toHaveProperty('fontSize');
      expect(WatermarkPresets.copyright).toHaveProperty('position');
    });
  });
});
