import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/contracts",
  filename: (req, file, cb) => {
    // Buffer를 UTF-8로 디코딩하여 한글 파일명 보존
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    // 한글 파일명 디코딩
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(originalName).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("유효하지 않은 파일 형식입니다"));
    }
    cb(null, true);
  },
});
