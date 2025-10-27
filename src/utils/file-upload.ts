import fs from 'fs';
import path from 'path';
import { BASE_URL } from '../configs/constants.js';
import { generateSafeFileNameFromDecoded } from '../configs/multer.js';

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
 * Buffer를 로컬 디스크에 저장하고 절대 URL 반환
 * @param buffer - 파일 버퍼
 * @param decodedFileName - 이미 디코딩된 파일명 (UTF-8)
 * @param subDir - uploads 하위 디렉토리 ('images' | 'documents')
 * @returns 백엔드 서버 절대 URL (예: http://localhost:3001/uploads/images/xxx.jpg)
 */
export function saveBufferToLocal(
  buffer: Buffer,
  decodedFileName: string,
  subDir: 'images' | 'documents'
): string {
  // 1. 디렉토리 생성
  const uploadPath = path.join(BASE_UPLOAD_DIR, subDir);
  ensureDirExists(uploadPath);

  // 2. 한글 파일명 안전하게 처리 (이미 디코딩된 상태)
  const fileName = generateSafeFileNameFromDecoded(decodedFileName);
  const filePath = path.join(uploadPath, fileName);

  // 3. 버퍼를 디스크에 저장
  fs.writeFileSync(filePath, buffer);

  // 4. 웹 URL 생성 (/uploads/images/xxx.jpg)
  const webPath = `/uploads/${subDir}/${fileName}`;

  // 5. 절대 URL 반환 (프론트엔드가 다른 포트에서 실행)
  return `${BASE_URL}${webPath}`;
}
