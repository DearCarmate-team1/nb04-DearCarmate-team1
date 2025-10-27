import { PrismaClient, ContractStatus, CarStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 계약 상태에 따른 차량 상태 결정
 */
function getCarStatusFromContractStatus(contractStatus: ContractStatus): CarStatus {
  switch (contractStatus) {
    case 'carInspection':
    case 'priceNegotiation':
    case 'contractDraft':
      return 'contractProceeding';
    case 'contractSuccessful':
      return 'contractCompleted';
    case 'contractFailed':
      return 'possession';
    default:
      return 'contractProceeding';
  }
}

/**
 * 계약 시드 생성 함수
 * - 각 일반 회사별로 계약 생성 (시스템관리 회사 제외)
 * - 보유 중인 모든 차량에 대해 계약 생성
 * - 5가지 계약 상태별로 균등 분배
 * - 차량 상태도 계약 상태에 맞게 자동 업데이트
 */
export async function seed() {
  console.log('📋 Contract seed 시작');

  // 1. 시스템관리 회사 제외한 일반 회사만 조회
  const companies = await prisma.company.findMany({
    where: { NOT: { authCode: 'ADMIN' } },
    include: {
      User: true,
      Customer: true,
      cars: {
        where: { status: 'possession' }, // 보유 중인 차량만
      },
    },
  });

  let totalContractsCreated = 0;

  // 2. 각 회사별로 계약 생성
  for (const company of companies) {
    console.log(`🏢 ${company.name} (${company.authCode}) 계약 생성 중...`);

    // 회사의 직원 중 랜덤으로 담당자 선택 (대표 포함)
    const users = company.User;
    const customers = company.Customer;
    const cars = company.cars;

    if (users.length === 0 || customers.length === 0 || cars.length === 0) {
      console.log(
        `  ⚠️ 데이터 부족 (직원: ${users.length}, 고객: ${customers.length}, 차량: ${cars.length}) - 스킵`,
      );
      continue;
    }

    // 3. 차량 개수에 맞춰 계약 상태별로 균등 분배
    const contractStatuses: ContractStatus[] = [
      'carInspection',
      'priceNegotiation',
      'contractDraft',
      'contractSuccessful',
      'contractFailed',
    ];

    // 각 상태별로 생성할 계약 개수 계산 (차량 개수를 5로 나눔, 최대 6개로 제한)
    const contractsPerStatus = Math.min(6, Math.floor(cars.length / contractStatuses.length));
    const totalContractsToCreate = contractsPerStatus * contractStatuses.length;
    const unusedCars = cars.length - totalContractsToCreate;

    console.log(
      `  📊 차량 ${cars.length}대 → 계약 ${totalContractsToCreate}개 생성 (각 상태별 ${contractsPerStatus}개, 미사용 ${unusedCars}대)`,
    );

    let carIndex = 0; // 차량 인덱스 (순차 할당)

    for (let statusIdx = 0; statusIdx < contractStatuses.length; statusIdx++) {
      const status = contractStatuses[statusIdx];
      // 각 상태별로 동일하게 contractsPerStatus개씩 생성 (최대 6개)
      const count = contractsPerStatus;

      for (let i = 0; i < count; i++) {
        if (carIndex >= cars.length) break;

        const user = users[Math.floor(Math.random() * users.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const car = cars[carIndex];
        carIndex++;

        // 계약 가격은 차량 가격 ±10% 범위 내 랜덤
        const priceVariation = Math.floor(Math.random() * 0.2 * car.price) - 0.1 * car.price;
        const contractPrice = Math.max(car.price + priceVariation, 100000); // 최소 10만원

        // resolutionDate 설정 (성공/실패만 해당)
        let resolutionDate: Date | null = null;
        if (status === 'contractSuccessful' || status === 'contractFailed') {
          const daysAgo = Math.floor(Math.random() * 90); // 0~90일 전
          resolutionDate = new Date();
          resolutionDate.setDate(resolutionDate.getDate() - daysAgo);
        }

        // 미팅 데이터 (진행 중인 계약에만 추가)
        const meetings: any[] = [];
        if (status === 'carInspection' || status === 'priceNegotiation' || status === 'contractDraft') {
          const meetingCount = Math.floor(Math.random() * 2) + 1; // 1~2개
          for (let m = 0; m < meetingCount; m++) {
            const daysFromNow = Math.floor(Math.random() * 14) + 1; // 1~14일 후
            const meetingDate = new Date();
            meetingDate.setDate(meetingDate.getDate() + daysFromNow);

            const alarmCount = Math.floor(Math.random() * 3); // 0~2개 알림
            const notifications = [];
            for (let a = 0; a < alarmCount; a++) {
              const alarmDate = new Date(meetingDate);
              alarmDate.setHours(alarmDate.getHours() - (a + 1) * 24); // 1일전, 2일전
              notifications.push({
                alarmTime: alarmDate,
              });
            }

            meetings.push({
              date: meetingDate,
              notifications: {
                create: notifications,
              },
            });
          }
        }

        // 계약 생성
        await prisma.contract.create({
          data: {
            status,
            contractPrice: Math.floor(contractPrice),
            resolutionDate,
            carId: car.id,
            userId: user.id,
            customerId: customer.id,
            companyId: company.id,
            meetings: {
              create: meetings,
            },
          },
        });

        // 차량 상태 업데이트
        const carStatus = getCarStatusFromContractStatus(status);
        await prisma.car.update({
          where: { id: car.id },
          data: { status: carStatus },
        });

        totalContractsCreated++;
      }
    }

    console.log(`  ✅ ${company.name}: 계약 ${carIndex}개 생성 완료`);
  }

  console.log(`\n✅ Contract seed 완료 (총 ${totalContractsCreated}개)`);
}
