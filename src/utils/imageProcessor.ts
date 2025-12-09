import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Resizes an image to specified dimensions and saves it to the output path
 * @param inputPath - Absolute path to the source image
 * @param outputPath - Absolute path where resized image will be saved
 * @param width - Target width in pixels
 * @param height - Target height in pixels
 * @returns Promise that resolves when image is processed and saved
 * @throws Error if image processing fails
 */
export async function resizeImage(
  inputPath: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input image not found: ${inputPath}`);
  }

  if (width <= 0 || height <= 0) {
    throw new Error('Width and height must be positive numbers');
  }

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error('Width and height must be integers');
  }

  await sharp(inputPath).resize(width, height).toFile(outputPath);
}

/**
 * Generates a cache filename for a resized image
 * @param originalFilename - Original image filename
 * @param width - Target width
 * @param height - Target height
 * @returns Cache filename in format: name_widthxheight.ext
 */
export function getCachedFilename(
  originalFilename: string,
  width: number,
  height: number
): string {
  const parsed = path.parse(originalFilename);
  return `${parsed.name}_${width}x${height}${parsed.ext}`;
}
