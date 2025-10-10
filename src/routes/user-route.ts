import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import userController from '../controllers/user-controller.js';
import { createUserSchema, updateUserSchema } from '../dtos/user-dto.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post('/', validate(createUserSchema), asyncHandler(userController.createUser));

// ------유저(자신) 개인정보 조회, 수정 API ------
router.get('/me', asyncHandler(userController.getMe)); // /:id 보다 위에 위치해야 함
router.patch('/me', validate(updateUserSchema), asyncHandler(userController.updateMe)); // /:id 보다 위에 위치해야 함
router.delete('/me', asyncHandler(userController.deleteMe)); // /:id 보다 위에 위치해야 함

// ------ 관리자용 API ------
router.get('/:id', asyncHandler(userController.getUserById));
router.patch('/:id', asyncHandler(userController.updateUser));
router.delete('/:id', asyncHandler(userController.deleteUser));

export default router;
