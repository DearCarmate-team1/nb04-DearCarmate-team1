import { Router } from 'express';
import imageController from '../controllers/image-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';
import  asyncHandler from '../configs/async-handler.js';

const router = Router();

// 이미지 업로드 라우트
router.post('/upload', authenticate, upload.single('file'), asyncHandler(imageController.uploadImage));

export default router;