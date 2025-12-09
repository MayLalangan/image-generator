import fs from 'fs';
import path from 'path';
import { resizeImage, getCachedFilename } from '../utils/imageProcessor';

describe('Image Processing Utility', () => {
  const testImagePath = path.join(__dirname, '..', 'images', 'test.jpg');
  const tempDir = path.join(__dirname, '..', 'cache', 'test-temp');
  const outputPath = path.join(tempDir, 'output.jpg');

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
  });

  describe('resizeImage', () => {
    it('should resize an image with valid inputs', async () => {
      await resizeImage(testImagePath, outputPath, 100, 100);

      expect(fs.existsSync(outputPath)).toBeTrue();
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    }, 15000);

    it('should throw error when input file does not exist', async () => {
      const fakePath = path.join(__dirname, 'nonexistent.jpg');
      await expectAsync(
        resizeImage(fakePath, outputPath, 100, 100)
      ).toBeRejectedWithError(/Input image not found/);
    });

    it('should throw error with invalid width (zero)', async () => {
      await expectAsync(
        resizeImage(testImagePath, outputPath, 0, 100)
      ).toBeRejectedWithError(/Width and height must be positive/);
    });

    it('should throw error with invalid height (negative)', async () => {
      await expectAsync(
        resizeImage(testImagePath, outputPath, 100, -50)
      ).toBeRejectedWithError(/Width and height must be positive/);
    });

    it('should throw error with non-integer dimensions', async () => {
      await expectAsync(
        resizeImage(testImagePath, outputPath, 100.5, 100)
      ).toBeRejectedWithError(/Width and height must be integers/);
    });
  });

  describe('getCachedFilename', () => {
    it('should generate correct cache filename', () => {
      const result = getCachedFilename('test.jpg', 200, 300);
      expect(result).toBe('test_200x300.jpg');
    });

    it('should handle different file extensions', () => {
      const result = getCachedFilename('image.png', 150, 150);
      expect(result).toBe('image_150x150.png');
    });
  });
});
