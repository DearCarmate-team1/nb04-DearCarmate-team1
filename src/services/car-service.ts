import carRepository from '../repositories/car-repository.js';
import carModelRepository from '../repositories/car-model-repository.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../configs/custom-error.js';
import type { CreateCarDto, UpdateCarDto } from '../dtos/car-dto.js';
import { CarCsvRow } from '../types/car.js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const carService = {
  // 🚗 차량 등록
  async create(user: any, dto: CreateCarDto) {
    const { manufacturer, model, ...rest } = dto;

    const foundModel = await carModelRepository.findByManuModel(manufacturer, model);
    if (!foundModel) throw new BadRequestError('존재하지 않는 제조사/차종입니다.');

    const created = await carRepository.create({
      ...rest,
      companyId: user.companyId,
      modelId: foundModel.id,
    });

    return {
      id: created.id,
      carNumber: created.carNumber,
      manufacturer: created.model.manufacturer,
      model: created.model.model,
      type: created.model.type,
      manufacturingYear: created.manufacturingYear,
      mileage: created.mileage,
      price: created.price,
      accidentCount: created.accidentCount,
      explanation: created.explanation ?? '',
      accidentDetails: created.accidentDetails ?? '',
      status: created.status,
    };
  },

  // 📋 차량 목록
  async list(user: any, query: any) {
    const { page = 1, pageSize = 10, status, searchBy, keyword } = query;

    const { totalItemCount, data } = await carRepository.findPaged({
      companyId: user.companyId,
      page,
      pageSize,
      status,
      searchBy,
      keyword,
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / pageSize),
      totalItemCount,
      data: data.map((c) => ({
        id: c.id,
        carNumber: c.carNumber,
        manufacturer: c.model.manufacturer,
        model: c.model.model,
        type: c.model.type,
        manufacturingYear: c.manufacturingYear,
        mileage: c.mileage,
        price: c.price,
        accidentCount: c.accidentCount,
        explanation: c.explanation ?? '',
        accidentDetails: c.accidentDetails ?? '',
        status: c.status,
      })),
    };
  },

  // 🔍 상세
  async detail(user: any, carId: number) {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

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
      status: car.status,
    };
  },

  // ✏️ 수정
  async update(user: any, carId: number, dto: UpdateCarDto) {
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

    const { manufacturer, model, ...rest } = dto;
    const updated = await carRepository.update(carId, { ...rest, modelId });

    return {
      id: updated.id,
      carNumber: updated.carNumber,
      manufacturer: updated.model.manufacturer,
      model: updated.model.model,
      type: updated.model.type,
      manufacturingYear: updated.manufacturingYear,
      mileage: updated.mileage,
      price: updated.price,
      accidentCount: updated.accidentCount,
      explanation: updated.explanation ?? '',
      accidentDetails: updated.accidentDetails ?? '',
      status: updated.status,
    };
  },

  // 🗑 삭제
  async remove(user: any, carId: number) {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    await carRepository.delete(carId);
    return { message: '차량이 삭제되었습니다.' };
  },

  // 🚘 제조사/모델 목록
  async getModels() {
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
  async bulkUpload(user: any, filePath: string) {
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

    const cars = [];

    for (const r of records) {
      const carModel = await carModelRepository.findByManuModel(r.manufacturer, r.model);
      if (!carModel) continue; // 잘못된 제조사/모델은 건너뜀

      cars.push({
        carNumber: r.carNumber,
        manufacturingYear: Number(r.manufacturingYear),
        mileage: Number(r.mileage),
        price: Number(r.price),
        accidentCount: Number(r.accidentCount),
        explanation: r.explanation,
        accidentDetails: r.accidentDetails,
        companyId: user.companyId,
        modelId: carModel.id,
      });
    }

    if (!cars.length) {
      throw new BadRequestError('등록 가능한 차량 데이터가 없습니다.');
    }

    await carRepository.createMany(cars);
    return { count: cars.length };
  },
};

export default carService;
