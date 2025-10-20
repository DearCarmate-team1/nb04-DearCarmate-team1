// src/services/customer-service.ts
import { CreateCustomerDTO, UpdateCustomerDTO } from '../dtos/customer-dto.js';
import { CustomerRepository } from '../repositories/customer-repository.js';
import { csvParser } from '../utils/csv-parser.js';
import { BadRequestError } from '../configs/custom-error.js';
import type { CustomerCsvRow, CustomerBulkUploadResult } from '../types/customer.js';

const customerRepository = new CustomerRepository();

export class CustomerService {
  async createCustomer(companyId: number, data: CreateCustomerDTO) {
    return await customerRepository.create(companyId, data);
  }
  // 고객 목록 조회 (검색 + 페이지네이션)
  async getCustomers(
    companyId: number,
    searchBy: string = 'name',
    keyword: string = '',
    page = 1,
    pageSize = 10,
  ) {
    const skip = (page - 1) * pageSize;

    const { customers, total } = await customerRepository.findMany(
      companyId,
      searchBy,
      keyword,
      skip,
      pageSize,
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
    if (!customer) throw new Error('고객을 찾을 수 없습니다.');
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
  /** 📤 고객 CSV 대용량 업로드 (메모리 기반 - 디스크 저장 안 함) */
  async bulkUpload(
    user: any,
    file: Express.Multer.File | undefined,
  ): Promise<CustomerBulkUploadResult> {
    // Step 1: 파일 검증
    if (!file) {
      throw new BadRequestError('CSV 파일이 필요합니다.');
    }

    // Step 2: CSV 파일 파싱 (메모리 버퍼에서 바로 파싱, 비동기)
    const records = await csvParser.parseFromBuffer<CustomerCsvRow>(file.buffer);

    if (!records.length) {
      throw new BadRequestError('CSV 데이터가 비어 있습니다.');
    }

    // Step 3: N+1 쿼리 해결 - 기존 전화번호 사전 캐싱
    const existingPhoneNumbers = await customerRepository.findAllPhoneNumbersByCompany(
      user.companyId,
    );
    const phoneNumberSet = new Set(existingPhoneNumbers);

    // Step 4: 비즈니스 검증 (메모리 기반, DB 쿼리 없음)
    const validCustomers: any[] = [];
    const failures: CustomerBulkUploadResult['failures'] = [];

    for (let i = 0; i < records.length; i++) {
      const r = records[i]!;
      const rowNumber = i + 2; // CSV 행 번호 (헤더 포함)

      // 검증 1: 필수 필드 존재 여부
      if (!r.name || !r.gender || !r.phoneNumber) {
        failures.push({
          row: rowNumber,
          phoneNumber: r.phoneNumber || '없음',
          reason: '필수 필드 누락 (name, gender, phoneNumber 필요)',
        });
        continue;
      }

      // 검증 2: 중복 전화번호
      if (phoneNumberSet.has(r.phoneNumber)) {
        failures.push({
          row: rowNumber,
          phoneNumber: r.phoneNumber,
          reason: '이미 등록된 전화번호입니다.',
        });
        continue;
      }

      // ✅ 검증 통과: validCustomers에 추가
      validCustomers.push({
        name: r.name,
        gender: r.gender,
        phoneNumber: r.phoneNumber,
        ageGroup: r.ageGroup || null,
        region: r.region || null,
        email: r.email || null,
        memo: r.memo || null,
        companyId: user.companyId,
      });

      // 중복 방지: 현재 배치에 추가된 전화번호도 Set에 추가
      phoneNumberSet.add(r.phoneNumber);
    }

    // Step 5: 검증 통과한 항목만 일괄 등록 (Repository 위임)
    if (validCustomers.length > 0) {
      await customerRepository.bulkInsert(validCustomers);
    }

    // Step 6: 결과 반환
    return {
      successCount: validCustomers.length,
      failureCount: failures.length,
      failures,
    };
  }
}
