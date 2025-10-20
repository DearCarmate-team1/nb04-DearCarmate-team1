export interface ErrorDetail {
  field: string;
  message: string;
}

// ✅ 추상 클래스: 모든 커스텀 에러의 부모
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: ErrorDetail[] | undefined;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, details?: ErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ✅ 개별 에러 클래스들
export class BadRequestError extends AppError {
  constructor(message = '잘못된 요청입니다.', details?: ErrorDetail[]) {
    super(message, 400, details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '접근 권한이 없습니다.') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = '리소스를 찾을 수 없습니다.') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = '데이터가 이미 존재합니다.') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends AppError {
  constructor(message = '서버 내부 오류가 발생했습니다.') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}
