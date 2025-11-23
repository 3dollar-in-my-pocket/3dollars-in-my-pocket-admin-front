import { ApiResponse } from "./api";

/**
 * Nonce 데이터 타입
 */
export interface NonceData {
  nonce: string;
}

/**
 * Nonce 발급 API 응답 타입
 */
export type NonceResponse = ApiResponse<NonceData>;
