import prisma from '../configs/prisma-client.js';
import type { Prisma } from '@prisma/client';
import type { ContractCreateInput, ContractUpdateInput } from '../types/contract.js';

/** -------------------------------------------------
 * 📋 Contract Repository
 * - Prisma를 이용한 DB 쿼리
 * - 트랜잭션 관리
 * - 관계 데이터 포함 (car, customer, user, meetings, notifications, documents)
 * ------------------------------------------------- */

/** 📦 포함 정의 (기본) */
const CONTRACT_INCLUDE = {
  car: {
    include: {
      model: true, // 차량 모델 정보 (manufacturer, model)
    },
  },
  customer: true,
  user: true,
  meetings: {
    include: {
      notifications: true,
    },
    orderBy: { date: 'asc' as const },
  },
} as const;

/** 📁 계약서 파일 포함 정의 */
const CONTRACT_WITH_DOCUMENTS_INCLUDE = {
  ...CONTRACT_INCLUDE,
  documents: true,
} as const;

const contractRepository = {
  /** -------------------------------------------------
   * 📝 계약 생성
   * ------------------------------------------------- */
  async create(
    data: ContractCreateInput,
  ): Promise<Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>> {
    return prisma.contract.create({
      data,
      include: CONTRACT_INCLUDE,
    });
  },

  /** -------------------------------------------------
   * 📋 회사별 계약 조회 + 검색 필터
   * ------------------------------------------------- */
  async findByCompanyWithFilters(params: {
    companyId: number;
    searchBy?: 'customerName' | 'userName';
    keyword?: string;
  }): Promise<Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>[]> {
    const { companyId, searchBy, keyword } = params;

    const where: Prisma.ContractWhereInput = { companyId };

    // 검색 조건 추가
    if (searchBy && keyword) {
      if (searchBy === 'customerName') {
        where.customer = { name: { contains: keyword } };
      } else if (searchBy === 'userName') {
        where.user = { name: { contains: keyword } };
      }
    }

    return prisma.contract.findMany({
      where,
      include: CONTRACT_INCLUDE,
      orderBy: { id: 'desc' },
    });
  },

  /** -------------------------------------------------
   * 🔍 ID로 단일 계약 조회 (계약서 파일 포함)
   * ------------------------------------------------- */
  async findById(id: number): Promise<Prisma.ContractGetPayload<{
    include: typeof CONTRACT_WITH_DOCUMENTS_INCLUDE;
  }> | null> {
    return prisma.contract.findUnique({
      where: { id },
      include: CONTRACT_WITH_DOCUMENTS_INCLUDE,
    });
  },

  /** -------------------------------------------------
   * ✏️ 계약 수정
   * ------------------------------------------------- */
  async update(
    id: number,
    data: ContractUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>> {
    // meetings 업데이트가 있는 경우
    if (data.meetings) {
      const executeUpdate = async (client: Prisma.TransactionClient) => {
        // 1. 기존 미팅과 연결된 알림 먼저 삭제
        const existingMeetings = await client.meeting.findMany({
          where: { contractId: id },
          select: { id: true },
        });

        if (existingMeetings.length > 0) {
          const meetingIds = existingMeetings.map((m) => m.id);
          await client.notification.deleteMany({
            where: { meetingId: { in: meetingIds } },
          });

          // 2. 기존 미팅 삭제
          await client.meeting.deleteMany({
            where: { contractId: id },
          });
        }

        // 3. 계약 업데이트 (새 미팅 생성 포함)
        const { meetings, ...restData } = data;
        const meetingsCreate = meetings as any;

        return client.contract.update({
          where: { id },
          data: {
            ...restData,
            meetings: {
              create: meetingsCreate.create,
            },
          },
          include: CONTRACT_INCLUDE,
        });
      };

      // tx가 전달되면 그대로 사용, 없으면 새 트랜잭션 생성
      if (tx) {
        return executeUpdate(tx);
      } else {
        return prisma.$transaction(executeUpdate);
      }
    }

    // meetings 업데이트가 없으면 일반 업데이트
    const client = tx ?? prisma;
    return client.contract.update({
      where: { id },
      data,
      include: CONTRACT_INCLUDE,
    });
  },

  /** -------------------------------------------------
   * 🗑️ 계약 삭제
   * ------------------------------------------------- */
  async delete(id: number): Promise<void> {
    await prisma.contract.delete({ where: { id } });
  },

  /** -------------------------------------------------
   * 🚗 계약용 차량 목록 조회 (선택)
   * - 보유 중(possession) 상태의 차량만 반환
   * ------------------------------------------------- */
  async findCarsForContract(companyId: number): Promise<
    Prisma.CarGetPayload<{
      select: { id: true; carNumber: true; model: { select: { model: true } } };
    }>[]
  > {
    return prisma.car.findMany({
      where: {
        companyId,
        status: 'possession', // 보유 중인 차량만
      },
      select: {
        id: true,
        carNumber: true,
        model: {
          select: {
            model: true, // 차량 모델명
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  },

  /** -------------------------------------------------
   * 👥 계약용 고객 목록 조회 (선택)
   * ------------------------------------------------- */
  async findCustomersForContract(
    companyId: number,
  ): Promise<Prisma.CustomerGetPayload<{ select: { id: true; name: true; email: true } }>[]> {
    return prisma.customer.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { id: 'desc' },
    });
  },

  /** -------------------------------------------------
   * 👤 계약용 유저 목록 조회 (선택)
   * ------------------------------------------------- */
  async findUsersForContract(
    companyId: number,
  ): Promise<Prisma.UserGetPayload<{ select: { id: true; name: true; email: true } }>[]> {
    return prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { id: 'desc' },
    });
  },

  /** -------------------------------------------------
   * 📁 계약서 업로드 계약 목록 조회 (페이지네이션)
   * ------------------------------------------------- */
  async findForDocumentUpload(params: {
    companyId: number;
    page: number;
    pageSize: number;
    searchBy?: string;
    keyword?: string;
  }): Promise<{
    totalItemCount: number;
    data: Prisma.ContractGetPayload<{ include: typeof CONTRACT_WITH_DOCUMENTS_INCLUDE }>[];
  }> {
    const { companyId, page, pageSize, searchBy, keyword } = params;

    const where: Prisma.ContractWhereInput = {
      companyId,
      status: 'contractSuccessful', // 계약 성공 건만
      documents: {
        some: {}, // 문서가 1건 이상인 계약만
      },
    };

    // contractName 검색 = 차량 모델명 OR 고객 이름
    if (searchBy === 'contractName' && keyword) {
      where.OR = [
        { car: { model: { model: { contains: keyword } } } },
        { customer: { name: { contains: keyword } } },
      ];
    }

    const totalItemCount = await prisma.contract.count({ where });
    const data = await prisma.contract.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: CONTRACT_WITH_DOCUMENTS_INCLUDE,
      orderBy: { id: 'desc' },
    });

    return { totalItemCount, data };
  },

  /** -------------------------------------------------
   * 🎯 계약서 추가 계약 목록 조회 (선택 리스트용 - 간단)
   * ------------------------------------------------- */
  async findForUpload(companyId: number): Promise<
    Prisma.ContractGetPayload<{
      select: {
        id: true;
        car: { select: { model: { select: { model: true } } } };
        customer: { select: { name: true } };
      };
    }>[]
  > {
    return prisma.contract.findMany({
      where: { companyId },
      select: {
        id: true,
        car: {
          select: {
            model: {
              select: { model: true }, // 차량 모델명
            },
          },
        },
        customer: {
          select: { name: true }, // 고객명
        },
      },
      orderBy: { id: 'desc' },
    });
  },

  /** -------------------------------------------------
   * 📁 계약 문서 업데이트 (contractId 연결)
   * ------------------------------------------------- */
  async updateContractDocument(documentId: number, contractId: number) {
    return prisma.contractDocument.update({
      where: { id: documentId },
      data: { contractId },
    });
  },

  /** -------------------------------------------------
   * 📁 계약 문서 연결 해제 (해당 계약의 모든 문서)
   * ------------------------------------------------- */
  async disconnectAllDocuments(contractId: number) {
    return prisma.contractDocument.updateMany({
      where: { contractId },
      data: { contractId: null },
    });
  },
};

export default contractRepository;
