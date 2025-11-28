import axiosInstance from "./apiBase";
import {NonceData} from "../types/nonce";
import {ApiResponse} from "@/types/api";

const nonceApi = {
  /**
   * Nonce 토큰 발급
   * 멱등성 없는 API 중복 요청 방지를 위한 Nonce 토큰 발급
   */
  issueNonce: async (): Promise<ApiResponse<NonceData>> => {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/nonce",
      data: {}
    });
    return response.data;
  },
};

export default nonceApi;
