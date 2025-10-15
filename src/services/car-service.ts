import carRepository from '../repositories/car-repository.js';
import carModelRepository from '../repositories/car-model-repository.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../configs/custom-error.js';
import type { CreateCarDto, UpdateCarDto } from '../dtos/car-dto.js';
import type { CarCsvRow, CarResponseModel, CarListResponse, CarCreateInput } from '../types/car.js';
import { CarMapper } from '../mappers/car-mapper.js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const carService = {
  // 🚗 차량 등록
  async create(user: any, dto: CreateCarDto): Promise<CarResponseModel> {
    const { manufacturer, model } = dto;

    const foundModel = await carModelRepository.findByManuModel(manufacturer, model);
    if (!foundModel) throw new BadRequestError('존재하지 않는 제조사/차종입니다.');

    const createInput = CarMapper.fromCreateDto(dto, user.companyId, foundModel.id);
    const created = await carRepository.create(createInput);

    const entity = CarMapper.fromPrisma(created);
    return CarMapper.toResponseModel(entity);
  },

  // 📋 차량 목록
  async list(user: any, query: any): Promise<CarListResponse> {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const { status, searchBy, keyword } = query;

    const { totalItemCount, data } = await carRepository.findPaged({
      companyId: user.companyId,
      page,
      pageSize,
      status,
      searchBy,
      keyword,
    });

    const entities = data.map((car) => CarMapper.fromPrisma(car));
    const totalPages = Math.ceil(totalItemCount / pageSize);

    return CarMapper.toListResponse(entities, page, totalPages, totalItemCount);
  },

  // 🔍 상세
  async detail(user: any, carId: number): Promise<CarResponseModel> {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    const entity = CarMapper.fromPrisma(car);
    return CarMapper.toResponseModel(entity);
  },

  // ✏️ 수정
  async update(user: any, carId: number, dto: UpdateCarDto): Promise<CarResponseModel> {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    let modelId = car.modelId;
    if (dto.manufacturer || dto.model) {
      const manu = dto.manufacturer ?? car.model.manufacturer;
      const mdl = dto.model ?? car.model.model;
      const cm = await carModelRepository.findByManuModel(manu, mdl);
      if (!cm) throw new BadRequestError('존재하지 않는 제조사/차종입니다.');
      modelId = cm.id;
    }

    const updateInput = CarMapper.fromUpdateDto(dto);
    const updated = await carRepository.update(carId, { ...updateInput, modelId });

    const entity = CarMapper.fromPrisma(updated);
    return CarMapper.toResponseModel(entity);
  },

  // 🗑 삭제
  async remove(user: any, carId: number): Promise<{ message: string }> {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    await carRepository.delete(carId);
    return { message: '차량이 삭제되었습니다.' };
  },

  // 🚘 제조사/모델 목록
  async getModels(): Promise<Array<{ manufacturer: string; model: string[] }>> {
    const flat = await carModelRepository.findAllFlat();
    const grouped = flat.reduce<Record<string, string[]>>((acc, cur) => {
      (acc[cur.manufacturer] ??= []).push(cur.model);
      return acc;
    }, {});

    return Object.entries(grouped).map(([manufacturer, model]) => ({
      manufacturer,
      model,
    }));
  },

  /** 🚚 대용량 CSV 업로드 */
  async bulkUpload(user: any, filePath: string): Promise<{ count: number }> {
    // CSV 파일 읽기 + BOM 제거
    const csvText = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

    // ✅ 타입 안전한 CSV 파싱
    const records = parse<CarCsvRow>(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) {
      throw new BadRequestError('CSV 데이터가 비어 있습니다.');
    }

    const cars: CarCreateInput[] = [];

    for (const r of records) {
      const carModel = await carModelRepository.findByManuModel(r.manufacturer, r.model);
      if (!carModel) continue; // 잘못된 제조사/모델은 건너뜀

      const item: CarCreateInput = {
        carNumber: r.carNumber,
        manufacturingYear: Number(r.manufacturingYear),
        mileage: Number(r.mileage),
        price: Number(r.price),
        accidentCount: Number(r.accidentCount),
        companyId: user.companyId,
        modelId: carModel.id,
      };

      if (r.explanation !== undefined) item.explanation = r.explanation;
      if (r.accidentDetails !== undefined) item.accidentDetails = r.accidentDetails;

      cars.push(item);
    }

    if (!cars.length) {
      throw new BadRequestError('등록 가능한 차량 데이터가 없습니다.');
    }

    await carRepository.createMany(cars);
    return { count: cars.length };
  },
};

export default carService;
