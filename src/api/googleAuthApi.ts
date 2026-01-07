import axios, { AxiosError } from "axios";
import axiosInstance from "./apiBase";
import { AUTH_KEY, GOOGLE_TOKEN_URL } from "../constants/google";
import { GoogleTokenRequest, GoogleTokenResponse } from "../types/auth";

export default {
  /**
   * Google OAuth 인증 코드로 액세스 토큰을 가져옵니다.
   * @param code - Google OAuth 인증 코드
   * @returns Google 액세스 토큰
   * @throws Google OAuth API 호출 실패 시 에러
   */
  getAccessToken: async ({ code }: { code: string }): Promise<string> => {
    try {
      const requestBody: GoogleTokenRequest = {
        code,
        client_id: AUTH_KEY.google.clientId,
        client_secret: AUTH_KEY.google.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: AUTH_KEY.google.redirectUri,
      };

      // 절대 URL 사용 시 baseURL이 무시됨
      const response = await axiosInstance.post<GoogleTokenResponse>(
        GOOGLE_TOKEN_URL,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string; error_description?: string }>;
        const errorMessage = axiosError.response?.data?.error_description ||
                           axiosError.response?.data?.error ||
                           'Google OAuth 토큰 요청에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
}
