import axios from 'axios';
import {toast} from "react-toastify";
import {LocalStorageService} from "../service/LocalStorageService";
import {AUTH_KEY} from "../constants/google";

const axiosInstance = axios.create({
  baseURL: `${AUTH_KEY.apiUrl}/admin`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  config => {
    const token = LocalStorageService.get("AUTH_TOKEN");
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const config = error.config;

    if (config?.suppressToast) {
      return Promise.reject(error);
    }

    handleAxiosError(error);
    return Promise.reject(error);
  }
);

const handleAxiosError = (error) => {

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const statusMessages = {
      400: "잘못된 요청입니다.",
      401: "인증되지 않은 요청입니다.",
      403: "권한이 없습니다.",
      404: "요청한 리소스를 찾을 수 없습니다.",
      500: `서버 오류가 발생하였습니다`,
    };

    if (status === 401) {
      toast.error(message || statusMessages[status])
    } else {
      toast.error(message || statusMessages[status])
    }
  } else if (error instanceof Error && error.name === "TimeoutError") {
    toast.error("요청 시간이 초과되었습니다.");
  } else {
    toast.error("알 수 없는 오류가 발생했습니다.");
  }
};

export default axiosInstance;
