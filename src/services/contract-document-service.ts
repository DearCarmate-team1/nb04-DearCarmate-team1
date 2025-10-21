import { ContractDocumentRepository } from "../repositories/contract-document-repository";

export class ContractDocumentService {
  private repository = new ContractDocumentRepository();

  async list(params: { page: number; pageSize: number; searchBy?: string; keyword?: string }) {
    return await this.repository.findAll(params);
  }

  async draftList() {
    return await this.repository.findDrafts();
  }

  async upload(file: Express.Multer.File) {
    return await this.repository.saveFile(file);
  }

  async download(id: number) {
    const file = await this.repository.findById(id);
    if (!file) throw new Error("파일을 찾을 수 없습니다");
    return file;
  }
}
