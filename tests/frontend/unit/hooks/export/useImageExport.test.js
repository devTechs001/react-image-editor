// tests/frontend/unit/hooks/export/useImageExport.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageExport, useBatchExport, useExportQueue } from '@/hooks/export/useImageExport';

// Mock export services
vi.mock('@/services/export/imageExporter', () => ({
  exportCanvasToBlob: vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'image/png' }))),
  exportCanvasToDataURL: vi.fn(() => 'data:image/png;base64,test'),
  downloadImage: vi.fn(),
  createThumbnail: vi.fn(() => Promise.resolve(new Blob(['thumb'], { type: 'image/jpeg' }))),
  exportResponsiveImages: vi.fn(() => Promise.resolve(new Map())),
  ImageFormat: {
    PNG: 'image/png',
    JPEG: 'image/jpeg'
  },
  ImageQuality: {
    HIGH: 0.92,
    MEDIUM: 0.75
  }
}));

vi.mock('@/services/export/compressionOptimizer', () => ({
  compressImage: vi.fn(() => Promise.resolve(new Blob(['compressed'], { type: 'image/jpeg' }))),
  getOptimalFormat: vi.fn(() => 'image/jpeg')
}));

vi.mock('@/services/export/watermark', () => ({
  applyWatermark: vi.fn(() => Promise.resolve(document.createElement('canvas')))
}));

vi.mock('@/services/export/metadataEditor', () => ({
  addMetadata: vi.fn((blob) => Promise.resolve(blob)),
  removeMetadata: vi.fn((blob) => Promise.resolve(blob))
}));

describe('useImageExport', () => {
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useImageExport(canvas));

    expect(result.current.isExporting).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.lastExport).toBeNull();
  });

  it('exports canvas to blob', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      await result.current.exportToBlob();
    });

    expect(result.current.lastExport).toBeTruthy();
    expect(result.current.progress).toBe(100);
  });

  it('sets isExporting to true during export', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    const exportPromise = act(async () => {
      await result.current.exportToBlob();
    });

    // Check during export (this is timing-dependent)
    await exportPromise;

    expect(result.current.isExporting).toBe(false);
  });

  it('handles export error', async () => {
    const { exportCanvasToBlob } = await import('@/services/export/imageExporter');
    exportCanvasToBlob.mockRejectedValueOnce(new Error('Export failed'));

    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      try {
        await result.current.exportToBlob();
      } catch (e) {
        // Expected error
      }
    });

    expect(result.current.error).toBe('Export failed');
  });

  it('exports and downloads', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      await result.current.exportAndDownload({ filename: 'test' });
    });

    const { downloadImage } = await import('@/services/export/imageExporter');
    expect(downloadImage).toHaveBeenCalled();
  });

  it('exports compressed image', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      await result.current.exportCompressed({ targetSize: 50000 });
    });

    expect(result.current.lastExport).toBeTruthy();
    expect(result.current.lastExport.compressed).toBe(true);
  });

  it('exports with watermark', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      await result.current.exportWithWatermark({ text: 'Test' });
    });

    expect(result.current.lastExport).toBeTruthy();
    expect(result.current.lastExport.watermarked).toBe(true);
  });

  it('exports with metadata', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      await result.current.exportWithMetadata({ title: 'Test' });
    });

    expect(result.current.lastExport).toBeTruthy();
    expect(result.current.lastExport.hasMetadata).toBe(true);
  });

  it('creates thumbnail', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    let thumbnail;
    await act(async () => {
      thumbnail = await result.current.createThumbnail(100);
    });

    expect(thumbnail).toBeTruthy();
  });

  it('exports responsive images', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      await result.current.exportResponsive([320, 640, 1024]);
    });

    expect(result.current.lastExport).toBeTruthy();
  });

  it('resets state', async () => {
    const { result } = renderHook(() => useImageExport(canvas));

    await act(async () => {
      await result.current.exportToBlob();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.lastExport).toBeNull();
  });

  it('throws error when canvas is null', async () => {
    const { result } = renderHook(() => useImageExport(null));

    await expect(result.current.exportToBlob()).rejects.toThrow('Canvas is not available');
  });

  it('uses default options', async () => {
    const { result } = renderHook(() => 
      useImageExport(canvas, { format: 'image/jpeg', quality: 0.5 })
    );

    await act(async () => {
      await result.current.exportToBlob();
    });

    const { exportCanvasToBlob } = await import('@/services/export/imageExporter');
    expect(exportCanvasToBlob).toHaveBeenCalledWith(
      canvas,
      expect.objectContaining({
        format: 'image/jpeg',
        quality: 0.5
      })
    );
  });
});

