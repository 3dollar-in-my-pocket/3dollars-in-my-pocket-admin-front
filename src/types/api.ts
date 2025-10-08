export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  contents: T[];
  cursor: {
    hasMore: boolean;
    nextCursor?: string;
  };
}

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}