import { Router } from "express";
import { CustomerController } from "../controllers/customerController";
import { authenticate } from "../middlewares/authenticate";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();
const controller = new CustomerController();

router.post("/customers", authenticate, controller.create.bind(controller));
router.get("/customers", authenticate, controller.list.bind(controller));
router.get("/customers/:customerId", authenticate, controller.detail.bind(controller));
router.patch("/customers/:customerId", authenticate, controller.update.bind(controller));
router.delete("/customers/:customerId", authenticate, controller.delete.bind(controller));

// 대용량 업로드
router.post(
  "/customers/upload",
  authenticate,
  upload.single("file"), // 업로드 필드명
  controller.bulkUpload.bind(controller)
);

export default router;
