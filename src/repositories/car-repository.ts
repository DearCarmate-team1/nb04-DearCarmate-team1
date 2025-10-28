import prisma from '../configs/prisma-client.js';
import type { CarStatus, Prisma } from '@prisma/client';
import type { CarCreateInput, CarUpdateInput } from '../types/car.js';

const carRepository = {
  /** 차량 등록 */
  async create(data: CarCreateInput) {
    return prisma.car.create({ data, include: { model: true } });
  },

  /** 차량 목록 조회 (검색 + 페이지네이션) */
  async findPaged(params: {
    companyId: number;
    page: number;
    pageSize: number;
    status?: CarStatus | 'total';
    searchBy?: 'carNumber' | 'model';
    keyword?: string;
  }) {
    const { companyId, page, pageSize, status, searchBy, keyword } = params;

    const where: Prisma.CarWhereInput = { companyId };
    if (status && status !== 'total') where.status = status as CarStatus;
    if (searchBy === 'carNumber' && keyword) where.carNumber = { contains: keyword, mode: 'insensitive' };
    if (searchBy === 'model' && keyword) where.model = { model: { contains: keyword, mode: 'insensitive' } };

    const totalItemCount = await prisma.car.count({ where });
    const data = await prisma.car.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { model: true },
    });

    return { totalItemCount, data };
  },

  /** 차량 상세 조회 */
  async findById(id: number) {
    return prisma.car.findUnique({ where: { id }, include: { model: true } });
  },

  /** 차량번호로 조회 */
  async findByCarNumber(carNumber: string) {
    return prisma.car.findUnique({ where: { carNumber } });
  },

  /** 특정 회사의 모든 차량번호 조회 (중복 체크용) */
  async findAllCarNumbersByCompany(companyId: number): Promise<string[]> {
    const cars = await prisma.car.findMany({
      where: { companyId },
      select: { carNumber: true },
    });
    return cars.map((c) => c.carNumber);
  },

  /** 차량 수정 */
  async update(id: number, data: CarUpdateInput & { modelId?: number }) {
    return prisma.car.update({ where: { id }, data, include: { model: true } });
  },

  /** 차량 삭제 */
  async delete(id: number) {
    await prisma.car.delete({ where: { id } });
  },

  /** 차량 상태 변경 */
  async updateStatus(id: number, status: CarStatus, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.car.update({
      where: { id },
      data: { status },
      include: { model: true },
    });
  },

  /** 차량 대량 등록 */
  async createMany(data: CarCreateInput[]): Promise<number> {
    if (!data.length) return 0;
    const result = await prisma.car.createMany({ data });
    return result.count;
  },

  /** 차량 대량 등록 (트랜잭션) */
  async bulkCreate(data: CarCreateInput[]): Promise<void> {
    if (!data.length) return;
    await prisma.$transaction(async (tx) => {
      await tx.car.createMany({ data });
    });
  },
};

export default carRepository;
