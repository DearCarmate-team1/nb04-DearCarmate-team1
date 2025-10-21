import { Request, Response } from "express";
import { ContractDocumentService } from "../services/contract-document-service";

export class ContractDocumentController {
  private service = new ContractDocumentService();

  // 계약서 목록 조회
  async list(req: Request, res: Response) {
    try {
      const { page = 1, pageSize = 10, searchBy, keyword } = req.query;
      const result = await this.service.list({
        page: Number(page),
        pageSize: Number(pageSize),
        searchBy: searchBy as string,
        keyword: keyword as string,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }
  }

  // 계약서 업로드 시 계약 목록 조회
  async draftList(req: Request, res: Response) {
    try {
      const data = await this.service.draftList();
      return res.status(200).json(data);
    } catch {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }
  }

  // 계약서 업로드
  async upload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "파일이 필요합니다" });
    }

    const contractId = Number(req.body.contractId); // form-data로 전송된 계약 ID
    if (!contractId) {
      return res.status(400).json({ message: "contractId가 필요합니다" });
    }

    await this.service.upload(req.file, contractId);
    return res.status(200).json({ message: "계약서가 성공적으로 업로드되었습니다" });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "잘못된 요청입니다" });
  }
}

  // 계약서 다운로드
  async download(req: Request, res: Response) {
    try {
      const { contractDocumentId } = req.params;
      const file = await this.service.download(Number(contractDocumentId));

      res.setHeader("Content-Disposition", `attachment; filename=${file.fileName}`);
      res.setHeader("Content-Type", file.mimeType);
      return res.sendFile(file.filePath);
    } catch {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }
  }
}
