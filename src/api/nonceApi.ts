import axiosInstance from "./apiBase";
import { NonceResponse } from "../types/nonce";

const nonceApi = {
  /**
   * Nonce 토큰 발급
   * 멱등성 없는 API 중복 요청 방지를 위한 Nonce 토큰 발급
   */
  issueNonce: async (): Promise<NonceResponse> => {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/nonce",
      data: {}
    });
    return response.data;
  },
};

export default nonceApi;