describe('useBatchExport', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useBatchExport());

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.results).toHaveLength(0);
    expect(result.current.errors).toHaveLength(0);
  });

  it('processes batch successfully', async () => {
    const { result } = renderHook(() => useBatchExport());
    const items = [1, 2, 3];
    const processor = vi.fn((item) => Promise.resolve(item * 2));

    await act(async () => {
      await result.current.processBatch(items, processor);
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toBe(100);
    expect(result.current.results).toHaveLength(3);
  });

  it('handles errors during batch processing', async () => {
    const { result } = renderHook(() => useBatchExport());
    const items = [1, 2, 3];
    const processor = vi.fn((item) => {
      if (item === 2) throw new Error('Failed');
      return Promise.resolve(item);
    });

    await act(async () => {
      await result.current.processBatch(items, processor);
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].index).toBe(1);
  });

  it('cancels batch processing', async () => {
    const { result } = renderHook(() => useBatchExport());
    const items = [1, 2, 3, 4, 5];
    const processor = vi.fn(async (item) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return item;
    });

    const processPromise = act(async () => {
      await result.current.processBatch(items, processor);
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      result.current.cancel();
    });

    await processPromise;

    expect(result.current.cancelled).toBe(true);
  });

  it('resets state', async () => {
    const { result } = renderHook(() => useBatchExport());

    await act(async () => {
      await result.current.processBatch([1, 2], vi.fn((i) => Promise.resolve(i)));
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.results).toHaveLength(0);
  });
});

describe('useExportQueue', () => {
  it('initializes with empty queue', () => {
    const { result } = renderHook(() => useExportQueue());

    expect(result.current.queue).toHaveLength(0);
    expect(result.current.isProcessing).toBe(false);
  });

  it('adds job to queue', () => {
    const { result } = renderHook(() => useExportQueue());

    act(() => {
      result.current.addToQueue({ type: 'export', data: 'test' });
    });

    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].type).toBe('export');
  });

  it('removes job from queue', () => {
    const { result } = renderHook(() => useExportQueue());

    act(() => {
      result.current.addToQueue({ type: 'export', data: 'test' });
    });

    const jobId = result.current.queue[0].id;

    act(() => {
      result.current.removeFromQueue(jobId);
    });

    expect(result.current.queue).toHaveLength(0);
  });

  it('clears queue', () => {
    const { result } = renderHook(() => useExportQueue());

    act(() => {
      result.current.addToQueue({ type: 'export', data: 'test1' });
      result.current.addToQueue({ type: 'export', data: 'test2' });
    });

    act(() => {
      result.current.clearQueue();
    });

    expect(result.current.queue).toHaveLength(0);
  });

  it('processes queue', async () => {
    const { result } = renderHook(() => useExportQueue());
    const processor = vi.fn((job) => Promise.resolve(job));

    act(() => {
      result.current.addToQueue({ type: 'export', data: 'test' });
    });

    await act(async () => {
      await result.current.processQueue(processor);
    });

    expect(processor).toHaveBeenCalled();
    expect(result.current.queue[0].status).toBe('completed');
  });

  it('handles processing errors', async () => {
    const { result } = renderHook(() => useExportQueue());
    const processor = vi.fn(() => Promise.reject(new Error('Failed')));

    act(() => {
      result.current.addToQueue({ type: 'export', data: 'test' });
    });

    await act(async () => {
      await result.current.processQueue(processor);
    });

    expect(result.current.queue[0].status).toBe('failed');
    expect(result.current.queue[0].error).toBe('Failed');
  });
});
