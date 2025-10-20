import { parse } from 'csv-parse';
import fs from 'fs';

/**
 * CSV 파싱 유틸리티
 * - 메모리 버퍼 또는 파일 경로에서 파싱
 * - BOM 제거 처리
 * - 비동기 파싱으로 논블로킹 처리
 */
export const csvParser = {
  /**
   * 메모리 버퍼에서 CSV 파싱 (제네릭, 비동기)
   * @param buffer - 파일 버퍼
   * @returns Promise<T[]>
   */
  async parseFromBuffer<T>(buffer: Buffer): Promise<T[]> {
    const csvText = buffer.toString('utf8').replace(/^\uFEFF/, '');

    return new Promise((resolve, reject) => {
      parse(
        csvText,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (error, records: T[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(records);
          }
        },
      );
    });
  },

  /**
   * 파일 경로에서 CSV 파싱 (제네릭, 비동기)
   * @param filePath - CSV 파일 경로
   * @returns Promise<T[]>
   */
  async parseFromFile<T>(filePath: string): Promise<T[]> {
    const csvText = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

    return new Promise((resolve, reject) => {
      parse(
        csvText,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (error, records: T[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(records);
          }
        },
      );
    });
  },
};
