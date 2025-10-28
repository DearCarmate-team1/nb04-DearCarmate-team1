/** 인증된 사용자 정보 */
export interface AuthUser {
  /** 사용자 고유 ID */
  id: number;
  /** 관리자 여부 */
  isAdmin: boolean;
  /** 소속 회사 ID */
  companyId: number;
}
