/**
 * Compress and resize an image file using Canvas API.
 * @param {File} file - Original image file
 * @param {number} maxWidth - Max width in pixels (default 1200)
 * @param {number} quality - JPEG quality 0-1 (default 0.82)
 * @returns {Promise<File>} Compressed file
 */
export function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    // If already small enough, return as-is
    if (file.size < 300 * 1024) { resolve(file); return; }

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
          if (!blob) { resolve(file); return; }
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
