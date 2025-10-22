import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../configs/async-handler.js';
import contractController from '../controllers/contract-controller.js';

import {
  createContractSchema,
  updateContractSchema,
  contractQuerySchema,
  contractIdParamSchema,
} from '../dtos/contract-dto.js';

const router = Router();

// 📝 계약 등록
router.post(
  '/',
  authenticate,
  validate(createContractSchema, 'body'),
  asyncHandler(contractController.create),
);

// 📋 계약 목록 조회 (칸반 형태)
router.get(
  '/',
  authenticate,
  validate(contractQuerySchema, 'query'),
  asyncHandler(contractController.list),
);

// 🚗 계약용 차량 목록 조회
router.get('/cars', authenticate, asyncHandler(contractController.getCarsForContract));

// 👥 계약용 고객 목록 조회
router.get('/customers', authenticate, asyncHandler(contractController.getCustomersForContract));

// 👤 계약용 유저 목록 조회
router.get('/users', authenticate, asyncHandler(contractController.getUsersForContract));

// ✏️ 계약 수정
router.patch(
  '/:contractId',
  authenticate,
  validate(contractIdParamSchema, 'params'),
  validate(updateContractSchema, 'body'),
  asyncHandler(contractController.update),
);

// 🗑️ 계약 삭제
router.delete(
  '/:contractId',
  authenticate,
  validate(contractIdParamSchema, 'params'),
  asyncHandler(contractController.delete),
);

export default router;
