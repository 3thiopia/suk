/**
 * Image processing, compression, and validation utilities
 */

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  size: number;
  originalSize: number;
  width: number;
  height: number;
  format: string;
}

export interface ImageProcessOptions {
  maxDimension?: number; // Maximum width or height in pixels (default: 1600)
  quality?: number; // JPEG/WebP quality 0.0 - 1.0 (default: 0.85)
  maxSizeBytes?: number; // Maximum file size allowed before compression check (default: 10MB)
}

const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function validateImageFile(file: File, maxSizeBytes = 10 * 1024 * 1024): string | null {
  if (!file) return 'No file selected.';

  // Check format
  const isTypeSupported =
    SUPPORTED_FORMATS.includes(file.type.toLowerCase()) ||
    /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);

  if (!isTypeSupported) {
    return `Unsupported file format (${file.type || file.name}). Please select a JPG, PNG, WEBP, or SVG image.`;
  }

  // Check initial file size
  if (file.size > maxSizeBytes) {
    return `File size exceeds the ${formatBytes(maxSizeBytes)} limit. Current size: ${formatBytes(file.size)}.`;
  }

  return null;
}

export async function processImageFile(
  file: File,
  options: ImageProcessOptions = {}
): Promise<ProcessedImage> {
  const { maxDimension = 1000, quality = 0.78, maxSizeBytes = 10 * 1024 * 1024 } = options;

  const validationError = validateImageFile(file, maxSizeBytes);
  if (validationError) {
    throw new Error(validationError);
  }

  // Handle SVG files directly as Data URLs
  if (file.type.includes('svg') || file.name.endsWith('.svg')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve({
          dataUrl: result,
          name: file.name,
          size: file.size,
          originalSize: file.size,
          width: 800,
          height: 800,
          format: 'svg',
        });
      };
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
    });
  }

  // Handle standard raster images with Canvas compression & resize
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to initialize 2D canvas context.'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized data URL
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputFormat, quality);

        // Estimate size from Base64 string
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const estimatedBytes = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          name: file.name,
          size: estimatedBytes,
          originalSize: file.size,
          width,
          height,
          format: outputFormat.split('/')[1],
        });
      };

      img.onerror = () => reject(new Error('Invalid image content. File may be corrupted.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
