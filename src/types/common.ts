// Writer type constants
export const WRITER_TYPE = {
  USER: 'USER',
  STORE: 'STORE',
} as const;

export type WriterType = typeof WRITER_TYPE[keyof typeof WRITER_TYPE];

// Empty State Props
export interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  };
  iconSize?: number;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

// Infinite Scroll Config
export interface InfiniteScrollConfig {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

// Modal Form Config
export interface ModalFormConfig<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<any>;
  onSuccess?: () => void;
  validate?: (values: T) => Record<string, string>;
  resetOnSuccess?: boolean;
}

// Pagination Types
export interface OffsetPaginationState {
  currentPage: number;
  totalPages: number;
  totalSize: number;
  pageSize: number;
}

export interface CursorNavigationState {
  cursor: string | null;
  hasMore: boolean;
  hasPrevious: boolean;
  previousCursors: string[];
}

/**
 * 일괄 선택 가능한 카드의 선택 핸들러
 *
 * index는 목록 내 순서, event는 Shift 키 판정에 사용합니다.
 * (Shift + 클릭 시 앵커부터 해당 항목까지 범위 선택)
 */
export type BulkSelectHandler<K extends string | number> = (
  key: K,
  index?: number,
  event?: {shiftKey?: boolean}
) => void;
