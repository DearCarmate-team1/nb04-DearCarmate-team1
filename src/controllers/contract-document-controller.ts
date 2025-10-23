import { Request, Response } from 'express';
import contractDocumentService from '../services/contract-document-service';
import contractService from '../services/contract-service.js';
import path from 'path';
import { URL } from 'url';


export const contractDocumentController = {
  // 계약서 목록 조회 (문서가 1건 이상인 계약 목록)
  async list(req: Request, res: Response) {
    try {
      const { page = 1, pageSize = 10, searchBy, keyword } = req.query;
      const result = await contractService.getForDocumentUpload(req.user, {
        page: Number(page),
        pageSize: Number(pageSize),
        searchBy: searchBy as 'contractName' | undefined,
        keyword: keyword as string | undefined,
      });
      return res.status(200).json(result);
    } catch {
      return res.status(400).json({ message: '잘못된 요청입니다' });
    }
  },

  // 계약서 업로드 시 계약 목록 조회
  async draftList(req: Request, res: Response) {
    try {
      const data = await contractDocumentService.draftList();
      return res.status(200).json(data);
    } catch {
      return res.status(400).json({ message: '잘못된 요청입니다' });
    }
  },

  // 계약서 업로드
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '파일이 필요합니다' });
      }

      const documentId = await contractDocumentService.upload(req.file);
      return res.status(200).json({ contractDocumentId: documentId });
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : '잘못된 요청입니다',
      });
    }
  },

  // 계약서 다운로드
  async download(req: Request, res: Response) {
    try {
      const { contractDocumentId } = req.params;
      const file = await contractDocumentService.download(Number(contractDocumentId));

      // 파일명 인코딩 (한글 지원)
      const encodedFileName = encodeURIComponent(file.fileName);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodedFileName}`
      );
      res.setHeader('Content-Type', file.mimeType);

      let filePath = file.filePath;

      // URL → 로컬 경로 변환
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        const url = new URL(filePath);
        filePath = url.pathname;
      }

      const absolutePath = path.resolve(process.cwd() + filePath);
      return res.sendFile(absolutePath);
    } catch (error) {
      console.error('다운로드 에러:', error);
      return res.status(400).json({
        message: error instanceof Error ? error.message : '잘못된 요청입니다',
      });
    }
  },
};
