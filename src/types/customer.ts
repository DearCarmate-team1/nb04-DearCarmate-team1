/** 👤 고객 CSV 업로드용 Row 타입 */
export interface CustomerCsvRow {
  name: string;
  gender: string;
  phoneNumber: string;
  ageGroup?: string;
  region?: string;
  email?: string;
  memo?: string;
}

/** 📤 고객 대용량 업로드 결과 */
export interface CustomerBulkUploadResult {
  successCount: number;
  failureCount: number;
  failures: Array<{
    row: number;
    phoneNumber: string;
    reason: string;
  }>;
}
