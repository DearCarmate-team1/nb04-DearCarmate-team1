// src/services/customer-service.ts
import fs from "fs";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { CreateCustomerDTO, UpdateCustomerDTO } from "../dtos/customer-dto.js";
import { CustomerRepository } from "../repositories/customer-repository.js";




const customerRepository = new CustomerRepository();

export class CustomerService {
  async createCustomer(companyId: number, data: CreateCustomerDTO) {
    return await customerRepository.create(companyId, data);
  }
  // 고객 목록 조회 (검색 + 페이지네이션)
async getCustomers(
  companyId: number,
  searchBy: string = "name",
  keyword: string = "",
  page = 1,
  pageSize = 10
) {
  const skip = (page - 1) * pageSize;

  const { customers, total } = await customerRepository.findMany(
    companyId,
    searchBy,
    keyword,
    skip,
    pageSize
  );

  return {
    data: customers,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / pageSize),
  };
}

  // 고객 상세 조회
  async getCustomerById(companyId: number, customerId: number) {
    const customer = await customerRepository.findById(companyId, customerId);
    if (!customer) throw new Error("고객을 찾을 수 없습니다.");
    return customer;
  }
  // 고객 정보 수정
  async updateCustomer(companyId: number, customerId: number, data: UpdateCustomerDTO) {
    await this.getCustomerById(companyId, customerId);
    return await customerRepository.update(customerId, data);
  }
  // 고객 삭제
  async deleteCustomer(companyId: number, customerId: number) {
    await this.getCustomerById(companyId, customerId);
    return await customerRepository.delete(customerId);
  }
  // 고객 대량 등록
  async bulkUpload(companyId: number, filePath: string) {
    const customers: any[] = [];
    const ext = filePath.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => customers.push(row))
          .on("end", () => resolve())
          .on("error", reject);
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      if (!sheetName || !workbook.Sheets[sheetName]) {
        throw new Error("엑셀 파일에 시트가 없습니다.");
      }
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      customers.push(...data);
    } else {
      throw new Error("지원하지 않는 파일 형식입니다. (CSV 또는 XLSX만 허용)");
    }

    const validCustomers = customers
      .filter((c) => c.name && c.gender && c.phoneNumber)
      .map((c) => ({
        name: c.name,
        gender: c.gender,
        phoneNumber: c.phoneNumber,
        ageGroup: c.ageGroup || null,
        region: c.region || null,
        email: c.email || null,
        memo: c.memo || null,
        companyId,
      }));

    if (validCustomers.length === 0) {
      throw new Error("유효한 고객 데이터가 없습니다.");
    }

    await customerRepository.bulkInsert(validCustomers);

    return {
      insertedCount: validCustomers.length,
    };
  }
}
