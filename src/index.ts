import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 8000;

const imagesDir = path.join(__dirname, 'images');
const cacheDir = path.join(__dirname, 'cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/resize', async (req: Request, res: Response) => {
  try {
    const { filename, width, height } = req.query;
    if (!filename) {
      return res.status(400).json({ error: 'Missing filename parameter.' });
    }
    if (!width) {
      return res.status(400).json({ error: 'Missing width parameter.' });
    }
    if (!height) {
      return res.status(400).json({ error: 'Missing height parameter.' });
    }

    // sanitize filename to avoid path traversal
    const safeFilename = path.basename(filename as string);
    const inputPath = path.join(imagesDir, safeFilename);

    // validate width/height
    const w = Number(width);
    const h = Number(height);
    if (!Number.isInteger(w) || w <= 0) {
      return res
        .status(400)
        .json({ error: 'Width must be a positive integer.' });
    }
    if (!Number.isInteger(h) || h <= 0) {
      return res
        .status(400)
        .json({ error: 'Height must be a positive integer.' });
    }
    // optional: limit maximum dimensions to avoid excessive resource usage
    const MAX_DIM = 5000;
    if (w > MAX_DIM || h > MAX_DIM) {
      return res
        .status(400)
        .json({ error: `Width/height must be <= ${MAX_DIM}.` });
    }

    // Check if original image exists
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    const parsed = path.parse(safeFilename);
    const cachedName = `${parsed.name}_${w}x${h}${parsed.ext}`;
    const cachedPath = path.join(cacheDir, cachedName);

    // If cached file exists
    if (fs.existsSync(cachedPath)) {
      return res.sendFile(cachedPath);
    }

    // Resize and cache
    await sharp(inputPath).resize(w, h).toFile(cachedPath);

    return res.sendFile(cachedPath);
  } catch (err) {
    console.error('Image resize error:', err);
    return res.status(500).json({ error: 'Image processing failed' });
  }
});

// export app for testing and start server when run directly
export default app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}
