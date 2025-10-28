import prisma from '../configs/prisma-client.js';

const customerRepository = {
  /** 고객 생성 */
  async create(companyId: number, data: any) {
    const customer = await prisma.customer.create({
      data: { ...data, companyId },
      include: {
        _count: {
          select: { contract: true }, // 계약 수 동적 계산
        },
      },
    });

    // contractCount 필드 추가 (신규 고객이므로 항상 0)
    return {
      ...customer,
      contractCount: customer._count.contract,
      _count: undefined, // _count 제거
    };
  },

  /** 고객 목록 조회 (검색 + 페이지네이션) */
  async findMany(companyId: number, searchBy: string, keyword: string, skip: number, take: number) {
    const where: any = { companyId };

    if (keyword) {
      // 검색 기준 필드에 따라 동적으로 검색 조건 생성
      where[searchBy] = { contains: keyword };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { contract: true }, // 계약 수 동적 계산
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // contractCount 필드 추가
    const customersWithCount = customers.map((customer) => ({
      ...customer,
      contractCount: customer._count.contract,
      _count: undefined, // _count 제거
    }));

    return { customers: customersWithCount, total };
  },

  /** 고객 상세 조회 */
  async findById(companyId: number, customerId: number) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
      include: {
        _count: {
          select: { contract: true }, // 계약 수 동적 계산
        },
      },
    });

    if (!customer) return null;

    // contractCount 필드 추가
    return {
      ...customer,
      contractCount: customer._count.contract,
      _count: undefined, // _count 제거
    };
  },

  /** 고객 정보 수정 */
  async update(customerId: number, data: any) {
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data,
      include: {
        _count: {
          select: { contract: true }, // 계약 수 동적 계산
        },
      },
    });

    // contractCount 필드 추가
    return {
      ...customer,
      contractCount: customer._count.contract,
      _count: undefined, // _count 제거
    };
  },

  /** 고객 삭제 */
  async delete(customerId: number) {
    return prisma.customer.delete({
      where: { id: customerId },
    });
  },

  /** 고객 대량 등록 */
  async bulkInsert(customers: any[]) {
    return prisma.customer.createMany({
      data: customers,
      skipDuplicates: true,
    });
  },

  /** 특정 회사의 모든 전화번호 조회 (중복 체크용) */
  async findAllPhoneNumbersByCompany(companyId: number): Promise<string[]> {
    const customers = await prisma.customer.findMany({
      where: { companyId },
      select: { phoneNumber: true },
    });
    return customers.map((c) => c.phoneNumber);
  },
};

export default customerRepository;
