import { PrismaClient, ContractStatus, CarType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seed() {
  console.log('Seeding contracts...');

  // 1. 기존 데이터 가져오기 (이전 시드 파일에서 생성됨)
  const company = await prisma.company.findFirst();
  const user = await prisma.user.findFirst();
  const customers = await prisma.customer.findMany({ take: 5 });
  const cars = await prisma.car.findMany({ take: 5 });

  if (!company || !user || customers.length < 5 || cars.length < 5) {
    console.error('⚠️ 필수 데이터(회사, 유저, 고객, 차량)가 부족하여 계약 시드를 생성할 수 없습니다.');
    return;
  }

  // 2. 샘플 계약 데이터 생성
  const contracts = [
    // --- 이번 달 완료된 계약 ---
    {
      status: ContractStatus.contractSuccessful,
      contractPrice: 35000000,
      resolutionDate: new Date(), // 오늘
      carId: cars[0].id,
      customerId: customers[0].id,
    },
    {
      status: ContractStatus.contractSuccessful,
      contractPrice: 22000000,
      resolutionDate: new Date(new Date().setDate(new Date().getDate() - 3)), // 3일 전
      carId: cars[1].id,
      customerId: customers[1].id,
    },
    // --- 지난 달 완료된 계약 ---
    {
      status: ContractStatus.contractSuccessful,
      contractPrice: 18000000,
      resolutionDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1달 전
      carId: cars[2].id,
      customerId: customers[2].id,
    },
    // --- 진행중인 계약 ---
    {
      status: ContractStatus.carInspection,
      contractPrice: 41000000,
      resolutionDate: null,
      carId: cars[3].id,
      customerId: customers[3].id,
    },
    {
      status: ContractStatus.priceNegotiation,
      contractPrice: 28000000,
      resolutionDate: null,
      carId: cars[4].id,
      customerId: customers[4].id,
    },
  ];

  // 3. 데이터베이스에 생성
  for (const contract of contracts) {
    await prisma.contract.create({
      data: {
        ...contract,
        companyId: company.id,
        userId: user.id,
      },
    });
  }

  console.log(`${contracts.length}개의 계약 데이터가 생성되었습니다.`);
}
