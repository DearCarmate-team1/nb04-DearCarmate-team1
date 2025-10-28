import { z } from 'zod';

// 계약 상태 enum
export const contractStatusSchema = z.enum([
  'carInspection',
  'priceNegotiation',
  'contractDraft',
  'contractSuccessful',
  'contractFailed',
]);
export type ContractStatus = z.infer<typeof contractStatusSchema>;

// 알람 스키마
const alarmSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid datetime format (ISO 8601 required).',
  });

// 미팅 스키마
const meetingSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Meeting date must be in ISO 8601 format.',
  }),
  alarms: z
    .array(alarmSchema)
    .min(0, { message: 'At least 0 alarms required.' })
    .optional()
    .default([]),
});

// 계약서 문서 스키마
const contractDocumentSchema = z.object({
  id: z.number().int().positive({ message: 'Invalid document ID.' }),
  fileName: z.string().min(1, { message: 'File name is required.' }),
});

// 계약 생성 스키마
export const createContractSchema = z.object({
  carId: z.number().int().positive({ message: 'Invalid car ID.' }),
  customerId: z.number().int().positive({ message: 'Invalid customer ID.' }),
  meetings: z
    .array(meetingSchema)
    .max(3, { message: 'Maximum 3 meetings allowed.' })
    .optional()
    .default([]),
});

// 계약 수정 스키마
export const updateContractSchema = z.object({
  status: contractStatusSchema.optional(),
  resolutionDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid datetime format (ISO 8601 required).',
    })
    .nullable()
    .optional(),
  contractPrice: z
    .number()
    .int()
    .nonnegative({ message: 'Contract price must be non-negative.' })
    .optional(),
  meetings: z.array(meetingSchema).max(3, { message: 'Maximum 3 meetings allowed.' }).optional(),
  contractDocuments: z.array(contractDocumentSchema).optional(),
  userId: z.number().int().positive({ message: 'Invalid user ID.' }).optional(),
  customerId: z.number().int().positive({ message: 'Invalid customer ID.' }).optional(),
  carId: z.number().int().positive({ message: 'Invalid car ID.' }).optional(),
});

// 계약 목록 조회 쿼리 스키마
export const contractQuerySchema = z
  .object({
    searchBy: z.enum(['customerName', 'userName']).optional(),
    keyword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasSearchBy = data.searchBy !== undefined;
    const hasKeyword = data.keyword !== undefined;

    if (hasSearchBy && !hasKeyword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'keyword is required when using searchBy.',
        path: ['keyword'],
      });
    }

    if (hasKeyword && !hasSearchBy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'searchBy is required when using keyword.',
        path: ['searchBy'],
      });
    }
  });

// 계약서 업로드 목록 조회 쿼리 스키마
export const contractDocumentQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
    searchBy: z.enum(['contractName']).optional(),
    keyword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasSearchBy = data.searchBy !== undefined;
    const hasKeyword = data.keyword !== undefined;

    if (hasSearchBy && !hasKeyword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'keyword is required when using searchBy.',
        path: ['keyword'],
      });
    }

    if (hasKeyword && !hasSearchBy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'searchBy is required when using keyword.',
        path: ['searchBy'],
      });
    }
  });

// contractId 파라미터 스키마
export const contractIdParamSchema = z.object({
  contractId: z.coerce.number().int().positive({ message: 'Invalid contract ID.' }),
});

// 타입 추론
export type CreateContractDto = z.infer<typeof createContractSchema>;
export type UpdateContractDto = z.infer<typeof updateContractSchema>;
export type ContractQueryDto = z.infer<typeof contractQuerySchema>;
export type ContractDocumentQueryDto = z.infer<typeof contractDocumentQuerySchema>;
export type MeetingDto = z.infer<typeof meetingSchema>;
