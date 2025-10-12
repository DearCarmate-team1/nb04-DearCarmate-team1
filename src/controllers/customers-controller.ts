import { Request, Response } from 'express';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as CustomersService from '../services/customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customer.dto';
import { importCustomersFromCsv } from '../utils/csvUpload';


// 인증이 구현되어 있지 않으므로 임시로 req.user 를 가정
//  인증 미들웨어에서 req.user = { id, companyId }
const getMockUser = (req: Request) => {
//  실제 환경에서는 req.user 에서 companyId 를 취득하는 걸로
return { id: 1, companyId: 1 };
};


export const createCustomer = async (req: Request, res: Response) => {
try {
const dto = plainToInstance(CreateCustomerDto, req.body);
await validateOrReject(dto);


const user = getMockUser(req);
const customer = await CustomersService.createCustomer(user.companyId, dto);
return res.status(201).json(customer);
} catch (err: any) {
console.error(err);
return res.status(400).json({ message: err?.message || 'Bad Request' });
}
};


export const getCustomers = async (req: Request, res: Response) => {
try {
const user = getMockUser(req);
const page = Number(req.query.page ?? 1);
const size = Number(req.query.size ?? 10);
const q = (req.query.q as string) || undefined;
const email = (req.query.email as string) || undefined;


const result = await CustomersService.getCustomers(user.companyId, page, size, q, email);
return res.json(result);
} catch (err: any) {
console.error(err);
return res.status(500).json({ message: 'Server error' });
}
};


export const getCustomerById = async (req: Request, res: Response) => {
try {
const user = getMockUser(req);
const customerId = Number(req.params.customerId);
const customer = await CustomersService.getCustomerById(user.companyId, customerId);
if (!customer) return res.status(404).json({ message: 'Customer not found' });
return res.json(customer);
} catch (err: any) {
console.error(err);
return res.status(500).json({ message: 'Server error' });
}
};


export const updateCustomer = async (req: Request, res: Response) => {
try {
};