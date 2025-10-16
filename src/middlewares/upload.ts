import multer from 'multer';

// 파일을 메모리에 임시 저장
const storage = multer.memoryStorage();

// multer 인스턴스 생성
export const upload = multer({ storage});