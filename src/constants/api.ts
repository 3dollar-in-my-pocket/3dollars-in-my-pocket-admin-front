/**
 * API Constants
 * API 연동 관련 상수 모음
 */

// 페이지네이션 기본값
export const PAGINATION_DEFAULTS = {
  CURSOR_SIZE: 20,
  PAGE_SIZE: 10,
  LARGE_SIZE: 30,
} as const;

// Nonce 헤더 이름
export const NONCE_HEADER = 'X-Nonce-Token';

// Include 파라미터 값
export const INCLUDES = {
  WRITER: 'WRITER',
  STORE: 'STORE',
  VISITOR: 'VISITOR',
  REPORTER: 'REPORTER',
} as const;

// API 응답 상태
export const API_STATUS = {
  OK: true,
  ERROR: false,
} as const;
