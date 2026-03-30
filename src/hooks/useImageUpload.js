import { useState } from 'react';
import { compressImage } from '../lib/compressImage';
import { IMAGE_CONFIG } from '../lib/imageConfig';

export function useImageUpload() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const validateFile = (file, maxSizeMB = 8) => {
        if (!file) {
            setError(IMAGE_CONFIG.ERROR_MESSAGES.NO_FILE);
            return false;
        }
        if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
            setError(IMAGE_CONFIG.ERROR_MESSAGES.INVALID_TYPE);
            return false;
        }
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            setError(IMAGE_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE(maxSizeMB));
            return false;
        }
        setError(null);
        return true;
    };

    const processImage = async (file, options = {}) => {
        const maxSizeMB = options.maxSizeMB || 8;
        if (!validateFile(file, maxSizeMB)) {
            return null;
        }

        setUploading(true);
        try {
            const compressed = await compressImage(file, {
                maxWidth: options.maxWidth || IMAGE_CONFIG.COMPRESSION.maxWidth,
                quality: options.quality || IMAGE_CONFIG.COMPRESSION.quality
            });
            setError(null);
            return compressed;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploading, error, processImage, validateFile, clearError: () => setError(null) };
}