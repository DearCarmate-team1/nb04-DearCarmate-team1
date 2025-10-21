import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seed() {
  console.log('👥 Customer seed 시작');

  const companies = await prisma.company.findMany({
    where: { NOT: { authCode: 'ADMIN' } },
  });

  const genders = ['male', 'female'];
  const ageGroups = ['10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대'];
  const regions = [
    '서울',
    '경기',
    '인천',
    '강원',
    '충북',
    '충남',
    '세종',
    '대전',
    '전북',
    '전남',
    '광주',
    '경북',
    '경남',
    '대구',
    '울산',
    '부산',
    '제주',
  ];
  const lastNames = ['김', '이', '박', '최', '정', '윤', '조', '한', '오', '서', '신', '권', '황'];
  const firstNames = [
    '민준',
    '서연',
    '지후',
    '하은',
    '도윤',
    '서준',
    '예은',
    '시우',
    '수민',
    '지유',
    '하린',
    '유진',
    '현우',
    '지민',
    '윤서',
    '건우',
  ];

  for (const company of companies) {
    const customerCount = Math.floor(Math.random() * 6) + 10; // 10~15명
    console.log(`🏢 ${company.name} (${company.authCode}) → ${customerCount}명 생성`);

    for (let i = 0; i < customerCount; i++) {
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const name = `${lastNames[Math.floor(Math.random() * lastNames.length)]}${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
      const phoneNumber = `010-${String(1000 + Math.floor(Math.random() * 9000))}-${String(1000 + Math.floor(Math.random() * 9000))}`;
      const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const email = `${name.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
      const memo = '최근 차량 상담 요청 이력 있음.';

      await prisma.customer.create({
        data: {
          name,
          gender,
          phoneNumber,
          ageGroup,
          region,
          email,
          memo,
          companyId: company.id,
        },
      });
    }
  }

  console.log('✅ Customer seed 완료');
}
