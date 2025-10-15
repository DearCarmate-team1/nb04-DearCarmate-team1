// src/utils/generate-sample-car-csv.ts
import fs from 'fs';
import path from 'path';
import type { CarCsvRow } from '../src/types/car.js';

const SAMPLE_DATA: CarCsvRow[] = [
  {
    carNumber: '12가3456',
    manufacturer: '기아',
    model: 'K5',
    manufacturingYear: '2020',
    mileage: '35000',
    price: '22000000',
    accidentCount: '0',
    explanation: '무사고 차량, 실내 청결',
    accidentDetails: '',
  },
  {
    carNumber: '23나6789',
    manufacturer: '현대',
    model: '아반떼',
    manufacturingYear: '2021',
    mileage: '18000',
    price: '19000000',
    accidentCount: '1',
    explanation: '경미한 접촉사고 수리 완료',
    accidentDetails: '앞범퍼 교체',
  },
  {
    carNumber: '45다9876',
    manufacturer: 'BMW',
    model: '320i',
    manufacturingYear: '2019',
    mileage: '55000',
    price: '33000000',
    accidentCount: '0',
    explanation: '정비 이력 완벽, 실주행 차량',
    accidentDetails: '',
  },
];

// CSV 문자열 생성
const headers = Object.keys(SAMPLE_DATA[0]);
const csvRows = [
  headers.join(','), // 첫 줄 헤더
  ...SAMPLE_DATA.map((row) => headers.map((h) => `"${(row as any)[h] ?? ''}"`).join(',')),
];

// 파일 경로 설정
const outputPath = path.resolve('./tests/sample-car.csv');

// 파일 쓰기
fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');

console.log(`✅ 샘플 CSV 파일 생성 완료: ${outputPath}`);
