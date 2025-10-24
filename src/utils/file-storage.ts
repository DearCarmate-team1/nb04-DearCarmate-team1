import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '../configs/cloudinary-config.js';
import { BadRequestError, InternalServerError } from '../configs/custom-error.js';
import { NODE_ENV } from '../configs/constants.js';
import { decodeFileName, generateSafeFileNameFromDecoded } from '../configs/multer.js';
import { saveBufferToLocal } from './file-upload.js';

const isDevelopment = NODE_ENV === 'development';

/**
 * 파일 업로드 옵션
 */
export type FileUploadOptions = {
  /** Cloudinary resource type: 'image' (이미지) | 'raw' (문서) */
  resourceType: 'image' | 'raw';
  /** Cloudinary folder path (예: 'dear-carmate/images') */
  folder: string;
  /** Local subdirectory (예: 'images' | 'documents') */
  subDir: 'images' | 'documents';
  /** Cloudinary public_id에서 확장자 제거 여부 (이미지: true, 문서: false) */
  removeExtension?: boolean;
};

/**
 * 통합 파일 업로드 함수 (환경별 분기)
 * - 개발 환경: Buffer → 로컬 저장 → 절대 URL 반환
 * - 프로덕션: Buffer → Cloudinary 업로드 → HTTPS URL 반환
 *
 * @param file - Multer 파일 객체 (buffer 포함)
 * @param options - 업로드 옵션
 * @returns 업로드된 파일의 URL
 */
export async function uploadFile(
  file: Express.Multer.File | undefined,
  options: FileUploadOptions
): Promise<string> {
  if (!file || !file.buffer) {
    throw new BadRequestError('업로드할 파일이 없습니다');
  }

  // 한글 파일명 디코딩
  const fileName = decodeFileName(file.originalname);

  // 개발 환경: 로컬 디스크에 저장
  if (isDevelopment) {
    return saveBufferToLocal(file.buffer, fileName, options.subDir);
  }

  // 프로덕션: Cloudinary 업로드
  return uploadToCloudinary(file.buffer, fileName, options);
}

/**
 * Cloudinary 업로드 헬퍼 함수
 * @param buffer - 파일 버퍼
 * @param fileName - 디코딩된 파일명
 * @param options - 업로드 옵션
 * @returns Cloudinary secure_url
 */
async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  options: FileUploadOptions
): Promise<string> {
  // 타임스탬프 + 안전한 파일명 생성
  const safeFileName = generateSafeFileNameFromDecoded(fileName);

  // public_id 생성 (옵션에 따라 확장자 제거)
  const publicId = options.removeExtension
    ? safeFileName.replace(/\.[^.]+$/, '') // 확장자 제거 (이미지)
    : safeFileName; // 확장자 유지 (문서)

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resourceType,
        folder: options.folder,
        public_id: publicId,
        use_filename: true,
        unique_filename: false,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(
            new InternalServerError(`${options.resourceType} 업로드 중 오류가 발생했습니다`)
          );
        }
        if (!result || !result.secure_url) {
          return reject(new InternalServerError(`${options.resourceType} 업로드에 실패했습니다`));
        }
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}
