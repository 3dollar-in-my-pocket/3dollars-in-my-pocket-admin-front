export interface ApiResponse<T = any> {
  ok: boolean;
  data: T;
  message?: string;
}

// 커서 정보
export interface CursorInfo {
  hasMore: boolean;
  nextCursor?: string | null;
  totalCount?: number;
}

// 커서 기반 페이지네이션 응답
export interface PaginatedResponse<T> {
  contents: T[];
  cursor: CursorInfo;
}

// 커서 기반 페이지네이션 파라미터
export interface CursorPaginationParams {
  cursor?: string | null;
  size?: number;
}

// 페이지 기반 페이지네이션 파라미터
export interface PagePaginationParams {
  page: number;
  size: number;
}

// 페이지 기반 페이지네이션 응답
export interface PagePaginatedResponse<T> {
  contents: T[];
  page: {
    totalPage: number;
    totalSize: number;
  };
}

// 컨텐츠 목록 응답
export interface ContentListResponse<T> {
  contents: T[];
}

// Include 파라미터 타입
export type IncludeType = 'WRITER' | 'STORE' | 'VISITOR' | 'REPORTER';

// API 요청 옵션
export interface ApiRequestOptions {
  suppressToast?: boolean;
  nonce?: string;
  includes?: IncludeType | IncludeType[];
}

// API 에러 응답
export interface ApiErrorResponse {
  ok: false;
  message: string;
  status?: number;
}
