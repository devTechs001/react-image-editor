const sharp = require('sharp');
const imageProcessor = require('../../../../backend/src/services/image/processor');

describe('Image Processor', () => {
  let testImageBuffer;

  beforeAll(async () => {
    // Create a test image
    testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toBuffer();
  });

  describe('resize', () => {
    it('should resize image to specified dimensions', async () => {
      const result = await imageProcessor.resize({
        buffer: testImageBuffer,
        width: 50,
        height: 50
      });

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.width).toBe(50);
      expect(metadata.height).toBe(50);
    });

    it('should maintain aspect ratio with fit: inside', async () => {
      const result = await imageProcessor.resize({
        buffer: testImageBuffer,
        width: 50,
        height: 30,
        fit: 'inside'
      });

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.width).toBeLessThanOrEqual(50);
      expect(metadata.height).toBeLessThanOrEqual(30);
    });
  });

  describe('compress', () => {
    it('should compress image', async () => {
      const result = await imageProcessor.compress({
        buffer: testImageBuffer,
        quality: 50
      });

      expect(result.buffer.length).toBeLessThan(testImageBuffer.length);
    });
  });

  describe('convert', () => {
    it('should convert PNG to JPEG', async () => {
      const result = await imageProcessor.convert({
        buffer: testImageBuffer,
        format: 'jpeg'
      });

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe('jpeg');
    });

    it('should convert to WebP', async () => {
      const result = await imageProcessor.convert({
        buffer: testImageBuffer,
        format: 'webp'
      });

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe('webp');
    });
  });

  describe('crop', () => {
    it('should crop image to specified region', async () => {
      const result = await imageProcessor.crop({
        buffer: testImageBuffer,
        x: 10,
        y: 10,
        width: 50,
        height: 50
      });

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.width).toBe(50);
      expect(metadata.height).toBe(50);
    });
  });

  describe('rotate', () => {
    it('should rotate image 90 degrees', async () => {
      const result = await imageProcessor.rotate({
        buffer: testImageBuffer,
        angle: 90
      });

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
    });
  });

  describe('flip', () => {
    it('should flip image horizontally', async () => {
      const result = await imageProcessor.flip({
        buffer: testImageBuffer,
        direction: 'horizontal'
      });

      expect(result.buffer).toBeDefined();
    });

    it('should flip image vertically', async () => {
      const result = await imageProcessor.flip({
        buffer: testImageBuffer,
        direction: 'vertical'
      });

      expect(result.buffer).toBeDefined();
    });
  });

  describe('getMetadata', () => {
    it('should return image metadata', async () => {
      const metadata = await imageProcessor.getMetadata(testImageBuffer);

      expect(metadata.format).toBe('png');
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
      expect(metadata.channels).toBe(3);
    });
  });
});
