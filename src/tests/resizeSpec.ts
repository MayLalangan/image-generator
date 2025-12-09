import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../index';

describe('GET /resize', () => {
  const cacheDir = path.join(process.cwd(), 'src', 'cache');
  const cachedPath = path.join(cacheDir, 'test_100x100.jpg');

  beforeAll(() => {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (fs.existsSync(cachedPath)) {
      fs.unlinkSync(cachedPath);
    }
  });

  // Ensure the original image is available
  beforeAll(() => {
    const srcImage = path.join(process.cwd(), 'src', 'images', 'test.jpg');
    if (!fs.existsSync(srcImage)) {
      throw new Error('Test image not found: ' + srcImage);
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
