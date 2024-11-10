export const config = {
  port: process.env.PORT || 3001,
  uploadDir: '/app/uploads',
  convertedDir: '/app/converted',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFormats: ['epub'],
  targetFormats: ['mobi', 'azw3']
};