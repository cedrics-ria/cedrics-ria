import { IMAGE_CONFIG } from './imageConfig';

/**
 * Compress and resize an image file using Canvas API.
 * Returns a promise that resolves to a compressed File or rejects with an error.
 * @param {File} file - Original image file
 * @param {number} maxWidth - Max width in pixels (default from IMAGE_CONFIG)
 * @param {number} quality - JPEG quality 0-1 (default from IMAGE_CONFIG)
 * @returns {Promise<File>} Compressed file
 */
export function compressImage(file, maxWidth = IMAGE_CONFIG.MAX_WIDTH, quality = IMAGE_CONFIG.COMPRESSION_QUALITY) {
  return new Promise((resolve, reject) => {
    // Validate file exists
    if (!file) {
      return reject(new Error('No image file provided.'));
    }

    // Validate file type
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return reject(new Error(IMAGE_CONFIG.ERROR_MESSAGES.INVALID_TYPE));
    }

    // Validate file size
    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      return reject(new Error(IMAGE_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        // Resize if needed
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return reject(new Error('Failed to get canvas context.'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Blob creation failed.'));
            }
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            );
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(new Error(`Compression error: ${error.message}`));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(IMAGE_CONFIG.ERROR_MESSAGES.LOAD_ERROR));
    };

    img.src = objectUrl;
  });
}