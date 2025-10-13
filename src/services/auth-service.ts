import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userRepository from '../repositories/user-repository.js';
import userService from './user-service.js';
import { LoginDto, RefreshDto } from '../dtos/auth-dto.js';
import { NotFoundError, UnauthorizedError } from '../configs/custom-error.js';

// 환경 변수 확인
const { 
  JWT_SECRET_KEY, 
  JWT_REFRESH_SECRET_KEY, 
  JWT_ACCESS_EXPIRES_IN, 
  JWT_REFRESH_EXPIRES_IN 
} = process.env;

if (!JWT_SECRET_KEY || !JWT_REFRESH_SECRET_KEY || !JWT_ACCESS_EXPIRES_IN || !JWT_REFRESH_EXPIRES_IN) {
  throw new Error('JWT 관련 환경 변수가 설정되지 않았습니다.');
}

const authService = {
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. 유저 존재 여부 확인
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('존재하지 않거나 비밀번호가 일치하지 않습니다');
    }

    // 2. 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundError('존재하지 않거나 비밀번호가 일치하지 않습니다');
    }

    // 3. 토큰 생성
    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET_KEY, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET_KEY, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    // 4. 응답 데이터 가공 (userService 재사용)
    const userProfile = await userService.getUserById(user.id);

    return {
      user: userProfile,
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshDto: RefreshDto) {
    const { refreshToken } = refreshDto;

    try {
      // 1. Refresh Token 검증
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY) as {
        id: number;
      };

      // 2. 유저 존재 여부 확인
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedError('유효하지 않은 토큰입니다.');
      }

      // 3. 새로운 토큰 생성
      const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET_KEY, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
      } as jwt.SignOptions);
      const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET_KEY, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
      } as jwt.SignOptions);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      // 토큰이 만료되었거나, 형식이 잘못된 경우
      throw new UnauthorizedError('유효하지 않은 토큰입니다.');
    }
  },
};

export default authService;
