import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { uploadCarCsv } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';
import carController from '../controllers/car-controller.js';

import {
  createCarSchema,
  updateCarSchema,
  carQuerySchema,
  carIdParamSchema,
} from '../dtos/car-dto.js';

const router = Router();

// 🚗 차량 등록
router.post(
  '/',
  authenticate,
  validate(createCarSchema, 'body'),
  asyncHandler(carController.create),
);

// 📋 차량 목록
router.get(
  '/',
  authenticate,
  validate(carQuerySchema, 'query'),
  asyncHandler(carController.getAll),
);

// 🔍 차량 상세
router.get(
  '/:carId',
  authenticate,
  validate(carIdParamSchema, 'params'),
  asyncHandler(carController.getById),
);

// ✏️ 차량 수정
router.patch(
  '/:carId',
  authenticate,
  validate(updateCarSchema, 'body'),
  asyncHandler(carController.update),
);

// 🗑 차량 삭제
router.delete(
  '/:carId',
  authenticate,
  validate(carIdParamSchema, 'params'),
  asyncHandler(carController.delete),
);

// 🚘 제조사/모델 목록 (통합)
router.get('/models', authenticate, asyncHandler(carController.getModels));

router.post(
  '/upload',
  authenticate,
  uploadCarCsv.single('file'),
  asyncHandler(carController.uploadCsv),
);

export default router;
