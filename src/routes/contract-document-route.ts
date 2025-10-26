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

router.get(
  "/:contractDocumentId/download",
  authenticate,
  asyncHandler(controller.download)
);

export default router;