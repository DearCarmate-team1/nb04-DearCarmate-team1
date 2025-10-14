export interface CreateCustomerDTO {
  name: string;
  gender: string;
  phoneNumber: string;
  ageGroup?: string;
  region?: string;
  email?: string;
  memo?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  gender?: string;
  phoneNumber?: string;
  ageGroup?: string;
  region?: string;
  email?: string;
  memo?: string;
}
