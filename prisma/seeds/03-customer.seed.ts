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

  // 실제 고객 이름 리스트
  const customerNames = [
    { name: '이재훈', email: 'jaehoon.lee@example.com' },
    { name: '이봉준', email: 'bongjun.lee@example.com' },
    { name: '김현정', email: 'hyunjeong.kim@example.com' },
    { name: '송창준', email: 'changjun.song@example.com' },
    { name: '엄규리', email: 'gyuri.eom@example.com' },
    { name: '신경렬', email: 'gyeongyeol.shin@example.com' },
    { name: '박다슬', email: 'daseul.park@example.com' },
    { name: '이하영', email: 'hayoung.lee@example.com' },
    { name: '손준영', email: 'junyoung.son@example.com' },
    { name: '이상욱', email: 'sangwook.lee@example.com' },
    { name: '최은영', email: 'eunyoung.choi@example.com' },
    { name: '김동현', email: 'donghyun.kim@example.com' },
    { name: '김태회', email: 'taehee.kim@example.com' },
    { name: '조재후', email: 'jaehoo.jo@example.com' },
    { name: '전범주', email: 'beomjoo.jeon@example.com' },
    { name: '김혜연', email: 'hyeyeon.kim@example.com' },
    { name: '박형익', email: 'hyeongik.park@example.com' },
    { name: '홍준기', email: 'joongi.hong@example.com' },
    { name: '이준오', email: 'junoh.lee@example.com' },
    { name: '주예찬', email: 'yechan.joo@example.com' },
    { name: '이서진', email: 'seojin.lee@example.com' },
    { name: '김보경', email: 'bokyung.kim@example.com' },
    { name: '길도현', email: 'dohyun.gil@example.com' },
    { name: '심하원', email: 'hawon.shim@example.com' },
    { name: '이제창', email: 'jechang.lee@example.com' },
    { name: '김지헌', email: 'jihun.kim@example.com' },
    { name: '최홍기', email: 'honggi.choi@example.com' },
    { name: '홍주헌', email: 'jooheon.hong@example.com' },
    { name: '강영우', email: 'youngwoo.kang@example.com' },
    { name: '이진우', email: 'jinwoo.lee@example.com' },
    { name: '장재호', email: 'jaeho.jang@example.com' },
    { name: '신영현', email: 'younghyun.shin@example.com' },
    { name: '오진욱', email: 'jinwook.oh@example.com' },
    { name: '오연진', email: 'yeonjin.oh@example.com' },
    { name: '한가윤', email: 'gayoon.han@example.com' },
    { name: '양정민', email: 'jeongmin.yang@example.com' },
    { name: '김지희', email: 'jihee.kim@example.com' },
    { name: '김민수', email: 'minsoo.kim@example.com' },
    { name: '김하영', email: 'hayoung.kim@example.com' },
    { name: '곽민경', email: 'minkyung.kwak@example.com' },
    { name: '김산하', email: 'sanha.kim@example.com' },
  ];

  let nameIndex = 0;
  for (const company of companies) {
    const customerCount = Math.floor(Math.random() * 6) + 20; // 20~25명
    console.log(`🏢 ${company.name} (${company.authCode}) → ${customerCount}명 생성`);

    for (let i = 0; i < customerCount; i++) {
      const customerData = customerNames[nameIndex % customerNames.length];
      nameIndex++;

      const gender = genders[Math.floor(Math.random() * genders.length)];
      const phoneNumber = `010-${String(1000 + Math.floor(Math.random() * 9000))}-${String(1000 + Math.floor(Math.random() * 9000))}`;
      const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const memo = '최근 차량 상담 요청 이력 있음.';

      await prisma.customer.create({
        data: {
          name: customerData.name,
          gender,
          phoneNumber,
          ageGroup,
          region,
          email: customerData.email,
          memo,
          companyId: company.id,
        },
      });
    }
  }

  console.log('✅ Customer seed 완료');
}
