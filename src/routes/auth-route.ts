import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import authController from '../controllers/auth-controller.js';
import { loginSchema, refreshSchema } from '../dtos/auth-dto.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));

export default router;
