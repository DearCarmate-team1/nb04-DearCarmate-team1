import type { Express } from 'express';
import prisma from '../configs/prisma-client.js';

interface FindAllParams {
  page: number;
  pageSize: number;
  searchBy?: string;
  keyword?: string;
}

const contractDocumentRepository = {
  // 계약서 목록 조회
  async findAll({ page, pageSize, searchBy, keyword }: FindAllParams) {
    const where = searchBy && keyword ? { [searchBy]: { contains: keyword } } : {};
    const totalItemCount = await prisma.contractDocument.count({ where });
    const data = await prisma.contractDocument.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        contract: { select: { id: true, contractPrice: true, status: true } },
      },
    });
    return { currentPage: page, totalPages: Math.ceil(totalItemCount / pageSize), totalItemCount, data };
  },

  // 문서 업로드용 계약 목록 조회
  async findDrafts() {
    const contracts = await prisma.contract.findMany({
      where: { status: 'contractSuccessful', documents: { none: {} } },
      include: {
        car: { select: { carNumber: true, model: { select: { model: true } } } },
        customer: { select: { name: true } },
      },
      orderBy: { id: 'desc' },
    });
    return contracts.map(c => ({ id: c.id, data: `${c.car.model.model} - ${c.customer.name} 고객님` }));
  },

  // 계약서 파일 저장
  async saveFile(file: Express.Multer.File) {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const document = await prisma.contractDocument.create({
      data: {
        fileName: originalName,
        fileKey: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
    return document.id;
  },

  // 계약서 ID 조회
  async findById(id: number) {
    return await prisma.contractDocument.findUnique({ where: { id }, include: { contract: true } });
  },
};

export default contractDocumentRepository;
