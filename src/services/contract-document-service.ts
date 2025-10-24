import { decodeFileName } from '../configs/multer.js';
import { ContractDocumentRepository } from '../repositories/contract-document-repository.js';
import { uploadFile } from '../utils/file-storage.js';

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
    // 한글 파일명 디코딩
    const fileName = decodeFileName(file.originalname);

    // 통합 업로드 처리
    const url = await uploadFile(file, {
      resourceType: 'raw', // 문서는 'raw' 타입 (확장자 포함)
      folder: 'dear-carmate/documents',
      subDir: 'documents',
      removeExtension: false, // 문서는 확장자 유지
    });

    // DB에 메타데이터 저장
    return await this.repository.saveFile({
      url,
      fileName,
      size: file.size,
      mimeType: file.mimetype,
    });
  }

  async download(id: number) {
    const file = await this.repository.findById(id);
    if (!file) throw new Error('파일을 찾을 수 없습니다');
    return file;
  }
}
