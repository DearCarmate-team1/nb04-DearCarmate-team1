import prisma from '../configs/prisma-client.js';
import { ContractStatus } from '@prisma/client';

const dashboardRepository = {
  /**
   * 특정 기간 동안의 총 매출액(성사된 계약)을 조회합니다.
   */
  async getSalesByDateRange(companyId: number, startDate: Date, endDate: Date) {
    const result = await prisma.contract.aggregate({
      _sum: {
        contractPrice: true,
      },
      where: {
        companyId,
        status: ContractStatus.contractSuccessful,
        resolutionDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    return result._sum.contractPrice ?? 0;
  },

  /**
   * 현재 진행 중인 계약의 총 개수를 조회합니다.
   */
  async getProceedingContractsCount(companyId: number) {
    return prisma.contract.count({
      where: {
        companyId,
        status: {
          in: [
            ContractStatus.carInspection,
            ContractStatus.priceNegotiation,
            ContractStatus.contractDraft,
          ],
        },
      },
    });
  },

  /**
   * 특정 기간 동안 완료된 계약의 총 개수를 조회합니다.
   */
  async getCompletedContractsCountByDateRange(
    companyId: number,
    startDate: Date,
    endDate: Date,
  ) {
    return prisma.contract.count({
      where: {
        companyId,
        status: ContractStatus.contractSuccessful,
        resolutionDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  },

  /**
   * 차종별 계약 수를 집계합니다.
   */
  async getContractsCountByCarType(companyId: number) {
    return prisma.contract.groupBy({
      by: ['carId'],
      _count: {
        id: true,
      },
      where: {
        companyId,
      },
    });
  },

  /**
   * 차종별 매출액을 집계합니다.
   */
  async getSalesByCarType(companyId: number) {
    return prisma.contract.groupBy({
      by: ['carId'],
      _sum: {
        contractPrice: true,
      },
      where: {
        companyId,
        status: ContractStatus.contractSuccessful,
      },
    });
  },

  /**
   * 주어진 ID 목록에 해당하는 차량들의 차종을 조회합니다.
   */
  async getCarTypesByIds(carIds: number[]) {
    return prisma.car.findMany({
      where: {
        id: {
          in: carIds,
        },
      },
      select: {
        id: true,
        model: {
          select: {
            type: true,
          },
        },
      },
    });
  },
};

export default dashboardRepository;
