import carRepository from '../repositories/car-repository.js';
import carModelRepository from '../repositories/car-model-repository.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../configs/custom-error.js';
import type { CreateCarDto, UpdateCarDto, CarQueryDto } from '../dtos/car-dto.js';
import type {
  CarResponseModel,
  CarListResponse,
  CarCreateInput,
  BulkUploadResult,
  CarCsvRow,
} from '../types/car.js';
import { CarMapper } from '../mappers/car-mapper.js';
import { csvParser } from '../utils/csv-parser.js';
import type { AuthUser } from '../types/auth-user.js';
import { cleanupContractDocuments } from '../utils/contract-cleanup.js';
import prisma from '../configs/prisma-client.js';

const carService = {
  // 🚗 차량 등록
  async create(user: AuthUser, dto: CreateCarDto): Promise<CarResponseModel> {
    const { manufacturer, model, carNumber } = dto;

    // ✅ 중복 차량 번호 검사
    const existingCar = await carRepository.findByCarNumber(carNumber);
    if (existingCar) {
      throw new ConflictError(`차량 번호 "${carNumber}"는 이미 등록되어 있습니다.`);
    }

    const foundModel = await carModelRepository.findByManuModel(manufacturer, model);
    if (!foundModel) throw new BadRequestError('존재하지 않는 제조사/차종입니다.');

    const createInput = CarMapper.fromCreateDto(dto, user.companyId, foundModel.id);
    const created = await carRepository.create(createInput);

    const entity = CarMapper.fromPrisma(created);
    return CarMapper.toResponseModel(entity);
  },

  // 📋 차량 목록
  async list(user: AuthUser, query: CarQueryDto): Promise<CarListResponse> {
    const { page, pageSize, status, searchBy, keyword } = query;

    const { totalItemCount, data } = await carRepository.findPaged({
      companyId: user.companyId,
      page,
      pageSize,
      ...(status && { status }),
      ...(searchBy && keyword && { searchBy, keyword }),
    });

    const entities = data.map((car) => CarMapper.fromPrisma(car));
    const totalPages = Math.ceil(totalItemCount / pageSize);

    return CarMapper.toListResponse(entities, page, totalPages, totalItemCount);
  },

  // 🔍 상세
  async detail(user: AuthUser, carId: number): Promise<CarResponseModel> {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    const entity = CarMapper.fromPrisma(car);
    return CarMapper.toResponseModel(entity);
  },

  // ✏️ 수정
  async update(user: AuthUser, carId: number, dto: UpdateCarDto): Promise<CarResponseModel> {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    if (dto.carNumber && dto.carNumber !== car.carNumber) {
      const existingCar = await carRepository.findByCarNumber(dto.carNumber);
      if (existingCar) {
        throw new ConflictError(`차량 번호 "${dto.carNumber}"는 이미 등록되어 있습니다.`);
      }
    }

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

  // 🗑 삭제 (관련 계약 문서들의 물리적 파일도 함께 삭제)
  async remove(user: AuthUser, carId: number): Promise<{ message: string }> {
    const car = await carRepository.findById(carId);
    if (!car) throw new NotFoundError('존재하지 않는 차량입니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    // 차량과 연결된 모든 계약 ID 조회
    const contracts = await prisma.contract.findMany({
      where: { carId, companyId: user.companyId },
      select: { id: true },
    });

    // 계약들의 문서 파일 삭제
    await cleanupContractDocuments(contracts.map((c) => c.id));

    // DB에서 차량 삭제 (Cascade가 계약 및 문서 레코드 자동 삭제)
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

  /** 🚚 대용량 CSV 업로드 (메모리 기반 - 디스크 저장 안 함) */
  async bulkUpload(user: AuthUser, file: Express.Multer.File | undefined): Promise<BulkUploadResult> {
    // Step 1: 파일 검증
    if (!file) {
      throw new BadRequestError('CSV 파일이 필요합니다.');
    }

    // Step 2: CSV 파일 파싱 (메모리 버퍼에서 바로 파싱, 비동기)
    const records = await csvParser.parseFromBuffer<CarCsvRow>(file.buffer);

    if (!records.length) {
      throw new BadRequestError('CSV 데이터가 비어 있습니다.');
    }

    // Step 3: N+1 쿼리 해결 - 사전 캐싱
    // ✅ 모든 CarModel을 한 번에 조회
    const allCarModels = await carModelRepository.findAllWithId();
    const carModelMap = new Map<string, number>();
    allCarModels.forEach((cm) => {
      const key = `${cm.manufacturer}|${cm.model}`;
      carModelMap.set(key, cm.id);
    });

    // ✅ 기존 차량 번호도 한 번에 조회
    const existingCarNumbers = await carRepository.findAllCarNumbersByCompany(user.companyId);
    const carNumberSet = new Set(existingCarNumbers);

    // Step 4: 비즈니스 검증 (메모리 기반, DB 쿼리 없음)
    const validCars: CarCreateInput[] = [];
    const failures: BulkUploadResult['failures'] = [];

    for (let i = 0; i < records.length; i++) {
      const r = records[i]!;
      const rowNumber = i + 2; // CSV 행 번호 (헤더 포함)

      // 검증 1: 제조사/모델 존재 여부
      const key = `${r.manufacturer}|${r.model}`;
      const modelId = carModelMap.get(key);
      if (!modelId) {
        failures.push({
          row: rowNumber,
          carNumber: r.carNumber,
          reason: `존재하지 않는 제조사/모델: ${r.manufacturer} ${r.model}`,
        });
        continue;
      }

      // 검증 2: 중복 차량 번호
      if (carNumberSet.has(r.carNumber)) {
        failures.push({
          row: rowNumber,
          carNumber: r.carNumber,
          reason: '이미 등록된 차량 번호입니다.',
        });
        continue;
      }

      // ✅ 검증 통과: validCars에 추가
      const item: CarCreateInput = {
        carNumber: r.carNumber,
        manufacturingYear: Number(r.manufacturingYear),
        mileage: Number(r.mileage),
        price: Number(r.price),
        accidentCount: Number(r.accidentCount),
        companyId: user.companyId,
        modelId,
      };

      if (r.explanation !== undefined) item.explanation = r.explanation;
      if (r.accidentDetails !== undefined) item.accidentDetails = r.accidentDetails;

      validCars.push(item);
      // 중복 방지: 현재 배치에 추가된 차량 번호도 Set에 추가
      carNumberSet.add(r.carNumber);
    }

    // Step 5: 검증 통과한 항목만 일괄 등록 (Repository 위임)
    if (validCars.length > 0) {
      await carRepository.bulkCreate(validCars);
    }

    // Step 6: 결과 반환
    return {
      successCount: validCars.length,
      failureCount: failures.length,
      failures,
    };
  },
};

export default carService;
