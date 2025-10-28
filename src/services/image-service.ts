import { uploadFile } from '../utils/file-storage.js';

/** 이미지 업로드 처리 (환경별 분기) */
export async function uploadImage(file: Express.Multer.File | undefined): Promise<string> {
  return uploadFile(file, {
    resourceType: 'image',
    folder: 'dear-carmate/images',
    subDir: 'images',
    removeExtension: true, // 이미지는 확장자 제거 (포맷 변환 지원)
  });
}
