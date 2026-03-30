import { ALLOWED_TYPES, COMPRESSION_QUALITY, MAX_WIDTH } from './imageConfig.js';

/**
 * Compress and resize an image file using Canvas API.
 * Returns null if the file type is not allowed.
 * @param {File} file - Original image file
 * @param {number} maxWidth - Max width in pixels (default 1200)
 * @param {number} quality - JPEG quality 0-1 (default 0.82)
 * @returns {Promise<File|null>} Compressed file or null if invalid type
 */
export function compressImage(file, maxWidth = MAX_WIDTH, quality = COMPRESSION_QUALITY) {
  return new Promise((resolve) => {
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) { resolve(null); return; }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(null); return; }
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
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}
