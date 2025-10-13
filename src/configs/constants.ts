import dotenv from 'dotenv';

dotenv.config();

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`환경 변수 ${name}이(가) 설정되지 않았습니다.`);
  }
  return value;
}

export const ACCESS_TOKEN_SECRET = getEnvVar('ACCESS_TOKEN_SECRET');
export const REFRESH_TOKEN_SECRET = getEnvVar('REFRESH_TOKEN_SECRET');
