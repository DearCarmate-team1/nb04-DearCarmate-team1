import { Router } from 'express';
import asyncHandler from '../configs/async-handler';
import companyController from '../controllers/company-controller';
import { createCompanySchema } from '../dtos/company-dto';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/', validate(createCompanySchema), asyncHandler(companyController.create));

export default router;
