import { Router } from 'express';
import imageController from '../controllers/image-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadImage } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();

// 이미지 업로드 라우트 (메모리 기반 → Cloudinary)
router.post(
  '/upload',
  authenticate,
  uploadImage.single('file'),
  asyncHandler(imageController.uploadImage),
);

export default router;
