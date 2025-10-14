import type { CarEntity, CarModelEntity, CarStatus } from '../types/car.js';
import type { Car, CarModel } from '@prisma/client';

/** -------------------------------------------------
 * 🧩 Car Mapper
 * - Prisma ↔ Domain 변환
 * ------------------------------------------------- */
export const CarMapper = {
  /** 🚗 Car + Model join → CarEntity 변환 */
  fromPrisma(car: Car & { model: CarModel }): CarEntity {
    return {
      id: car.id,
      carNumber: car.carNumber,
      manufacturer: car.model.manufacturer,
      model: car.model.model,
      type: car.model.type,
      manufacturingYear: car.manufacturingYear,
      mileage: car.mileage,
      price: car.price,
      accidentCount: car.accidentCount,
      explanation: car.explanation ?? '',
      accidentDetails: car.accidentDetails ?? '',
      status: car.status as CarStatus,
      companyId: car.companyId,
      modelId: car.modelId,
      createdAt: car.createdAt,
      updatedAt: car.updatedAt,
    };
  },

  /** 🏭 CarModel → CarModelEntity 변환 */
  fromModel(model: CarModel): CarModelEntity {
    return {
      id: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      type: model.type,
    };
  },
};
