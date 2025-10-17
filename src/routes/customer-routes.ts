import { Router } from "express";
import { CustomerController } from "../controllers/customer-controller";
import { authenticate } from "../middlewares/authenticate";
import { upload } from "../middlewares/upload-middleware";

const router = Router();
const controller = new CustomerController();

// 고객 등록
router.post("/", authenticate, controller.create.bind(controller));

// 고객 목록 조회
router.get("/", authenticate, controller.list.bind(controller));

// 고객 상세 조회
router.get("/:customerId", authenticate, controller.detail.bind(controller));

// 고객 수정
router.patch("/:customerId", authenticate, controller.update.bind(controller));

// 고객 삭제
router.delete("/:customerId", authenticate, controller.delete.bind(controller));

// 대용량 업로드
router.post(
  "/upload",
  authenticate,
  upload.single("file"), // 업로드 필드명
  controller.bulkUpload.bind(controller)
);

export default router;
