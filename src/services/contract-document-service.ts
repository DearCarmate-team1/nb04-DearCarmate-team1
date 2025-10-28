import { decodeFileName } from '../configs/multer.js';
import contractDocumentRepository from '../repositories/contract-document-repository.js';
import { uploadFile } from '../utils/file-storage.js';

const contractDocumentService = {
  /** 계약서 목록 조회 */
  async list(params: { page: number; pageSize: number; searchBy?: string; keyword?: string }) {
    return await contractDocumentRepository.findAll(params);
  },

  /** 계약서 업로드용 계약 목록 조회 */
  async draftList(companyId: number) {
    return await contractDocumentRepository.findDrafts(companyId);
  },

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
    return await contractDocumentRepository.saveFile({
      url,
      fileName,
      size: file.size,
      mimeType: file.mimetype,
    });
  },

  /** 계약서 다운로드 */
  async download(id: number) {
    const file = await contractDocumentRepository.findById(id);
    if (!file) throw new Error('파일을 찾을 수 없습니다');
    return file;
  },
};

export default contractDocumentService;
