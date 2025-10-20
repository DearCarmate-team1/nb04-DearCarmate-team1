import { z } from 'zod';

// contractsByCarType, salesByCarType 배열의 각 요소에 대한 스키마
const carTypeStatSchema = z.object({
  carType: z.string(),
  count: z.number(),
});

// 전체 대시보드 응답에 대한 스키마
export const DashboardResponseSchema = z.object({
  monthlySales: z.number(),
  lastMonthSales: z.number(),
  growthRate: z.number(),
  proceedingContractsCount: z.number(),
  completedContractsCount: z.number(),
  contractsByCarType: z.array(carTypeStatSchema),
  salesByCarType: z.array(carTypeStatSchema),
});

// 스키마로부터 TypeScript 타입 추론
export type DashboardResponseDto = z.infer<typeof DashboardResponseSchema>;
