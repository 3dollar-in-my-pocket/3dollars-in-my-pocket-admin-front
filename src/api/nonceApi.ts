import {NonceData} from "../types/nonce";
import {ApiResponse} from "@/types/api";
import {apiPost} from "./apiHelpers";

const nonceApi = {
  /**
   * Nonce 토큰 발급
   * 멱등성 없는 API 중복 요청 방지를 위한 Nonce 토큰 발급
   */
  issueNonce: async (): Promise<ApiResponse<NonceData>> => {
    return apiPost<NonceData>("/v1/nonce", {});
  },
};

export default nonceApi;
