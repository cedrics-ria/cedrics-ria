module.exports = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
  acceptAttributes: 'image/jpeg,image/png,image/gif',
  maxFileSize: 5 * 1024 * 1024, // 5 MB in bytes
  compression: {
    quality: 0.8, // Quality for JPEG compression
    // Other compression settings can be defined here
  },
  errorMessages: {
    invalidType: 'Ungültiger Dateityp. Bitte verwenden Sie JPG, PNG oder GIF.',
    fileTooLarge: 'Die Datei überschreitet die maximal erlaubte Größe von 5 MB.',
    compressionError: 'Fehler bei der Kompression der Datei.',
    default: 'Ein unbekannter Fehler ist aufgetreten.',
  }
};