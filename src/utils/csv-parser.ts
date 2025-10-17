import { parse } from 'csv-parse/sync';
import fs from 'fs';
import type { CarCsvRow } from '../types/car.js';

/**
 * CSV 파일 파싱 유틸리티
 * - 파일 시스템 접근과 CSV 파싱 책임 분리
 * - BOM 제거 처리
 */
export const csvParser = {
  /**
   * CSV 파일을 읽고 파싱하여 CarCsvRow 배열 반환
   * @param filePath - CSV 파일 경로 (검증 완료된 값)
   * @returns CarCsvRow[]
   */
  parseCars(filePath: string): CarCsvRow[] {
    // BOM 제거 후 파일 읽기
    const csvText = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

    return parse<CarCsvRow>(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  },
};
