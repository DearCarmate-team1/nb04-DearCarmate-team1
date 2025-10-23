/**
 * 인증된 사용자 정보
 *
 * JWT 토큰 검증 후 authenticate 미들웨어에서 req.user에 할당
 * Prisma User 엔티티에서 추출한 필수 인증 정보만 포함
 */
export interface AuthUser {
  /** 사용자 고유 ID */
  id: number;

  /**
   * 관리자 여부
   * true인 경우 회사 생성/수정/삭제 등 관리자 권한 필요 작업 수행 가능
   */
  isAdmin: boolean;

  /**
   * 소속 회사 ID (멀티테넌시)
   * 대부분의 리소스는 companyId로 격리되어 관리됨
   */
  companyId: number;
}
