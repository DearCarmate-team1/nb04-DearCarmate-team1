import fs from 'fs';
import path from 'path';
import { BASE_URL } from '../configs/constants.js';

const BASE_UPLOAD_DIR = path.resolve('uploads');

/**
 * 디렉토리가 없으면 생성
 */
function ensureDirExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 파일명 생성 (원본명-타임스탬프.확장자)
 */
function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  return `${base}-${Date.now()}${ext}`;
}

/**
 * Buffer를 로컬 디스크에 저장하고 절대 URL 반환
 * @param buffer - 파일 버퍼
 * @param originalName - 원본 파일명
 * @param subDir - uploads 하위 디렉토리 ('images' | 'documents')
 * @returns 백엔드 서버 절대 URL (예: http://localhost:3001/uploads/images/xxx.jpg)
 */
export function saveBufferToLocal(
  buffer: Buffer,
  originalName: string,
  subDir: 'images' | 'documents'
): string {
  // 1. 디렉토리 생성
  const uploadPath = path.join(BASE_UPLOAD_DIR, subDir);
  ensureDirExists(uploadPath);

  // 2. 파일명 생성
  const fileName = generateFileName(originalName);
  const filePath = path.join(uploadPath, fileName);

  // 3. 버퍼를 디스크에 저장
  fs.writeFileSync(filePath, buffer);

  // 4. 웹 URL 생성 (/uploads/images/xxx.jpg)
  const webPath = `/uploads/${subDir}/${fileName}`;

  // 5. 절대 URL 반환 (프론트엔드가 다른 포트에서 실행)
  return `${BASE_URL}${webPath}`;
}
