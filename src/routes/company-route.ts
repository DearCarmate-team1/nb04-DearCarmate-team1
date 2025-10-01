import { Router } from 'express';
import asyncHandler from 'src/configs/async-handler';
import companyController from 'src/controllers/company-controller';
import { createCompanySchema } from 'src/dtos/company-dto';
import { validate } from 'src/middlewares/validate';

const router = Router();

router.post('/', validate(createCompanySchema), asyncHandler(companyController.create));

export default router;
