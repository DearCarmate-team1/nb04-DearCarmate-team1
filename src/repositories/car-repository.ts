import prisma from '../configs/prisma-client.js';
import type { CarStatus, Prisma } from '@prisma/client';
import type { CarCreateInput, CarUpdateInput } from '../types/car.js';

const carRepository = {
  async create(data: CarCreateInput) {
    return prisma.car.create({ data, include: { model: true } });
  },

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
    if (searchBy === 'carNumber' && keyword) where.carNumber = { contains: keyword };
    if (searchBy === 'model' && keyword) where.model = { model: { contains: keyword } };

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

  async findById(id: number) {
    return prisma.car.findUnique({ where: { id }, include: { model: true } });
  },

  async findByCarNumber(carNumber: string) {
    return prisma.car.findUnique({ where: { carNumber } });
  },

  async findAllCarNumbersByCompany(companyId: number): Promise<string[]> {
    const cars = await prisma.car.findMany({
      where: { companyId },
      select: { carNumber: true },
    });
    return cars.map((c) => c.carNumber);
  },

  async update(id: number, data: CarUpdateInput & { modelId?: number }) {
    return prisma.car.update({ where: { id }, data, include: { model: true } });
  },

  async delete(id: number) {
    await prisma.car.delete({ where: { id } });
  },

  async updateStatus(id: number, status: CarStatus, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.car.update({
      where: { id },
      data: { status },
      include: { model: true },
    });
  },

  async createMany(data: CarCreateInput[]): Promise<number> {
    if (!data.length) return 0;
    const result = await prisma.car.createMany({ data });
    return result.count;
  },

  async bulkCreate(data: CarCreateInput[]): Promise<void> {
    if (!data.length) return;
    await prisma.$transaction(async (tx) => {
      await tx.car.createMany({ data });
    });
  },
};

export default carRepository;
