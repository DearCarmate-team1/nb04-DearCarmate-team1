export interface CreateUserDto {
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
  company: string;
  companyCode: string;
}

export interface UpdateUserDto {
  currentPassword?: string;
  employeeNumber?: string;
  phoneNumber?: string;
  password?: string;
  passwordConfirmation?: string;
  imageUrl?: string;
}
