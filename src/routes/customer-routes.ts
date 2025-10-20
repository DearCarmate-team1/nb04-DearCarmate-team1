import { Router } from 'express';
import { CustomerController } from '../controllers/customer-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadCsv } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();
const controller = new CustomerController();

// 고객 등록
router.post('/', authenticate, asyncHandler(controller.create.bind(controller)));

// 고객 목록 조회
router.get('/', authenticate, asyncHandler(controller.list.bind(controller)));

// 고객 상세 조회
router.get('/:customerId', authenticate, asyncHandler(controller.detail.bind(controller)));

// 고객 수정
router.patch('/:customerId', authenticate, asyncHandler(controller.update.bind(controller)));

// 고객 삭제
router.delete('/:customerId', authenticate, asyncHandler(controller.delete.bind(controller)));

// 📤 고객 CSV 대용량 업로드 (메모리 기반 - 디스크 저장 안 함)
router.post(
  '/upload',
  authenticate,
  uploadCsv.single('file'),
  asyncHandler(controller.bulkUpload.bind(controller)),
);

export default router;
