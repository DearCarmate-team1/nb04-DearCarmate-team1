import multer from 'multer';
import path from 'path';

/** 한글 파일명 디코딩 (latin1 → utf8) */
export function decodeFileName(originalName: string): string {
  return Buffer.from(originalName, 'latin1').toString('utf8');
}

/** 디코딩된 파일명으로 안전한 파일명 생성 */
export function generateSafeFileNameFromDecoded(decodedName: string): string {
  const ext = path.extname(decodedName);
  const basename = path.basename(decodedName, ext);

  // 파일 시스템 금지 문자만 제거: < > : " / \ | ? * 및 제어문자
  const sanitized = basename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();

  const timestamp = Date.now();
  return `${timestamp}_${sanitized}${ext}`;
}

/** CSV 파일 전용 필터 */
const csvFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimes = ['text/csv', 'application/csv', 'text/plain'];
  const allowedExtensions = ['.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedMimes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
    return cb(new Error('CSV 파일만 업로드할 수 있습니다.'));
  }
  cb(null, true);
};

/** 이미지 전용 필터 (PNG, JPEG만) */
const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype)) {
    return cb(new Error('PNG 또는 JPEG 이미지만 업로드할 수 있습니다.'));
  }
  cb(null, true);
};

/** 문서 필터 (PDF, DOC, DOCX) */
const documentFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(decodeFileName(file.originalname)).toLowerCase();

  if (!allowedMimes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
    return cb(new Error('PDF, DOC, DOCX 파일만 업로드할 수 있습니다.'));
  }
  cb(null, true);
};

/** CSV 업로드 (메모리 전용) */
export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  fileFilter: csvFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/** 이미지 업로드 (메모리 전용) */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

/** 문서 업로드 (메모리 전용) */
export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  fileFilter: documentFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1,
  },
});
