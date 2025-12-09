import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { resizeImage, getCachedFilename } from './utils/imageProcessor';

dotenv.config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 8000;

// Use configurable directories so built app can point to src assets without copying
const imagesDir =
  process.env.IMAGES_DIR || path.join(process.cwd(), 'src', 'images');
const cacheDir =
  process.env.CACHE_DIR || path.join(process.cwd(), 'src', 'cache');

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

    const cachedName = getCachedFilename(filename, width, height);
    const cachedPath = path.join(cacheDir, cachedName);

    // If cached file exists
    if (fs.existsSync(cachedPath)) {
      return res.sendFile(cachedPath);
    }

    // Resize and cache using utility function
    await resizeImage(inputPath, cachedPath, width, height);

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
