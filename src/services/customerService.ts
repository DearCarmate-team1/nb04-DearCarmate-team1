import { PrismaClient, Prisma } from "@prisma/client";
import { CreateCustomerDTO, UpdateCustomerDTO } from "../dtos/customer-dto.js";
import fs from "fs";
import csv from "csv-parser";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export class CustomerService {
  // 고객 등록
  async createCustomer(companyId: number, data: CreateCustomerDTO) {
    return await prisma.customer.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  // 고객 목록 조회 (검색 + 페이지네이션)
  async getCustomers(companyId: number, search?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // 객체 스프레드로 OR 조건부 추가
    const where: Prisma.CustomerWhereInput = {
      companyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Prisma 타입 명시로 안전하게 병렬 처리
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 고객 상세 조회
  async getCustomerById(companyId: number, customerId: number) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });
    if (!customer) throw new Error("고객을 찾을 수 없습니다.");
    return customer;
  }

  // 고객 수정
  async updateCustomer(
    companyId: number,
    customerId: number,
    data: UpdateCustomerDTO
  ) {
    // 존재 여부 확인
    await this.getCustomerById(companyId, customerId);
    return await prisma.customer.update({
      where: { id: customerId },
      data,
    });
  }

  // 고객 삭제
  async deleteCustomer(companyId: number, customerId: number) {
    await this.getCustomerById(companyId, customerId);
    return await prisma.customer.delete({
      where: { id: customerId },
    });
  }

  // 고객 데이터 대용량 업로드
  async bulkUpload(companyId: number, filePath: string) {
    const customers: any[] = [];

    // 파일 확장자 구분
    const ext = filePath.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      // CSV 처리
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => customers.push(row))
          .on("end", () => resolve())
          .on("error", reject);
      });
    } else if (ext === "xlsx" || ext === "xls") {
      // Excel 처리
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

    // 필수값 검증, Prisma 저장
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

    // Prisma bulk insert
    await prisma.customer.createMany({
      data: validCustomers,
      skipDuplicates: true,
    });

    return {
      insertedCount: validCustomers.length,
    };
  }
}
