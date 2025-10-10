import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import userController from '../controllers/user-controller.js';
// import { createUserSchema, updateUserSchema } from '../dtos/user-dto.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// router.post('/', validate(createUserSchema), asyncHandler(userController.createUser));
router.post('/', asyncHandler(userController.createUser)); // 유효성 검사 임시 비활성화

router.get('/me', asyncHandler(userController.getMe)); // /:id 보다 위에 위치해야 함
router.patch('/me', asyncHandler(userController.updateMe)); // /:id 보다 위에 위치해야 함
router.delete('/me', asyncHandler(userController.deleteMe)); // /:id 보다 위에 위치해야 함

// admin 계정 관리자 기능을 위해 남겨둠
router.get('/:id', asyncHandler(userController.getUserById));
// router.patch('/:id', validate(updateUserSchema), asyncHandler(userController.updateUser));
router.patch('/:id', asyncHandler(userController.updateUser)); // 유효성 검사 임시 비활성화
router.delete('/:id', asyncHandler(userController.deleteUser));

export default router;
