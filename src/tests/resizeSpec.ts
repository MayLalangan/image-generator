import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../index';

describe('GET /resize', () => {
  const cacheDir = path.join(__dirname, '..', 'cache');
  const cachedPath = path.join(cacheDir, 'test_100x100.jpg');

  beforeAll(() => {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (fs.existsSync(cachedPath)) {
      fs.unlinkSync(cachedPath);
    }
  });

  // Ensure the original image is available to the compiled dist runtime
  beforeAll(() => {
    const srcImage = path.join(__dirname, '..', '..', 'src', 'images', 'test.jpg');
    const distImagesDir = path.join(__dirname, '..', 'images');
    const distImage = path.join(distImagesDir, 'test.jpg');
    if (!fs.existsSync(distImagesDir)) {
      fs.mkdirSync(distImagesDir, { recursive: true });
    }
    if (!fs.existsSync(distImage) && fs.existsSync(srcImage)) {
      fs.copyFileSync(srcImage, distImage);
    }
  });

  it('resizes test.jpg to 100x100 and caches the result', async () => {
    const res = await request(app)
      .get('/resize')
      .query({ filename: 'test.jpg', width: '100', height: '100' })
      .expect(200);

    expect(res.headers['content-type']).toMatch(/image\//);
    expect(fs.existsSync(cachedPath)).toBeTrue();
    const stats = fs.statSync(cachedPath);
    expect(stats.size).toBeGreaterThan(0);
  }, 20000);
});
