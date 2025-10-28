import { Router } from 'express';
import contractDocumentController from '../controllers/contract-document-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadDocument } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();

router.get("/", authenticate, asyncHandler(contractDocumentController.list));

router.get("/draft", authenticate, asyncHandler(contractDocumentController.draftList));

router.post(
  '/upload',
  authenticate,
  uploadDocument.single('file'),
  asyncHandler(contractDocumentController.upload)
);

router.get(
  "/download",
  asyncHandler(contractDocumentController.downloadWithToken)
);

router.get(
  "/:contractDocumentId/download",
  authenticate,
  asyncHandler(contractDocumentController.download)
);

export default router;
