import axiosInstance from './apiBase';
import { ApiResponse, PaginatedResponse, CursorPaginationParams } from '../types/api';
import {
  unwrapApiResponse,
  normalizeCursorResponse,
  buildCursorParams,
  buildNonceHeader
} from '../utils/apiUtils';

/**
 * 요청을 수행하고 실패는 { ok: false }로 흡수합니다.
 *
 * 에러 토스트는 응답 인터셉터(apiBase)가 이미 표시하므로, 호출부는
 * try/catch 없이 response.ok만 확인하면 됩니다.
 */
async function request<T>(run: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
  try {
    return await run();
  } catch (error) {
    return { ok: false, data: null as T };
  }
}

/**
 * 타입 안전한 GET 요청
 */
export async function apiGet<T>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  return request<T>(async () => {
    const response = await axiosInstance({
      method: 'GET',
      url,
      params,
    });

    return unwrapApiResponse<T>(response);
  });
}

/**
 * 인증이 필요한 바이너리 파일 다운로드 요청
 *
 * 파일 저장 등 후속 처리가 필요하므로 예외를 그대로 전달합니다.
 */
export async function apiGetBlob(
  url: string,
  options?: { timeout?: number; accept?: string }
): Promise<Blob> {
  const response = await axiosInstance({
    method: 'GET',
    url,
    responseType: 'blob',
    timeout: options?.timeout,
    headers: {
      Accept: options?.accept || 'application/octet-stream',
    },
  });

  return response.data;
}

/**
 * 타입 안전한 POST 요청 (nonce 지원)
 */
export async function apiPost<T>(
  url: string,
  data?: any,
  options?: { nonce?: string }
): Promise<ApiResponse<T>> {
  return request<T>(async () => {
    const response = await axiosInstance({
      method: 'POST',
      url,
      data,
      headers: buildNonceHeader(options?.nonce),
    });

    return unwrapApiResponse<T>(response);
  });
}

/**
 * 타입 안전한 multipart/form-data POST 요청 (nonce/timeout 지원)
 */
export async function apiPostFormData<T>(
  url: string,
  data: FormData,
  options?: { nonce?: string; timeout?: number }
): Promise<ApiResponse<T>> {
  return request<T>(async () => {
    const response = await axiosInstance({
      method: 'POST',
      url,
      data,
      headers: {
        ...buildNonceHeader(options?.nonce),
        // Axios 인스턴스의 application/json 기본값을 제거해 브라우저가 multipart boundary를 설정하게 한다.
        'Content-Type': undefined,
      },
      timeout: options?.timeout,
    });

    return unwrapApiResponse<T>(response);
  });
}

/**
 * 타입 안전한 PATCH 요청
 */
export async function apiPatch<T>(
  url: string,
  data: any
): Promise<ApiResponse<T>> {
  return request<T>(async () => {
    const response = await axiosInstance({
      method: 'PATCH',
      url,
      data,
    });

    return unwrapApiResponse<T>(response);
  });
}

/**
 * 타입 안전한 PUT 요청
 */
export async function apiPut<T>(
  url: string,
  data: any
): Promise<ApiResponse<T>> {
  return request<T>(async () => {
    const response = await axiosInstance({
      method: 'PUT',
      url,
      data,
    });

    return unwrapApiResponse<T>(response);
  });
}

/**
 * 타입 안전한 DELETE 요청
 */
export async function apiDelete<T = void>(url: string): Promise<ApiResponse<T>> {
  return request<T>(async () => {
    const response = await axiosInstance({
      method: 'DELETE',
      url,
    });

    return unwrapApiResponse<T>(response);
  });
}

/**
 * 커서 기반 페이지네이션 GET 요청
 *
 * 실패 시 빈 목록을 반환해 호출부가 그대로 렌더링할 수 있게 합니다.
 */
export async function apiGetPaginated<T>(
  url: string,
  paginationParams: CursorPaginationParams,
  additionalParams?: Record<string, any>
): Promise<ApiResponse<PaginatedResponse<T>>> {
  const params = {
    ...buildCursorParams(paginationParams.cursor, paginationParams.size),
    ...additionalParams,
  };

  try {
    const response = await axiosInstance({
      method: 'GET',
      url,
      params,
    });

    if (response.data.ok) {
      return {
        ok: true,
        data: normalizeCursorResponse<T>(response.data.data),
      };
    }

    return {
      ok: false,
      data: { contents: [], cursor: { hasMore: false, nextCursor: null } },
    };
  } catch (error) {
    return {
      ok: false,
      data: { contents: [], cursor: { hasMore: false, nextCursor: null } },
    };
  }
}
