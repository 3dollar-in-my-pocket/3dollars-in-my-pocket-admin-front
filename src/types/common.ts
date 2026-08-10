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
