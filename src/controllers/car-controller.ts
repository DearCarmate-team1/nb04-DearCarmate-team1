import { Request, Response } from 'express';
import carService from '../services/car-service.js';
import type { CarResponseModel, CarListResponse } from '../types/car.js';

const carController = {
  // 🚗 차량 등록
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: '로그인이 필요합니다' });
      return;
    }
    const result: CarResponseModel = await carService.create(req.user, req.body);
    res.status(201).json(result);
  },

  // 📋 차량 목록 조회
  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: '로그인이 필요합니다' });
      return;
    }
    const result: CarListResponse = await carService.list(req.user, req.query);
    res.status(200).json(result);
  },

  // 🔍 차량 상세 조회
  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: '로그인이 필요합니다' });
      return;
    }
    const result: CarResponseModel = await carService.detail(req.user, Number(req.params.carId));
    res.status(200).json(result);
  },

  // ✏️ 차량 수정
  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: '로그인이 필요합니다' });
      return;
    }
    const result: CarResponseModel = await carService.update(
      req.user,
      Number(req.params.carId),
      req.body,
    );
    res.status(200).json(result);
  },

  // 🗑 차량 삭제
  async delete(req: Request, res: Response): Promise<void> {
    const result = await carService.remove(req.user, Number(req.params.carId));
    res.status(200).json(result);
  },

  // 🚘 제조사-모델 목록 조회
  async getModels(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: '로그인이 필요합니다' });
      return;
    }
    const result = await carService.getModels();
    res.status(200).json({ data: result });
  },

  /** 🚚 차량 CSV 대용량 업로드 */
  async uploadCsv(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: '로그인이 필요합니다' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: '잘못된 요청입니다' });
      return;
    }

    const result = await carService.bulkUpload(req.user, req.file.path);

    res.status(200).json({
      message: `성공적으로 ${result.count}대 등록되었습니다.`,
    });
  },
};

export default carController;
