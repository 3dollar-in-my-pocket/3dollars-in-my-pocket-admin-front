export interface ApiResponse<T = any> {
  ok: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  contents: T[];
  cursor: {
    hasMore: boolean;
    nextCursor?: string;
  };
}

export interface ApiError {
  message: string;
  error: string;
}