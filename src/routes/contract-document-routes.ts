import { Router } from "express";
import { ContractDocumentController } from "../controllers/contract-document-controller";
import { authenticate } from "../middlewares/authenticate";
import { upload } from "../middlewares/upload-middleware";
import asyncHandler from "../configs/async-handler.js";

const router = Router();
const controller = new ContractDocumentController();

router.get("/", authenticate, asyncHandler(controller.list.bind(controller)));

router.get("/drafts", authenticate, asyncHandler(controller.draftList.bind(controller)));

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  asyncHandler(controller.upload.bind(controller))
);

router.get(
  "/:contractDocumentId/download",
  authenticate,
  asyncHandler(controller.download.bind(controller))
);

export default router;