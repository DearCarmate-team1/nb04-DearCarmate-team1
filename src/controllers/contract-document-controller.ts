import { Request, Response } from 'express';
import contractDocumentService from '../services/contract-document-service';
import contractService from '../services/contract-service.js';
import path from 'path';
import jwt from 'jsonwebtoken';
import { NODE_ENV, DOWNLOAD_TOKEN_SECRET } from '../configs/constants.js';
import { BadRequestError, UnauthorizedError } from '../configs/custom-error.js';

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

  // 토큰 기반 계약서 다운로드 (이메일 링크용)
  async downloadWithToken(req: Request, res: Response): Promise<void> {
    const { token, docId } = req.query;

    if (!token || typeof token !== 'string') {
      throw new BadRequestError('다운로드 토큰이 필요합니다.');
    }

    try {
      // 토큰 검증
      const decoded = jwt.verify(token, DOWNLOAD_TOKEN_SECRET) as {
        contractId: number;
        customerId: number;
        documentIds: number[];
      };

      const { documentIds } = decoded;

      if (!documentIds || documentIds.length === 0) {
        throw new BadRequestError('유효하지 않은 토큰입니다.');
      }

      // docId가 제공된 경우 해당 문서만, 아니면 첫 번째 문서
      let documentId: number;
      if (docId && typeof docId === 'string') {
        documentId = Number(docId);
        // 토큰에 포함된 문서인지 확인
        if (!documentIds.includes(documentId)) {
          throw new UnauthorizedError('접근 권한이 없는 문서입니다.');
        }
      } else {
        documentId = documentIds[0]!;
      }

      const file = await contractDocumentService.download(documentId);
      const isCloudinaryUrl = file.filePath.startsWith('https://res.cloudinary.com');

      // Cloudinary URL로 리다이렉트
      if (NODE_ENV !== 'development' || isCloudinaryUrl) {
        res.redirect(file.filePath);
        return;
      }

      // 로컬 파일 전송
      const encodedFileName = encodeURIComponent(file.fileName);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
      res.setHeader('Content-Type', file.mimeType);

      const url = new URL(file.filePath);
      const decodedPathname = decodeURIComponent(url.pathname);
      const absolutePath = path.resolve(process.cwd() + decodedPathname);

      res.sendFile(absolutePath);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('유효하지 않거나 만료된 토큰입니다.');
      }
      throw err;
    }
  },

  // 인증 필요한 계약서 다운로드 (기존)
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
