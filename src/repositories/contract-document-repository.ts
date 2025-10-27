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
  async saveFile(data: { url: string; fileName: string; size: number; mimeType: string }) {
    const document = await prisma.contractDocument.create({
      data: {
        fileName: data.fileName,
        fileKey: data.fileName, // url 기반에서는 fileName을 key로 사용
        filePath: data.url,
        mimeType: data.mimeType,
        size: data.size,
      },
    });
    return document.id;
  },

  // 계약서 ID 조회
  async findById(id: number) {
    return await prisma.contractDocument.findUnique({
      where: { id },
      include: {
        contract: true,
      },
    });
  },

  /**
   * 특정 계약의 모든 문서 조회
   */
  async findByContractId(contractId: number) {
    return await prisma.contractDocument.findMany({
      where: { contractId },
      select: {
        id: true,
        filePath: true, // 파일 URL
        fileName: true,
      },
    });
  },

  /**
   * 특정 계약들의 모든 문서 조회 (복수)
   */
  async findByContractIds(contractIds: number[]) {
    return await prisma.contractDocument.findMany({
      where: { contractId: { in: contractIds } },
      select: {
        id: true,
        filePath: true,
        fileName: true,
      },
    });
  },

  /**
   * 문서 삭제 (DB 레코드만)
   * 물리적 파일 삭제는 Service Layer에서 처리
   */
  async delete(id: number) {
    return await prisma.contractDocument.delete({
      where: { id },
    });
  },
};

export default contractDocumentRepository;
