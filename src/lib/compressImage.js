/**
 * Compresses an image based on specified configurations.
 *
 * @module compressImage
 * @typedef {Object} IMAGE_CONFIG - Configuration for allowed image types and error messages.
 * @property {string[]} allowedTypes - Array of allowed image types.
 * @property {Object} errorMessages - Object containing error messages for invalid types.
 */
import { IMAGE_CONFIG } from './imageConfig';

/**
 * Function to compress an image.
 * @param {File} image - The image file to compress.
 * @returns {Promise<string>} - A promise that resolves to the compressed image URL.
 */
const compressImage = async (image) => {
    try {
        if (!IMAGE_CONFIG.allowedTypes.includes(image.type)) {
            throw new Error(IMAGE_CONFIG.errorMessages.invalidType);
        }
        // Image compression logic goes here...
        const compressedImageUrl = ''; // Assume this is the result of compression
        return compressedImageUrl;
    } catch (error) {
        return Promise.reject(new Error(`Image compression failed: ${error.message}`));
    }
};

export default compressImage;