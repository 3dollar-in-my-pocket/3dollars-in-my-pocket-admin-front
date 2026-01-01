import { CursorPaginationParams, IncludeType, ApiResponse, PaginatedResponse } from '../types/api';
import { PAGINATION_DEFAULTS, NONCE_HEADER } from '../constants/api';
import { AxiosResponse } from 'axios';

/**
 * 커서 기반 페이지네이션 파라미터 빌드
 * 8개 이상의 파일에서 중복되던 로직을 공통화
 */
export function buildCursorParams(
  cursor: string | null = null,
  size: number = PAGINATION_DEFAULTS.CURSOR_SIZE
): Record<string, string | number> {
  const params: Record<string, string | number> = { size };

  if (cursor) {
    params.cursor = cursor;
  }

  return params;
}

/**
 * includes 파라미터 빌드
 * 단일 값 또는 배열을 처리하여 쉼표로 구분된 문자열 반환
 */
export function buildIncludesParam(includes?: IncludeType | IncludeType[]): string | undefined {
  if (!includes) return undefined;

  if (Array.isArray(includes)) {
    return includes.join(',');
  }

  return includes;
}

/**
 * Nonce 헤더 객체 생성
 * 푸시, 광고, FAQ 생성 시 사용
 */
export function buildNonceHeader(nonce?: string): Record<string, string> {
  if (!nonce) return {};

  return {
    [NONCE_HEADER]: nonce,
  };
}

/**
 * API 응답 언래핑
 * 표준 { ok: true, data: {...} } 래퍼에서 데이터 추출
 */
export function unwrapApiResponse<T>(response: AxiosResponse): ApiResponse<T> {
  if (response.data.ok) {
    return {
      ok: true,
      data: response.data.data,
    };
  }

  throw new Error(response.data.message || 'API 응답 오류');
}

/**
 * API 커서 응답을 표준화된 형식으로 변환
 * totalCount가 없는 경우도 처리
 */
export function normalizeCursorResponse<T>(data: any): PaginatedResponse<T> {
  const cursor = data?.cursor || {};

  return {
    contents: data?.contents || [],
    cursor: {
      hasMore: cursor.hasMore || false,
      nextCursor: cursor.nextCursor || null,
      ...(cursor.totalCount !== undefined && { totalCount: cursor.totalCount }),
    },
  };
}

/**
 * 배열 파라미터를 쉼표로 구분된 문자열로 변환
 * targetStores, userIds 등에 사용
 */
export function buildArrayParam<T extends string | number>(
  values?: T[] | null
): string | undefined {
  if (!values || values.length === 0) return undefined;

  return values.join(',');
}
