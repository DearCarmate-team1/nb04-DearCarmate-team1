import { Request, Response } from 'express';
import contractDocumentService from '../services/contract-document-service.js';
import contractService from '../services/contract-service.js';

const contractDocumentController = {

   //계약서 목록 조회 (문서가 1건 이상인 계약 목록)
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 10, searchBy, keyword } = req.query;

      const result = await contractService.getForDocumentUpload(req.user, {
        page: Number(page),
        pageSize: Number(pageSize),
        searchBy: searchBy as 'contractName' | undefined,
        keyword: keyword as string | undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('📄 list() error:', error);
      res.status(400).json({ message: '잘못된 요청입니다' });
    }
  },

 
   //계약서 업로드용 계약 목록 조회
  async draftList(req: Request, res: Response): Promise<void> {
    try {
      const data = await contractDocumentService.draftList();
      res.status(200).json(data);
    } catch (error) {
      console.error('🧾 draftList() error:', error);
      res.status(400).json({ message: '잘못된 요청입니다' });
    }
  },


   //계약서 업로드
  async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: '파일이 필요합니다' });
        return;
      }

      const documentId = await contractDocumentService.upload(req.file);
      res.status(200).json({ contractDocumentId: documentId });
    } catch (error) {
      console.error('📤 upload() error:', error);
      res.status(400).json({
        message: error instanceof Error ? error.message : '잘못된 요청입니다',
      });
    }
  },

   //계약서 다운로드
  async download(req: Request, res: Response): Promise<void> {
    try {
      const { contractDocumentId } = req.params;
      const file = await contractDocumentService.download(Number(contractDocumentId));

      if (!file) {
        res.status(404).json({ message: '파일을 찾을 수 없습니다' });
        return;
      }

      //한글 파일명 인코딩 (RFC 5987 규격)
      const encodedFileName = encodeURIComponent(file.fileName);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodedFileName}`,
      );
      res.setHeader('Content-Type', file.mimeType);

      //절대 경로 변환 후 전송
      const path = await import('path');
      const absolutePath = path.resolve(file.filePath);
      res.sendFile(absolutePath);
    } catch (error) {
      console.error('📥 download() error:', error);
      res.status(400).json({
        message: error instanceof Error ? error.message : '잘못된 요청입니다',
      });
    }
  },
};

export default contractDocumentController;
