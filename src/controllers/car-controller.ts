import { Request, Response } from 'express';
import carService from '../services/car-service.js';
import type { CarResponseModel, CarListResponse } from '../types/car.js';
import type { CarQueryDto } from '../dtos/car-dto.js';

const carController = {
  /** 차량 등록 */
  async create(req: Request, res: Response): Promise<void> {
    const result: CarResponseModel = await carService.create(req.user, req.body);
    res.status(201).json(result);
  },

  /** 차량 목록 조회 */
  async getAll(req: Request, res: Response): Promise<void> {
    const result: CarListResponse = await carService.list(
      req.user,
      req.query as unknown as CarQueryDto,
    );
    res.status(200).json(result);
  },

  /** 차량 상세 조회 */
  async getById(req: Request, res: Response): Promise<void> {
    const result: CarResponseModel = await carService.detail(req.user, Number(req.params.carId));
    res.status(200).json(result);
  },

  /** 차량 수정 */
  async update(req: Request, res: Response): Promise<void> {
    const result: CarResponseModel = await carService.update(
      req.user,
      Number(req.params.carId),
      req.body,
    );
    res.status(200).json(result);
  },

  /** 차량 삭제 */
  async delete(req: Request, res: Response): Promise<void> {
    const result = await carService.remove(req.user, Number(req.params.carId));
    res.status(200).json(result);
  },

  /** 제조사-모델 목록 조회 */
  async getModels(_req: Request, res: Response): Promise<void> {
    const result = await carService.getModels();
    res.status(200).json({ data: result });
  },

  /** 차량 CSV 대용량 업로드 (메모리 기반 - 디스크 저장 안 함) */
  async uploadCsv(req: Request, res: Response): Promise<void> {
    const result = await carService.bulkUpload(req.user, req.file);

    // 실패 내역이 있으면 207 Multi-Status 반환
    if (result.failureCount > 0) {
      res.status(207).json({
        message: `${result.successCount}대 등록 성공, ${result.failureCount}대 실패`,
        successCount: result.successCount,
        failureCount: result.failureCount,
        failures: result.failures,
      });
    } else {
      res.status(200).json({
        message: `성공적으로 ${result.successCount}대 등록되었습니다.`,
        successCount: result.successCount,
      });
    }
  },
};

export default carController;
