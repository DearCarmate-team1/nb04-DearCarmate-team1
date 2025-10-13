import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import userController from '../controllers/user-controller.js';
import { createUserSchema, updateUserSchema } from '../dtos/user-dto.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/', validate(createUserSchema), asyncHandler(userController.createUser));

router.get('/me', authenticate, asyncHandler(userController.getMe));
router.patch('/me', authenticate, validate(updateUserSchema), asyncHandler(userController.updateMe));
router.delete('/me', authenticate, asyncHandler(userController.deleteMe));

// ------ 관리자용 API ------
router.get('/:id', asyncHandler(userController.getUserById));
router.patch('/:id', asyncHandler(userController.updateUser));
router.delete('/:id', asyncHandler(userController.deleteUser));

export default router;
