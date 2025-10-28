function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`환경 변수 ${name}이(가) 설정되지 않았습니다.`);
  }
  return value;
}

export const PORT = getEnvVar('PORT');
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const BASE_URL = getEnvVar('BASE_URL');

export const CORS_ORIGINS = getEnvVar('CORS_ORIGINS')
  .split(',')
  .map((origin) => origin.trim());

export const ACCESS_TOKEN_SECRET = getEnvVar('ACCESS_TOKEN_SECRET');
export const REFRESH_TOKEN_SECRET = getEnvVar('REFRESH_TOKEN_SECRET');
export const ACCESS_TOKEN_EXPIRES_IN = getEnvVar('ACCESS_TOKEN_EXPIRES_IN');
export const REFRESH_TOKEN_EXPIRES_IN = getEnvVar('REFRESH_TOKEN_EXPIRES_IN');

export const CLOUDINARY_CLOUD_NAME = getEnvVar('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = getEnvVar('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = getEnvVar('CLOUDINARY_API_SECRET');

export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export const SENDGRID_API_KEY = getEnvVar('SENDGRID_API_KEY');
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Dear Carmate <noreply@dearcarmate.com>';

export const DOWNLOAD_TOKEN_SECRET = process.env.DOWNLOAD_TOKEN_SECRET || 'your-download-token-secret-key';
