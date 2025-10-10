import userRepository from '../repositories/user-repository.js';
import companyRepository from '../repositories/company-repository.js';
import { CreateUserDto, UpdateUserDto } from '../dtos/user-dto.js';
import bcrypt from 'bcrypt';

const userService = {
  async createUser(userData: CreateUserDto) {
    // 2. 이메일 중복 확인
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다');
    }

    // 3. 회사 정보 검증
    const company = await companyRepository.findByNameAndAuthCode(
      userData.company,
      userData.companyCode
    );
    if (!company) {
      throw new Error('회사 정보가 올바르지 않습니다.');
    }

    // 4. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 5. 레포지토리에 넘길 데이터 준비
    const dataToCreate = {
      name: userData.name,
      email: userData.email,
      employeeNumber: userData.employeeNumber,
      phoneNumber: userData.phoneNumber,
      password: hashedPassword,
      companyId: company.id,
    };

    const newUser = await userRepository.create(dataToCreate);

    // 7. API 명세서에 맞는 응답 형태로 가공
    const response = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      employeeNumber: newUser.employeeNumber,
      phoneNumber: newUser.phoneNumber,
      imageUrl: newUser.imageUrl,
      isAdmin: newUser.isAdmin,
      company: {
        companyCode: newUser.company.authCode,
      },
    };

    return response;
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error('존재하지 않는 유저입니다');
    }

    // API 명세서에 맞는 응답 형태로 가공
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber,
      imageUrl: user.imageUrl,
      isAdmin: user.isAdmin,
      company: {
        companyCode: user.company.authCode,
      },
    };

    return response;
  },

  async updateUser(id: number, userData: UpdateUserDto) {
    const { currentPassword, password, passwordConfirmation, ...updateFields } =
      userData;

    // 1. 유저 존재 여부 확인
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error('존재하지 않는 유저입니다.');
    }

    // 2. 현재 비밀번호 검증
    if (!currentPassword) {
      throw new Error('현재 비밀번호를 입력해주세요.');
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      existingUser.password
    );
    if (!isPasswordValid) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    const dataToUpdate: { [key: string]: any } = { ...updateFields };

    // 3. 새로운 비밀번호가 있다면 해싱
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // 4. 정보 업데이트
    const updatedUser = await userRepository.update(id, dataToUpdate);

    // 5. 응답 데이터 가공
    const response = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      employeeNumber: updatedUser.employeeNumber,
      phoneNumber: updatedUser.phoneNumber,
      imageUrl: updatedUser.imageUrl,
      isAdmin: updatedUser.isAdmin,
      company: {
        companyCode: updatedUser.company.authCode,
      },
    };

    return response;
  },

  async deleteUser(id: number) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error('존재하지 않는 유저입니다.');
    }
    await userRepository.delete(id);
  },
};

export default userService;
