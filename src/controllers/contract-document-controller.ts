import { Request, Response } from 'express';
import contractDocumentService from '../services/contract-document-service';
import contractService from '../services/contract-service.js';
import path from 'path';
import { NODE_ENV } from '../configs/constants.js';
import { BadRequestError } from '../configs/custom-error.js';

export const contractDocumentController = {
  // 계약서 목록 조회 (문서가 1건 이상인 계약 목록)
  async list(req: Request, res: Response): Promise<void> {
    const { page = 1, pageSize = 10, searchBy, keyword } = req.query;
    const result = await contractService.getForDocumentUpload(req.user, {
      page: Number(page),
      pageSize: Number(pageSize),
      searchBy: searchBy as 'contractName' | undefined,
      keyword: keyword as string | undefined,
    });
    res.status(200).json(result);
  },

  // 계약서 업로드 시 계약 목록 조회
  async draftList(req: Request, res: Response): Promise<void> {
    const data = await contractDocumentService.draftList();
    res.status(200).json(data);
  },

  // 계약서 업로드
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new BadRequestError('파일이 필요합니다');
    }

    const documentId = await contractDocumentService.upload(req.file);
    res.status(200).json({ contractDocumentId: documentId });
  },

  // 계약서 다운로드
  async download(req: Request, res: Response): Promise<void> {
    const { contractDocumentId } = req.params;
    const file = await contractDocumentService.download(Number(contractDocumentId));

    const isCloudinaryUrl = file.filePath.startsWith('https://res.cloudinary.com');

    // 프로덕션: Cloudinary URL로 리다이렉트
    if (NODE_ENV !== 'development' || isCloudinaryUrl) {
      res.redirect(file.filePath);
      return;
    }

    // 개발 환경: 로컬 파일 전송
    // 한글 파일명 인코딩 (RFC 5987)
    const encodedFileName = encodeURIComponent(file.fileName);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodedFileName}`
    );
    res.setHeader('Content-Type', file.mimeType);

    // URL에서 로컬 경로 추출 후 디코딩 (한글 파일명 지원)
    const url = new URL(file.filePath);
    const decodedPathname = decodeURIComponent(url.pathname);
    const absolutePath = path.resolve(process.cwd() + decodedPathname);

    res.sendFile(absolutePath);
  },
};
