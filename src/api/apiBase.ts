import axios, {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {toast} from "react-toastify";
import {LocalStorageService} from "../service/LocalStorageService";
import {AUTH_KEY} from "../constants/google";

// 전역 네비게이션 함수 - 403 에러 시 홈으로 이동용
let globalNavigate: ((path: string) => void) | null = null;

export const setGlobalNavigate = (navigateFunction: (path: string) => void) => {
  globalNavigate = navigateFunction;
};

// 커스텀 Axios 설정 인터페이스
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  suppressToast?: boolean;
}

// API 에러 응답 데이터 타입
interface ApiErrorData {
  message?: string;
  ok: boolean;
}

const axiosInstance = axios.create({
  baseURL: `${AUTH_KEY.apiUrl}/admin`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = LocalStorageService.get("AUTH_TOKEN");
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorData>) => {
    const config = error.config as CustomAxiosRequestConfig;

    if (config?.suppressToast) {
      return Promise.reject(error);
    }

    handleAxiosError(error);
    return Promise.reject(error);
  }
);

const handleAxiosError = (error: AxiosError<ApiErrorData>): void => {
  // Axios 에러 처리
  if (axios.isAxiosError(error)) {
    // 타임아웃 에러 체크
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      toast.error("요청 시간이 초과되었습니다.");
      return;
    }

    // HTTP 에러 처리
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const statusMessages: Record<number, string> = {
      400: "잘못된 요청입니다.",
      401: "인증되지 않은 요청입니다.",
      403: "권한이 없습니다.",
      404: "요청한 리소스를 찾을 수 없습니다.",
      409: "중복된 요청입니다.",
      500: `서버 오류가 발생하였습니다`,
    };

    // 403 권한 에러 시 홈으로 이동
    if (status === 403 && globalNavigate) {
      toast.error("접근 권한이 없습니다. 홈 페이지로 이동합니다.");
      globalNavigate('/manage');
      return;
    }

    // 서버 메시지가 있으면 우선 사용, 없으면 기본 메시지
    toast.error(message || statusMessages[status || 500]);
    return;
  }

  // 기타 알 수 없는 에러
  toast.error("알 수 없는 오류가 발생했습니다.");
};

export default axiosInstance;
