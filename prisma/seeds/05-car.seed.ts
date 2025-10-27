import { PrismaClient, CarStatus } from '@prisma/client';

const prisma = new PrismaClient();

function generateUniqueCarNumber(existingNumbers: Set<string>): string {
  const areaCodes = ['11', '23', '25', '30', '45', '50']; // 서울, 인천, 경기, 대전, 전북, 제주 등 예시
  const letters = [
    '가',
    '나',
    '다',
    '라',
    '마',
    '바',
    '사',
    '아',
    '자',
    '차',
    '카',
    '타',
    '파',
    '하',
  ];

  let newNumber = '';
  let attempts = 0;

  do {
    const area = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const digits = String(Math.floor(1000 + Math.random() * 9000)); // 1000~9999
    newNumber = `${area}${letter}${digits}`;
    attempts++;
  } while (existingNumbers.has(newNumber) && attempts < 10000);

  existingNumbers.add(newNumber);
  return newNumber;
}

export async function seed() {
  console.log('🚗 Car seed 시작');

  const companies = await prisma.company.findMany({
    where: { NOT: { authCode: 'ADMIN' } },
  });
  const carModels = await prisma.carModel.findMany();

  const explanations = [
    '매우 깨끗한 상태입니다.',
    '실내외 모두 관리가 잘 되어 있습니다.',
    '무사고 차량으로 성능이 우수합니다.',
    '정기점검이 완료된 차량입니다.',
    '엔진 및 미션 상태 모두 양호합니다.',
    '타이어 및 소모품 교체가 완료되었습니다.',
    '외관 스크래치 없이 깨끗한 차량입니다.',
  ];

  const usedCarNumbers = new Set<string>();

  for (const company of companies) {
    const numCars = Math.floor(Math.random() * 11) + 25; // 회사별 25~35대
    console.log(`🏢 ${company.name} (${company.authCode}) → ${numCars}대 생성`);

    for (let i = 0; i < numCars; i++) {
      const model = carModels[Math.floor(Math.random() * carModels.length)];
      const carNumber = generateUniqueCarNumber(usedCarNumbers);
      const manufacturingYear = 2015 + Math.floor(Math.random() * 10); // 2015~2024
      const mileage = 30000 + Math.floor(Math.random() * 80000); // 3만~11만 km
      const price = (800 + Math.floor(Math.random() * 2500)) * 10000; // 800~3300만원
      const accidentCount = Math.floor(Math.random() * 3); // 0~2회
      const randomDescription = explanations[Math.floor(Math.random() * explanations.length)];

      await prisma.car.create({
        data: {
          carNumber,
          manufacturingYear,
          mileage,
          price,
          accidentCount,
          explanation: `${model.manufacturer} ${model.model} (${manufacturingYear}년식, ${mileage.toLocaleString()}km). ${randomDescription}`,
          status: CarStatus.possession,
          modelId: model.id,
          companyId: company.id,
        },
      });
    }
  }

  console.log('✅ Car seed 완료');
}
