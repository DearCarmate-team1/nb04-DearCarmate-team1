import multer from 'multer';
import path from 'path';

// ========================================
// 공통 유틸리티
// ========================================

/**
 * 한글 파일명 디코딩 (latin1 → utf8)
 * Multer는 파일명을 latin1로 인코딩하므로 한글 처리를 위해 디코딩 필요
 */
export function decodeFileName(originalName: string): string {
  return Buffer.from(originalName, 'latin1').toString('utf8');
}

/**
 * 타임스탬프 기반 안전한 파일명 생성
 * - 한글 파일명 디코딩
 * - 특수문자 제거 (알파벳, 숫자, 한글, 공백, .-_ 만 허용)
 * - 타임스탬프 추가로 중복 방지
 */
export function generateSafeFileName(originalName: string): string {
  const decoded = decodeFileName(originalName);
  const timestamp = Date.now();
  const sanitized = decoded.replace(/[^a-zA-Z0-9가-힣.\s_-]/g, '_');
  return `${timestamp}_${sanitized}`;
}

// ========================================
// 파일 필터 정의
// ========================================

/**
 * CSV 파일 전용 필터
 * - 용도: 차량/고객 대용량 업로드
 */
const csvFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimes = ['text/csv', 'application/csv', 'text/plain'];
  const allowedExtensions = ['.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedMimes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
    return cb(new Error('CSV 파일만 업로드할 수 있습니다.'));
  }
  cb(null, true);
};

/**
 * 이미지 전용 필터 (PNG, JPEG만)
 * - 용도: 프로필 이미지, 차량 이미지 등
 */
const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype)) {
    return cb(new Error('PNG 또는 JPEG 이미지만 업로드할 수 있습니다.'));
  }
  cb(null, true);
};

/**
 * 문서 필터 (PDF, DOC, DOCX)
 * - 용도: 계약서 문서
 * - 한글 파일명 지원
 */
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

// ========================================
// Multer 인스턴스 (모두 메모리 기반)
// ========================================

/**
 * CSV 업로드 (메모리 전용)
 * - 개발/프로덕션: 메모리 → 파싱 → DB 저장
 * - 디스크 저장 안 함
 */
export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  fileFilter: csvFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * 이미지 업로드 (메모리 전용)
 * - 개발: 메모리 → 로컬 저장 (service에서 처리)
 * - 프로덕션: 메모리 → Cloudinary (service에서 처리)
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

/**
 * 문서 업로드 (메모리 전용)
 * - 개발: 메모리 → 로컬 저장 (service에서 처리)
 * - 프로덕션: 메모리 → Cloudinary (service에서 처리)
 */
export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  fileFilter: documentFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1,
  },
});
