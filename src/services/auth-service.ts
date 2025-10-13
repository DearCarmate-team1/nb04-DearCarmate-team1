import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userRepository from '../repositories/user-repository.js';
import userService from './user-service.js';
import { LoginDto, RefreshDto } from '../dtos/auth-dto.js';
import { NotFoundError, UnauthorizedError } from '../configs/custom-error.js';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../configs/constants.js';

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
    const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
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
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id: number;
      };

      // 2. 유저 존재 여부 확인
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedError('유효하지 않은 토큰입니다.');
      }

      // 3. 새로운 토큰 생성
      const newAccessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      } as jwt.SignOptions);
      const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
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