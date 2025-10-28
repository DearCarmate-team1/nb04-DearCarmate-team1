import { z } from 'zod';
import { CarType } from '@prisma/client';

const carTypeStatSchema = z.object({
  carType: z.nativeEnum(CarType),
  count: z.number(),
});

export const DashboardResponseSchema = z.object({
  monthlySales: z.number(),
  lastMonthSales: z.number(),
  growthRate: z.number(),
  proceedingContractsCount: z.number(),
  completedContractsCount: z.number(),
  contractsByCarType: z.array(carTypeStatSchema),
  salesByCarType: z.array(carTypeStatSchema),
});

export type DashboardResponseDto = z.infer<typeof DashboardResponseSchema>;
