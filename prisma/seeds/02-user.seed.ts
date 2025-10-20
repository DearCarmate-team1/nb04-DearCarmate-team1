import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers() {
  const hashedAdminPassword = await bcrypt.hash('admin1234', 10);
  const hashedUserPassword = await bcrypt.hash('password', 10);

  // ✅ 플랫폼 관리자
  const adminCompany = await prisma.company.findUnique({ where: { authCode: 'ADMIN' } });
  if (!adminCompany) throw new Error('ADMIN company not found');

  await prisma.user.upsert({
    where: { email: 'admin@dearcarmate.com' },
    update: {},
    create: {
      name: '시스템관리자',
      email: 'admin@dearcarmate.com',
      password: hashedAdminPassword,
      employeeNumber: '00001',
      phoneNumber: '010-0000-0000',
      isAdmin: true,
      companyId: adminCompany.id,
    },
  });

  // ✅ 각 회사별 대표 및 직원 생성
  const companies = await prisma.company.findMany({ where: { NOT: { authCode: 'ADMIN' } } });

  for (const company of companies) {
    const companyCode = company.authCode.toLowerCase();

    // 대표
    await prisma.user.upsert({
      where: { email: `admin@${companyCode}.com` },
      update: {},
      create: {
        name: `${company.name} 대표`,
        email: `admin@${companyCode}.com`,
        password: hashedUserPassword,
        employeeNumber: `${company.id}0001`,
        phoneNumber: '010-1111-1111',
        companyId: company.id,
      },
    });

    // 직원 (5~8명)
    const employeeCount = Math.floor(Math.random() * 4) + 5;
    for (let i = 1; i <= employeeCount; i++) {
      await prisma.user.upsert({
        where: { email: `user${i}@${companyCode}.com` },
        update: {},
        create: {
          name: `${company.name} 직원${i}`,
          email: `user${i}@${companyCode}.com`,
          password: hashedUserPassword,
          employeeNumber: `${company.id}${2000 + i}`,
          phoneNumber: `010-${2200 + i}-${1000 + i}`,
          companyId: company.id,
        },
      });
    }
  }

  console.log('👥 User seed 완료');
}
