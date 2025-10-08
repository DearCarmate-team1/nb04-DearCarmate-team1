import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import companyController from '../controllers/company-controller.js';
import {
  createCompanySchema,
  getCompaniesSchema,
  companyIdParamsSchema,
  updateCompanySchema,
  getUsersByCompanySchema,
} from '../dtos/company-dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// 회사 등록
router.post(
  '/',
  authenticate,
  validate(createCompanySchema, 'body'),
  asyncHandler(companyController.create),
);

// 회사 목록 조회
router.get(
  '/',
  authenticate,
  validate(getCompaniesSchema, 'query'),
  asyncHandler(companyController.getAll),
);

// 회사별 유저 조회
router.get(
  '/users',
  authenticate,
  validate(getUsersByCompanySchema, 'query'),
  asyncHandler(companyController.getUsersByCompany),
);

// 회사 수정
router.patch(
  '/:companyId',
  authenticate,
  validate(companyIdParamsSchema, 'params'),
  validate(updateCompanySchema, 'body'),
  asyncHandler(companyController.update),
);

// 회사 삭제
router.delete(
  '/:companyId',
  authenticate,
  validate(companyIdParamsSchema, 'params'),
  asyncHandler(companyController.delete),
);

export default router;
