'use strict';

const imageConfig = {
    maxUploadSize: 5 * 1024 * 1024, // 5 MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/gif'],
    defaultUrl: 'http://example.com/default-image.png',
    // Add more configuration options as needed
};

module.exports = imageConfig;
