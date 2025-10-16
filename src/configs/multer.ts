import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ✅ 업로드 루트 경로
const BASE_UPLOAD_DIR = path.resolve('uploads');

// ✅ 업로드 폴더 자동 생성
const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ✅ 공통 스토리지 생성 함수
const makeStorage = (subDir: string) => {
  const uploadPath = path.join(BASE_UPLOAD_DIR, subDir);
  ensureDirExists(uploadPath);

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadPath),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });
};

// ✅ CSV 파일 전용 필터
const csvFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  // CSV 파일 확장자 또는 MIME 타입 체크
  const allowedMimes = ['text/csv', 'application/csv', 'text/plain'];
  const allowedExtensions = ['.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedMimes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
    return cb(new Error('CSV 파일만 업로드할 수 있습니다.'));
  }
  cb(null, true);
};

// ✅ 이미지 / 계약서 전용 필터
const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.mimetype)) {
    return cb(new Error('이미지 또는 PDF만 업로드할 수 있습니다.'));
  }
  cb(null, true);
};

// ✅ 차량 CSV 업로드 전용
export const uploadCarCsv = multer({
  storage: makeStorage('cars'),
  fileFilter: csvFilter,
});

// ✅ 고객 CSV 업로드 전용
export const uploadCustomerCsv = multer({
  storage: makeStorage('customers'),
  fileFilter: csvFilter,
});

// ✅ 계약서 / 이미지 업로드 전용
export const uploadContractDoc = multer({
  storage: makeStorage('contracts'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
});

// ✅ 필요 시 파일 타입별 확장 가능
// export const uploadProfileImage = multer({ storage: makeStorage('profiles'), fileFilter: imageFilter });
