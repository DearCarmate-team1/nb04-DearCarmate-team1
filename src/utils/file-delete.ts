import fs from 'fs';
import path from 'path';
import cloudinary from '../configs/cloudinary-config.js';
import { NODE_ENV } from '../configs/constants.js';

const isDevelopment = NODE_ENV === 'development';

/** 물리적 파일 삭제 (환경별 분기) */
export async function deletePhysicalFile(
  fileUrl: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<void> {
  if (isDevelopment) {
    // 개발: 로컬 파일 삭제
    deleteLocalFile(fileUrl);
  } else {
    // 프로덕션: Cloudinary 파일 삭제
    await deleteCloudinaryFile(fileUrl, resourceType);
  }
}

/** 로컬 파일 삭제 */
function deleteLocalFile(fileUrl: string): void {
  try {
    // URL에서 파일 경로 추출: http://localhost:3001/uploads/documents/123_file.pdf
    // → /uploads/documents/123_file.pdf
    const relativePath = fileUrl.replace(/^https?:\/\/[^/]+/, '');
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    } else {
      console.warn(`[WARN] File not found: ${fullPath}`);
    }
  } catch (error) {
    console.error(`[ERROR] Local file delete failed: ${fileUrl}`, error);
    // 에러를 throw하지 않음 - 파일 삭제 실패가 트랜잭션을 중단하지 않도록
  }
}

/** Cloudinary 파일 삭제 */
async function deleteCloudinaryFile(
  fileUrl: string,
  resourceType: 'image' | 'raw' | 'auto'
): Promise<void> {
  try {
    const publicId = extractCloudinaryPublicId(fileUrl, resourceType);

    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } else {
      console.warn(`[WARN] Cloudinary public ID extraction failed: ${fileUrl}`);
    }
  } catch (error) {
    console.error(`[ERROR] Cloudinary file delete failed: ${fileUrl}`, error);
  }
}

/** Cloudinary URL에서 public_id 추출 */
function extractCloudinaryPublicId(url: string, resourceType: 'image' | 'raw' | 'auto'): string | null {
  try {
    // /upload/ 이후부터 파일명까지 추출
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match?.[1]) {
      // URL 디코딩: %E1%84%8B... → 영화
      let publicId = decodeURIComponent(match[1]);

      // 이미지 타입은 확장자 제거 (Cloudinary가 자동으로 확장자 제거하므로)
      if (resourceType === 'image') {
        publicId = publicId.replace(/\.[^.]+$/, '');
      }

      return publicId;
    }

    return null;
  } catch (error) {
    console.error('[ERROR] Public ID extraction failed:', error);
    return null;
  }
}
