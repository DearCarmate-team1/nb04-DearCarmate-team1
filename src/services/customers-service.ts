import { prisma } from '../prismaClient';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customer.dto';


export const createCustomer = async (userId: number, dto: CreateCustomerDto) => {
// userId 를 통해 companyId를 얻는 로직 (여기선 userId == companyId)
// 실제 서비스에서는 user -> company 관계
const companyId = userId; 

const customer = await prisma.customer.create({
data: {
name: dto.name,
gender: dto.gender,
phone: dto.phone,
ageGroup: dto.ageGroup,
region: dto.region,
email: dto.email,
memo: dto.memo,
companyId,
},
});
return customer;
};

export const getCustomers = async (
const [data, total] = await Promise.all([
prisma.customer.findMany({
where,
skip,
take,
select: {
id: true,
name: true,
contractCount: true,
gender: true,
phone: true,
ageGroup: true,
region: true,
email: true,
createdAt: true,
},
orderBy: { updatedAt: 'desc' },
}),
prisma.customer.count({ where }),
]);


return {
data,
page,
size: take,
total,
totalPages: Math.ceil(total / take) || 1,
};
};


export const getCustomerById = async (companyId: number, customerId: number) => {
const customer = await prisma.customer.findFirst({
where: { id: customerId, companyId },
});
return customer;
};


export const updateCustomer = async (companyId: number, customerId: number, dto: UpdateCustomerDto) => {
// 소유권 검증
const existing = await prisma.customer.findUnique({ where: { id: customerId } });
if (!existing || existing.companyId !== companyId) throw new Error('NotFoundOrForbidden');


const updated = await prisma.customer.update({
where: { id: customerId },
data: {
...dto,
},
});
return updated;
};


export const deleteCustomer = async (companyId: number, customerId: number) => {
const existing = await prisma.customer.findUnique({ where: { id: customerId } });
if (!existing || existing.companyId !== companyId) throw new Error('NotFoundOrForbidden');

await prisma.customer.delete({ where: { id: customerId } });
return;
};