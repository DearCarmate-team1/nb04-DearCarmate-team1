import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import companyController from '../controllers/company-controller.js';
import {
  createCompanySchema,
  getCompaniesSchema,
  companyIdParamsSchema,
  updateCompanySchema,
} from '../dtos/company-dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createCompanySchema, 'body'),
  asyncHandler(companyController.create),
);
router.get(
  '/',
  authenticate,
  validate(getCompaniesSchema, 'query'),
  asyncHandler(companyController.getAll),
);

router.patch(
  '/:companyId',
  authenticate,
  validate(companyIdParamsSchema, 'params'),
  validate(updateCompanySchema, 'body'),
  asyncHandler(companyController.update),
);

router.delete(
  '/:companyId',
  authenticate,
  validate(companyIdParamsSchema, 'params'),
  asyncHandler(companyController.delete),
);
export default router;
