import { Request, Response } from 'express';
import { ContractDocumentService } from '../services/contract-document-service';
import contractService from '../services/contract-service.js';

export class ContractDocumentController {
  private service = new ContractDocumentService();

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
    } catch (error) {
      return res.status(400).json({ message: '잘못된 요청입니다' });
    }
  }

  // 계약서 업로드 시 계약 목록 조회
  async draftList(req: Request, res: Response) {
    try {
      const data = await this.service.draftList();
      return res.status(200).json(data);
    } catch {
      return res.status(400).json({ message: '잘못된 요청입니다' });
    }
  }

  // 계약서 업로드
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '파일이 필요합니다' });
      }

      const documentId = await this.service.upload(req.file);
      res.status(200).json({ contractDocumentId: documentId });
    } catch (error) {
      return res
        .status(400)
        .json({ message: error instanceof Error ? error.message : '잘못된 요청입니다' });
    }
  }

  // 계약서 다운로드
  async download(req: Request, res: Response) {
    try {
      const { contractDocumentId } = req.params;
      const file = await this.service.download(Number(contractDocumentId));

      // 한글 파일명 인코딩 (RFC 5987)
      const encodedFileName = encodeURIComponent(file.fileName);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodedFileName}`
      );
      res.setHeader('Content-Type', file.mimeType);

      // URL인 경우 로컬 경로로 변환 (개발 환경)
      const path = require('path');
      let filePath = file.filePath;

      // URL 형식인 경우 파일 경로 추출
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        // URL에서 pathname 추출 (예: /uploads/documents/xxx.pdf)
        const url = new URL(filePath);
        filePath = url.pathname;
      }

      // 절대 경로로 변환
      const absolutePath = path.resolve(process.cwd() + filePath);
      return res.sendFile(absolutePath);
    } catch (error) {
      console.error('다운로드 에러:', error);
      return res.status(400).json({
        message: error instanceof Error ? error.message : '잘못된 요청입니다'
      });
    }
  }
}
