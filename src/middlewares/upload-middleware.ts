import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/contracts",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("유효하지 않은 파일 형식입니다"));
    }
    cb(null, true);
  },
});
