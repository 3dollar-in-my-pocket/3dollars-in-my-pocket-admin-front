/**
 * 소셜 로그인 타입
 */
export type SocialType = 'GOOGLE';

/**
 * Google OAuth 토큰 요청 파라미터
 */
export interface GoogleTokenRequest {
  code: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
  redirect_uri: string;
}

/**
 * Google OAuth 토큰 응답
 */
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
  refresh_token?: string;
}

/**
 * 로그인 요청 파라미터
 */
export interface LoginRequest {
  token: string;
  socialType: SocialType;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  token: string;
  userId?: string;
  name?: string;
}
