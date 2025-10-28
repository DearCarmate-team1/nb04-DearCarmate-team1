import type {
  CarEntity,
  CarModelEntity,
  CarResponseModel,
  CarListResponse,
  CarCreateInput,
  CarUpdateInput,
} from '../types/car.js';
import type { Car, CarModel } from '@prisma/client';
import type { CreateCarDto, UpdateCarDto, CarStatus } from '../dtos/car-dto.js';

export const CarMapper = {
  /** Car + Model join → CarEntity 변환 */
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

  /** CarModel → CarModelEntity 변환 */
  fromModel(model: CarModel): CarModelEntity {
    return {
      id: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      type: model.type,
    };
  },

  /** CarEntity → CarResponseModel 변환 */
  toResponseModel(entity: CarEntity): CarResponseModel {
    const { companyId, modelId, createdAt, updatedAt, ...rest } = entity;
    return {
      ...rest,
      explanation: entity.explanation ?? '',
      accidentDetails: entity.accidentDetails ?? '',
    };
  },

  /** CarEntity[] → CarListResponse 변환 */
  toListResponse(
    entities: CarEntity[],
    currentPage: number,
    totalPages: number,
    totalItemCount: number,
  ): CarListResponse {
    return {
      currentPage,
      totalPages,
      totalItemCount,
      data: entities.map((entity) => this.toResponseModel(entity)),
    };
  },

  /** CreateCarDto → CarCreateInput 변환 */
  fromCreateDto(dto: CreateCarDto, companyId: number, modelId: number): CarCreateInput {
    const result: CarCreateInput = {
      carNumber: dto.carNumber,
      manufacturingYear: dto.manufacturingYear,
      mileage: dto.mileage,
      price: dto.price,
      accidentCount: dto.accidentCount,
      companyId,
      modelId,
      status: 'possession', // 기본값
    };

    if (dto.explanation !== undefined) result.explanation = dto.explanation;
    if (dto.accidentDetails !== undefined) result.accidentDetails = dto.accidentDetails;

    return result;
  },

  /** UpdateCarDto → CarUpdateInput 변환 */
  fromUpdateDto(dto: UpdateCarDto): CarUpdateInput {
    const result: CarUpdateInput = {};

    if (dto.carNumber !== undefined) result.carNumber = dto.carNumber;
    if (dto.manufacturingYear !== undefined) result.manufacturingYear = dto.manufacturingYear;
    if (dto.mileage !== undefined) result.mileage = dto.mileage;
    if (dto.price !== undefined) result.price = dto.price;
    if (dto.accidentCount !== undefined) result.accidentCount = dto.accidentCount;
    if (dto.explanation !== undefined) result.explanation = dto.explanation;
    if (dto.accidentDetails !== undefined) result.accidentDetails = dto.accidentDetails;
    if (dto.status !== undefined) result.status = dto.status;

    return result;
  },
};
