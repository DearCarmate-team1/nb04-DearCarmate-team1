import { Router } from 'express';
import { contractDocumentController as controller } from '../controllers/contract-document-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadDocument } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();


router.get("/", authenticate, asyncHandler(controller.list.bind(controller)));

router.get("/draft", authenticate, asyncHandler(controller.draftList.bind(controller)));

router.post(
  '/upload',
  authenticate,
  uploadDocument.single('file'),
  asyncHandler(controller.upload.bind(controller))
);

router.get(
  "/:contractDocumentId/download",
  authenticate,
  asyncHandler(controller.download.bind(controller))
);

export default router;