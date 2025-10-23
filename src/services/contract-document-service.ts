import contractDocumentRepository from '../repositories/contract-document-repository.js';

const contractDocumentService = {
  async list(params: { page: number; pageSize: number; searchBy?: string; keyword?: string }) {
    return await contractDocumentRepository.findAll(params);
  },

  async draftList() {
    return await contractDocumentRepository.findDrafts();
  },

  async upload(file: Express.Multer.File) {
    return await contractDocumentRepository.saveFile(file);
  },

  async download(id: number) {
    const file = await contractDocumentRepository.findById(id);
    if (!file) throw new Error('파일을 찾을 수 없습니다');
    return file;
  },
};

export default contractDocumentService;
