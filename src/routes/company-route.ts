import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import companyController from '../controllers/company-controller.js';
import { createCompanySchema, getCompaniesSchema } from '../dtos/company-dto.js';
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

export default router;
