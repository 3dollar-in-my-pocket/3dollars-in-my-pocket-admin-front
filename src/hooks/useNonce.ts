import {useCallback, useState} from "react";
import nonceApi from "../api/nonceApi";
import {toast} from "react-toastify";

/**
 * Nonce 토큰 관리 훅
 * 멱등성 없는 API 중복 요청 방지를 위한 Nonce 토큰을 관리합니다.
 *
 * @returns {object} nonce - 현재 발급받은 Nonce 토큰
 * @returns {function} issueNonce - Nonce 토큰 발급 함수
 * @returns {function} clearNonce - Nonce 토큰 초기화 함수
 * @returns {boolean} isLoading - Nonce 토큰 발급 중 여부
 */
export const useNonce = () => {
  const [nonce, setNonce] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const issueNonce = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await nonceApi.issueNonce();
      if (response.ok && response.data.nonce) {
        setNonce(response.data.nonce);
        return response.data.nonce;
      } else {
        toast.error("Nonce 토큰 발급에 실패했습니다.");
        return null;
      }
    } catch (error) {
      console.error("Nonce 토큰 발급 오류:", error);
      toast.error("Nonce 토큰 발급 중 오류가 발생했습니다.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearNonce = useCallback(() => {
    setNonce(null);
  }, []);

  return {
    nonce,
    issueNonce,
    clearNonce,
    isLoading,
  };
};
