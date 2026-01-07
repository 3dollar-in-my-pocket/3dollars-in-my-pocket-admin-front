import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse, SocialType } from '../types/auth';
import { apiPost } from './apiHelpers';

export default {
  /**
   * 소셜 로그인을 수행합니다.
   * @param accessToken - 소셜 로그인 액세스 토큰
   * @param socialType - 소셜 로그인 타입 (GOOGLE, APPLE, KAKAO)
   * @returns 로그인 응답 (JWT 토큰 포함)
   */
  login: async ({
    accessToken,
    socialType
  }: {
    accessToken: string;
    socialType: SocialType;
  }): Promise<ApiResponse<LoginResponse>> => {
    const requestData: LoginRequest = {
      token: accessToken,
      socialType: socialType,
    };

    return apiPost<LoginResponse>('/v1/auth/login', requestData);
  }
}
