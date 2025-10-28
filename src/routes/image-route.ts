import { Router } from 'express';
import imageController from '../controllers/image-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadImage } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();

/**
 * @swagger
 * /images/upload:
 *   post:
 *     summary: 범용 이미지 업로드
 *     description: 이미지를 서버(Cloudinary)에 업로드하고, 해당 이미지의 URL을 반환합니다. 프로필 사진 등에 사용됩니다.
 *     tags: [Image]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       201:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *                   example: "http://res.cloudinary.com/demo/image/upload/v1625812345/sample.jpg"
 *       400:
 *         description: 파일이 첨부되지 않음
 *       401:
 *         description: 인증 실패
 */
router.post(
  '/upload',
  authenticate,
  uploadImage.single('file'),
  asyncHandler(imageController.uploadImage),
);

export default router;