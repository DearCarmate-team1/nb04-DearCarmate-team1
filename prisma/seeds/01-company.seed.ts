import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCompanies() {
  const companies = [
    { name: '햇살카', authCode: 'SUNSHINE' },
    { name: '케이카', authCode: 'KCAR' },
    { name: '굿모닝카', authCode: 'GOODMORNING' },
    { name: '행복카', authCode: 'HAPPY' },
    { name: '믿음카', authCode: 'TRUST' },
    { name: '신뢰카', authCode: 'RELIABLE' },
    { name: '우리카', authCode: 'OURCAR' },
    { name: '미래카', authCode: 'FUTURE' },
    { name: '시스템관리', authCode: 'ADMIN' },
  ];

  for (const c of companies) {
    await prisma.company.upsert({
      where: { authCode: c.authCode },
      update: {},
      create: {
        name: c.name,
        authCode: c.authCode,
      },
    });
  }

  console.log('🏢 Company seed 완료');
}
