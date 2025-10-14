import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '../configs/cloudinary-config.js';
import { BadRequestError, InternalServerError } from '../configs/custom-error.js';

export async function uploadImage(file: Express.Multer.File | undefined): Promise<string> {
  if (!file) {
    throw new BadRequestError('업로드할 파일이 없습니다');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // 리소스 타입 자동 감지 (확장성 고려)
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