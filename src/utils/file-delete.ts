import fs from 'fs';
import path from 'path';
import cloudinary from '../configs/cloudinary-config.js';
import { NODE_ENV } from '../configs/constants.js';

const isDevelopment = NODE_ENV === 'development';

/**
 * 물리적 파일 삭제 (환경별 분기)
 * @param fileUrl - 파일 URL (로컬 경로 또는 Cloudinary URL)
 * @param resourceType - Cloudinary 리소스 타입 ('image' | 'raw' | 'auto')
 */
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

/**
 * 로컬 파일 삭제
 */
function deleteLocalFile(fileUrl: string): void {
  try {
    // URL에서 파일 경로 추출: http://localhost:3001/uploads/documents/123_file.pdf
    // → /uploads/documents/123_file.pdf
    const relativePath = fileUrl.replace(/^https?:\/\/[^/]+/, '');
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ 로컬 파일 삭제 성공: ${fullPath}`);
    } else {
      console.warn(`⚠️ 파일이 존재하지 않음: ${fullPath}`);
    }
  } catch (error) {
    console.error(`❌ 로컬 파일 삭제 실패: ${fileUrl}`, error);
    // 에러를 throw하지 않음 - 파일 삭제 실패가 트랜잭션을 중단하지 않도록
  }
}

/**
 * Cloudinary 파일 삭제
 */
async function deleteCloudinaryFile(
  fileUrl: string,
  resourceType: 'image' | 'raw' | 'auto'
): Promise<void> {
  try {
    // Cloudinary URL에서 public_id 추출 (resource type에 따라 확장자 처리가 다름)
    const publicId = extractCloudinaryPublicId(fileUrl, resourceType);

    if (publicId) {
      console.log(`🔍 삭제 시도 중 - Public ID: ${publicId}, Type: ${resourceType}`);
      console.log(`🔍 원본 URL: ${fileUrl}`);

      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      console.log(`✅ Cloudinary 파일 삭제 성공: ${publicId}`, result);
    } else {
      console.warn(`⚠️ Public ID 추출 실패: ${fileUrl}`);
    }
  } catch (error) {
    console.error(`❌ Cloudinary 파일 삭제 실패: ${fileUrl}`, error);
    // 에러를 throw하지 않음
  }
}

/**
 * Cloudinary URL에서 public_id 추출
 * 이 함수는 URL에서 경로를 추출하고 URL 디코딩 수행
 */
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
        console.log(`🔍 추출된 Public ID (이미지, 확장자 제거): ${publicId}`);
      } else {
        console.log(`🔍 추출된 Public ID (문서, 확장자 포함): ${publicId}`);
      }

      return publicId;
    }

    return null;
  } catch (error) {
    console.error('❌ Public ID 추출 중 에러:', error);
    return null;
  }
}
