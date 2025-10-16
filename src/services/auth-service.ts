import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET } from '../configs/constants.js';
import { generateTokens } from '../configs/token.js';
import { LoginDto, RefreshDto } from '../dtos/auth-dto.js';
import { NotFoundError, UnauthorizedError } from '../configs/custom-error.js';
import userRepository from '../repositories/user-repository.js';
import userService from './user-service.js';

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
    const { accessToken, refreshToken } = generateTokens(user.id);

    // 4. Refresh Token 해싱 및 DB 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await userRepository.updateRefreshToken(user.id, hashedRefreshToken);

    // 5. 응답 데이터 가공
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
      // 1. Refresh Token 자체의 유효성 검증 (만료 등)
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: number };

      // 2. DB에서 유저 정보 및 저장된 토큰 조회
      const user = await userRepository.findById(decoded.id);
      if (!user || !user.currentHashedRefreshToken) {
        throw new UnauthorizedError('유효하지 않은 토큰입니다. (사용자 또는 토큰 없음)');
      }

      // 3. 전달된 토큰과 DB의 토큰이 일치하는지 확인
      const isTokenValid = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
      if (!isTokenValid) {
        throw new UnauthorizedError('유효하지 않은 토큰입니다. (토큰 불일치)');
      }

      // 4. 새로운 토큰 생성
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

      // 5. 새로 발급한 Refresh Token을 다시 해싱하여 DB에 저장 (교체)
      const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await userRepository.updateRefreshToken(user.id, hashedNewRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      // UnauthorizedError가 아닌 다른 에러(jwt.verify 에러 등) 처리
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('유효하지 않은 토큰입니다. (검증 실패)');
    }
  },
};

export default authService;