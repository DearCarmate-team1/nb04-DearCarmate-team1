import { Router } from 'express';
import contractDocumentController from '../controllers/contract-document-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload-middleware.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(contractDocumentController.list));
router.get('/drafts', authenticate, asyncHandler(contractDocumentController.draftList));
router.post('/:contractId/upload', upload.single('file'), contractDocumentController.upload);

router.get(
  '/:contractDocumentId/download',
  authenticate,
  asyncHandler(contractDocumentController.download)
);

export default router;
