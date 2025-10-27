import type { Express } from 'express';
import prisma from '../configs/prisma-client.js';

interface FindAllParams {
  page: number;
  pageSize: number;
  searchBy?: string;
  keyword?: string;
}

interface DocumentUploadData {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
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

  // 문서 등록용 계약 목록 조회 (문서가 없는 계약 성공 건)
  async findDrafts() {
    const contracts = await prisma.contract.findMany({
      where: {
        status: "contractSuccessful", // 계약 성공 건만
        documents: {
          none: {}, // 문서가 0건인 계약만
        },
      },
      include: {
        car: {
          select: {
            carNumber: true,
            model: {
              select: {
                model: true
              }
            }
          }
        },
        customer: { select: { name: true } },
      },
      orderBy: { id: 'desc' },
    });

    // data 문자열 생성: 차량 모델 - 고객명
    return contracts.map(c => ({
      id: c.id,
      data: `${c.car.model.model} - ${c.customer.name} 고객님`,
    }));
  }

  /**
   * 계약서 파일 저장 (contractId는 나중에 업데이트됨)
   * @param uploadData - 업로드된 파일 정보 (URL, 파일명, 크기, MIME 타입)
   * @returns 생성된 문서 ID
   */
  async saveFile(uploadData: DocumentUploadData) {
    const document = await prisma.contractDocument.create({
      data: {
        fileName: uploadData.fileName,
        fileKey: uploadData.url, // URL을 고유 키로 사용
        filePath: uploadData.url, // URL 저장
        mimeType: uploadData.mimeType,
        size: uploadData.size,
        // contractId는 optional - 나중에 계약 업데이트 시 연결
      },
    });
    return document.id;
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
