import dashboardRepository from '../repositories/dashboard-repository.js';
import { DashboardResponseDto } from '../dtos/dashboard-dto.js';
import { CarType } from '@prisma/client';

const dashboardService = {
  async getDashboardData(companyId: number): Promise<DashboardResponseDto> {
    // 1. 날짜 범위 계산
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 2. 레포지토리로부터 데이터 병렬 조회
    const [ 
      monthlySales, 
      lastMonthSales, 
      proceedingContractsCount, 
      completedContractsCount, // 변수명은 그대로 사용
      contractsByCar, 
      salesByCar
    ] = await Promise.all([
      dashboardRepository.getSalesByDateRange(companyId, firstDayCurrentMonth, firstDayNextMonth),
      dashboardRepository.getSalesByDateRange(companyId, firstDayLastMonth, firstDayCurrentMonth),
      dashboardRepository.getProceedingContractsCount(companyId),
      dashboardRepository.getAllTimeCompletedContractsCount(companyId), // [수정됨] 전체 기간 조회 함수로 변경
      dashboardRepository.getContractsCountByCarType(companyId),
      dashboardRepository.getSalesByCarType(companyId),
    ]);

    // 3. 차종별 집계를 위한 추가 데이터 조회 및 가공
    const allCarIds = [...new Set([...contractsByCar.map(c => c.carId), ...salesByCar.map(s => s.carId)])];
    const carIdToTypeMap = new Map<number, CarType>();
    if (allCarIds.length > 0) {
      const carTypes = await dashboardRepository.getCarTypesByIds(allCarIds);
      carTypes.forEach(car => carIdToTypeMap.set(car.id, car.model.type));
    }

    const aggregateByCarType = <T extends { carId: number; }>(groups: T[], getValue: (item: T) => number) => {
      const result = new Map<CarType, number>();
      groups.forEach(group => {
        const carType = carIdToTypeMap.get(group.carId);
        if (carType) {
          result.set(carType, (result.get(carType) ?? 0) + getValue(group));
        }
      });
      return Array.from(result, ([carType, count]) => ({ carType, count }));
    };

    const contractsByCarType = aggregateByCarType(contractsByCar, (item) => item._count.id);
    const salesByCarType = aggregateByCarType(salesByCar, (item) => item._sum.contractPrice ?? 0);

    // 4. 성장률 계산
    const growthRate = lastMonthSales === 0 ? 0 : ((monthlySales - lastMonthSales) / lastMonthSales) * 100;

    // 5. 최종 DTO 조립
    return {
      monthlySales,
      lastMonthSales,
      growthRate,
      proceedingContractsCount,
      completedContractsCount,
      contractsByCarType,
      salesByCarType,
    };
  },
};

export default dashboardService;