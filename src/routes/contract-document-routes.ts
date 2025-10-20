import { Router } from "express";
import { ContractDocumentController } from "../controllers/contract-document-controller";
import { authenticate } from "../middlewares/authenticate";
import { upload } from "../middlewares/upload-middleware";

const router = Router();
const controller = new ContractDocumentController();

// 계약서 목록 조회
router.get("/", authenticate, controller.list.bind(controller));

// 계약서 업로드 시 계약 목록 조회
router.get("/draft", authenticate, controller.draftList.bind(controller));

// 계약서 업로드
router.post(
  "/upload",
  authenticate,
  upload.single("contractDocument"),
  controller.upload.bind(controller)
);

// 계약서 다운로드
router.get(
  "/:contractDocumentId/download",
  authenticate,
  controller.download.bind(controller)
);

export default router;
