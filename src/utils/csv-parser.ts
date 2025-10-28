import { parse } from 'csv-parse';
import fs from 'fs';

export const csvParser = {
  /** 메모리 버퍼에서 CSV 파싱 */
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

  /** 파일 경로에서 CSV 파싱 */
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
