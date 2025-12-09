import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 8000;

// Use configurable directories; default to __dirname so compiled `dist` uses `dist/images` and `dist/cache`.
// Allow overriding with IMAGES_DIR/CACHE_DIR (useful for pointing to `src/images` when running compiled code).
const imagesDir = process.env.IMAGES_DIR || path.join(__dirname, 'images');
const cacheDir = process.env.CACHE_DIR || path.join(__dirname, 'cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/resize', async (req: Request, res: Response) => {
  try {
    const filenameRaw = req.query.filename;
    const widthRaw = req.query.width;
    const heightRaw = req.query.height;

    if (!filenameRaw || typeof filenameRaw !== 'string') {
      return res.status(400).json({ error: 'Missing filename parameter.' });
    }
    if (!widthRaw) {
      return res.status(400).json({ error: 'Missing width parameter.' });
    }
    if (!heightRaw) {
      return res.status(400).json({ error: 'Missing height parameter.' });
    }

    // sanitize filename to avoid path traversal
    const filename = path.basename(filenameRaw);

    const width = Number(widthRaw);
    const height = Number(heightRaw);
    if (!Number.isInteger(width) || width <= 0 || width > 5000) {
      return res.status(400).json({ error: 'Invalid width parameter.' });
    }
    if (!Number.isInteger(height) || height <= 0 || height > 5000) {
      return res.status(400).json({ error: 'Invalid height parameter.' });
    }

    const inputPath = path.join(imagesDir, filename);

    // Check if original image exists
    if (!fs.existsSync(inputPath)) {
      console.warn(`Requested image not found: ${inputPath}`);
      return res.status(404).json({ error: 'Image file not found' });
    }

    const parsed = path.parse(filename);
    const cachedName = `${parsed.name}_${width}x${height}${parsed.ext}`;
    const cachedPath = path.join(cacheDir, cachedName);

    // If cached file exists
    if (fs.existsSync(cachedPath)) {
      return res.sendFile(cachedPath);
    }

    // Resize and cache
    await sharp(inputPath).resize(width, height).toFile(cachedPath);

    return res.sendFile(cachedPath);
  } catch (err) {
    console.error('Error in /resize:', err);
    return res.status(500).json({ error: 'Image processing failed' });
  }
});

// Export app for testing; start server only when run directly
export default app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}
