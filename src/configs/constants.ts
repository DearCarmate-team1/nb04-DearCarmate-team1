function getEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`환경 변수 ${name}이(가) 설정되지 않았습니다.`);
  }
  return value;
}

export const ACCESS_TOKEN_SECRET = getEnvVar('ACCESS_TOKEN_SECRET');
export const REFRESH_TOKEN_SECRET = getEnvVar('REFRESH_TOKEN_SECRET');
export const ACCESS_TOKEN_EXPIRES_IN = getEnvVar('ACCESS_TOKEN_EXPIRES_IN');
export const REFRESH_TOKEN_EXPIRES_IN = getEnvVar('REFRESH_TOKEN_EXPIRES_IN');
export const CLOUDINARY_CLOUD_NAME = getEnvVar('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = getEnvVar('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = getEnvVar('CLOUDINARY_API_SECRET');