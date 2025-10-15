import prisma from '../configs/prisma-client.js';
import { CarStatus } from '@prisma/client';
import type { CarCreateInput, CarUpdateInput } from '../types/car.js';

const carRepository = {
  async create(data: CarCreateInput) {
    return prisma.car.create({ data, include: { model: true } });
  },

  async findPaged({
    companyId,
    page,
    pageSize,
    status,
    searchBy,
    keyword,
  }: {
    companyId: number;
    page: number;
    pageSize: number;
    status?: CarStatus | 'total';
    searchBy?: 'carNumber' | 'model';
    keyword?: string;
  }) {
    const where: any = { companyId };
    if (status && status !== 'total') where.status = status;
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

  async update(id: number, data: CarUpdateInput & { modelId?: number }) {
    return prisma.car.update({ where: { id }, data, include: { model: true } });
  },

  async delete(id: number) {
    await prisma.car.delete({ where: { id } });
  },

  async createMany(data: CarCreateInput[]): Promise<void> {
    if (!data.length) return;
    await prisma.car.createMany({
      data,
      skipDuplicates: true, // 중복 carNumber 방지
    });
  },
};

export default carRepository;
