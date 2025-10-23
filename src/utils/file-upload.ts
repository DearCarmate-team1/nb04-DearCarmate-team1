import fs from 'fs';
import path from 'path';
import { BASE_URL } from '../configs/constants.js';
import { generateSafeFileName } from '../configs/multer.js';

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
 * @param originalName - 원본 파일명 (한글 파일명 지원)
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

  // 2. 한글 파일명 안전하게 처리
  const fileName = generateSafeFileName(originalName);
  const filePath = path.join(uploadPath, fileName);

  // 3. 버퍼를 디스크에 저장
  fs.writeFileSync(filePath, buffer);

  // 4. 웹 URL 생성 (/uploads/images/xxx.jpg)
  const webPath = `/uploads/${subDir}/${fileName}`;

  // 5. 절대 URL 반환 (프론트엔드가 다른 포트에서 실행)
  return `${BASE_URL}${webPath}`;
}

/**
 * 로컬 파일 삭제 (클린업용)
 * @param fileUrl - 파일 URL (BASE_URL 포함)
 */
export function deleteLocalFile(fileUrl: string): void {
  try {
    // URL에서 파일 경로 추출
    const urlPath = new URL(fileUrl).pathname;
    const filePath = path.join(process.cwd(), urlPath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('파일 삭제 실패:', error);
  }
}
