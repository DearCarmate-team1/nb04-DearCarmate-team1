import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '../configs/cloudinary-config.js';
import { BadRequestError, InternalServerError } from '../configs/custom-error.js';
import { saveBufferToLocal } from '../utils/file-upload.js';
import { NODE_ENV } from '../configs/constants.js';
import { decodeFileName } from '../configs/multer.js';
import { ContractDocumentRepository } from '../repositories/contract-document-repository.js';

const isDevelopment = NODE_ENV === 'development';

export class ContractDocumentService {
  private repository = new ContractDocumentRepository();

  async list(params: { page: number; pageSize: number; searchBy?: string; keyword?: string }) {
    return await this.repository.findAll(params);
  }

  async draftList() {
    return await this.repository.findDrafts();
  }

  /**
   * 문서 업로드 처리 (환경별 분기)
   * - 개발: Buffer → 로컬 저장
   * - 프로덕션: Buffer → Cloudinary
   */
  async upload(file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestError('업로드할 파일이 없습니다');
    }

    // 디버깅: 원본 파일명 확인
    console.log('🔍 Original filename:', file.originalname);
    console.log('🔍 Buffer encoding test:', Buffer.from(file.originalname, 'latin1').toString('utf8'));

    const fileName = decodeFileName(file.originalname);
    console.log('🔍 Decoded filename:', fileName);

    // 환경별 분기 처리
    let url: string;

    if (isDevelopment) {
      // 개발: 로컬 저장
      url = saveBufferToLocal(file.buffer, fileName, 'documents');
    } else {
      // 프로덕션: Cloudinary 업로드
      url = await this.uploadToCloudinary(file.buffer, fileName);
    }

    // DB에 메타데이터 저장
    return await this.repository.saveFile({
      url,
      fileName,
      size: file.size,
      mimeType: file.mimetype,
    });
  }

  /**
   * Cloudinary 업로드 (private 헬퍼 메서드)
   */
  private async uploadToCloudinary(buffer: Buffer, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'dear-carmate/documents',
          public_id: `${Date.now()}_${fileName}`,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            return reject(new InternalServerError('문서 업로드 중 오류가 발생했습니다'));
          }
          if (!result || !result.secure_url) {
            return reject(new InternalServerError('문서 업로드에 실패했습니다'));
          }
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }

  async download(id: number) {
    const file = await this.repository.findById(id);
    if (!file) throw new Error('파일을 찾을 수 없습니다');
    return file;
  }
}
