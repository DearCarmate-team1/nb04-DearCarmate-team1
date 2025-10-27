import { uploadFile } from '../utils/file-storage.js';

/**
 * 이미지 업로드 처리 (통일된 Buffer 기반)
 * - 개발 환경: Buffer → 로컬 저장 → 절대 URL 반환
 * - 프로덕션: Buffer → Cloudinary 업로드 → HTTPS URL 반환
 *
 * ⚠️ Cloudinary 이미지 타입은 확장자 없이 저장 (전통적 방식)
 * - public_id에서 자동으로 확장자 제거됨
 * - 자유로운 포맷 변환 가능 (jpg→png 등)
 */
export async function uploadImage(file: Express.Multer.File | undefined): Promise<string> {
  return uploadFile(file, {
    resourceType: 'image',
    folder: 'dear-carmate/images',
    subDir: 'images',
    removeExtension: true, // 이미지는 확장자 제거 (포맷 변환 지원)
  });
}
