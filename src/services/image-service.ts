import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '../configs/cloudinary-config.js';
import { BadRequestError, InternalServerError } from '../configs/custom-error.js';
import { saveBufferToLocal } from '../utils/file-upload.js';
import { NODE_ENV } from 'src/configs/constants.js';

const isDevelopment = NODE_ENV === 'development';

/**
 * 이미지 업로드 처리 (통일된 Buffer 기반)
 * - 개발 환경: Buffer → 로컬 저장 → 절대 URL 반환
 * - 프로덕션: Buffer → Cloudinary 업로드 → HTTPS URL 반환
 */
export async function uploadImage(file: Express.Multer.File | undefined): Promise<string> {
  if (!file || !file.buffer) {
    throw new BadRequestError('업로드할 파일이 없습니다');
  }

  // 개발 환경: 로컬 디스크에 저장
  if (isDevelopment) {
    return saveBufferToLocal(file.buffer, file.originalname, 'images');
  }

  // 프로덕션: Cloudinary 업로드
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'dear-carmate/images',
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(new InternalServerError('이미지 업로드 중 오류가 발생했습니다'));
        }
        if (!result || !result.secure_url) {
          return reject(new InternalServerError('이미지 업로드에 실패했습니다'));
        }
        resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });
}
