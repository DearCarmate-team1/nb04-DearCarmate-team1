import { Router } from 'express';
import { contractDocumentController as controller } from '../controllers/contract-document-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadDocument } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();

router.get("/", authenticate, asyncHandler(controller.list));

router.get("/draft", authenticate, asyncHandler(controller.draftList));

router.post(
  '/upload',
  authenticate,
  uploadDocument.single('file'),
  asyncHandler(controller.upload)
);

// 토큰 기반 다운로드 (이메일 링크용 - 인증 불필요)
router.get(
  "/download",
  asyncHandler(controller.downloadWithToken)
);

// 인증 필요한 다운로드 (기존)
router.get(
  "/:contractDocumentId/download",
  authenticate,
  asyncHandler(controller.download)
);

export default router;
