import type { Express } from "express";
import prisma from "../configs/prisma-client";

interface FindAllParams {
  page: number;
  pageSize: number;
  searchBy?: string;
  keyword?: string;
}

export class ContractDocumentRepository {
  // 계약서 목록 조회 (페이징 + 검색)
  async findAll({ page, pageSize, searchBy, keyword }: FindAllParams) {
    const where = searchBy && keyword ? { [searchBy]: { contains: keyword } } : {};

    const totalItemCount = await prisma.contractDocument.count({ where });
    const data = await prisma.contractDocument.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        contract: { // relation 포함
          select: {
            id: true,
            contractPrice: true,
            status: true,
          },
        },
      },
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / pageSize),
      totalItemCount,
      data,
    };
  }

  // 임시 계약서(초안) 조회
  async findDrafts() {
    const contracts = await prisma.contract.findMany({
      where: { status: "contractDraft" },
      include: {
        car: { select: { carNumber: true } },
        customer: { select: { name: true } },
      },
    });

    // data 문자열 생성
    return contracts.map(c => ({
      id: c.id,
      data: `${c.car.carNumber} - ${c.customer.name} 고객님`,
    }));
  }

  // 계약서 파일 저장
  async saveFile(file: Express.Multer.File, contractId: number) {
    return await prisma.contractDocument.create({
      data: {
        fileName: file.originalname,
        fileKey: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        contractId, // 필수 relation
      },
    });
  }

  // ID로 계약서 조회
  async findById(id: number) {
    return await prisma.contractDocument.findUnique({
      where: { id },
      include: {
        contract: true,
      },
    });
  }
}
