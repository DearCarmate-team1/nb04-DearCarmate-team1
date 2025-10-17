import prisma from '../configs/prisma-client.js';
import { CarMapper } from '../mappers/car-mapper.js';
import type { CarModelEntity, CarModelFlat } from '../types/car.js';

const carModelRepository = {
  // 🚘 제조사/모델 전체 조회 (flat)
  async findAllFlat(): Promise<CarModelFlat[]> {
    const result = await prisma.carModel.findMany({
      select: { manufacturer: true, model: true },
      orderBy: [{ manufacturer: 'asc' }, { model: 'asc' }],
    });
    return result;
  },

  // 🚘 제조사/모델 전체 조회 (id 포함, 캐싱용)
  async findAllWithId(): Promise<Array<{ id: number; manufacturer: string; model: string }>> {
    return prisma.carModel.findMany({
      select: { id: true, manufacturer: true, model: true },
    });
  },

  // 🚘 제조사 + 모델 단일 조회
  async findByManuModel(manufacturer: string, model: string): Promise<CarModelEntity | null> {
    const found = await prisma.carModel.findUnique({
      where: { manufacturer_model: { manufacturer, model } },
    });
    return found ? CarMapper.fromModel(found) : null;
  },
};

export default carModelRepository;
