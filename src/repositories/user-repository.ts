import prisma from '../configs/prisma-client.js';
import type { CreateUserDto, UpdateUserDto } from '../dtos/user-dto.js';

const userRepository = {
  /** 유저 생성 */
  async create(data: any) { // 서비스에서 가공된 데이터를 받도록 수정
    return prisma.user.create({
      data,
      include: {
        company: true, // 생성된 유저 정보에 회사 정보를 포함
      },
    });
  },

  /** 이메일로 유저 조회 */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /** ID로 유저 조회 */
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });
  },

  /** 유저 수정 */
  async update(id: number, userData: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data: userData,
      include: {
        company: true,
      },
    });
  },

  /** Refresh Token 업데이트 */
  async updateRefreshToken(id: number, hashedRefreshToken: string | null) {
    await prisma.user.update({
      where: { id },
      data: { currentHashedRefreshToken: hashedRefreshToken },
    });
  },

  /** 유저 삭제 */
  async delete(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  },
};

export default userRepository;
