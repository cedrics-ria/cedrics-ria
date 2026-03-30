export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
export const ACCEPT_ATTRIBUTES = 'image/*';
export const MAX_FILE_SIZE = 5242880; // 5MB in bytes
export const COMPRESSION_QUALITY = 0.8;
export const MAX_WIDTH = 1920;
export const ERROR_MESSAGES = {
    INVALID_TYPE: 'Invalid file type!',
    FILE_TOO_LARGE: 'File is too large!',
    LOAD_ERROR: 'Error loading file!'
};