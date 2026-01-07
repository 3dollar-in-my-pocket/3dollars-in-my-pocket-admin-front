import axiosInstance from './apiBase';
import { ApiResponse, PaginatedResponse, CursorPaginationParams } from '../types/api';
import {
  unwrapApiResponse,
  normalizeCursorResponse,
  buildCursorParams,
  buildNonceHeader
} from '../utils/apiUtils';

/**
 * 타입 안전한 GET 요청
 */
export async function apiGet<T>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  const response = await axiosInstance({
    method: 'GET',
    url,
    params,
  });

  return unwrapApiResponse<T>(response);
}

/**
 * 타입 안전한 POST 요청 (nonce 지원)
 */
export async function apiPost<T>(
  url: string,
  data?: any,
  options?: { nonce?: string }
): Promise<ApiResponse<T>> {
  const response = await axiosInstance({
    method: 'POST',
    url,
    data,
    headers: buildNonceHeader(options?.nonce),
  });

  return unwrapApiResponse<T>(response);
}

/**
 * 타입 안전한 PATCH 요청
 */
export async function apiPatch<T>(
  url: string,
  data: any
): Promise<ApiResponse<T>> {
  const response = await axiosInstance({
    method: 'PATCH',
    url,
    data,
  });

  return unwrapApiResponse<T>(response);
}

/**
 * 타입 안전한 PUT 요청
 */
export async function apiPut<T>(
  url: string,
  data: any
): Promise<ApiResponse<T>> {
  const response = await axiosInstance({
    method: 'PUT',
    url,
    data,
  });

  return unwrapApiResponse<T>(response);
}

/**
 * 타입 안전한 DELETE 요청
 */
export async function apiDelete<T = void>(url: string): Promise<ApiResponse<T>> {
  const response = await axiosInstance({
    method: 'DELETE',
    url,
  });

  return unwrapApiResponse<T>(response);
}

/**
 * 커서 기반 페이지네이션 GET 요청
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

  throw new Error(response.data.message || 'API 응답 오류');
}
