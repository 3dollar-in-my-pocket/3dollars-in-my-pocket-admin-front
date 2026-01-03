// Writer type constants
export const WRITER_TYPE = {
  USER: 'USER',
  STORE: 'STORE',
} as const;

export type WriterType = typeof WRITER_TYPE[keyof typeof WRITER_TYPE];

// Writer type display names
export const getWriterTypeDisplayName = (writerType: WriterType): string => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return '손님';
    case WRITER_TYPE.STORE:
      return '사장님';
    default:
      return '알 수 없음';
  }
};

// Writer type badge classes
export const getWriterTypeBadgeClass = (writerType: WriterType): string => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return 'bg-primary';
    case WRITER_TYPE.STORE:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

// Writer type background classes with opacity
export const getWriterTypeBgClass = (writerType: WriterType): string => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return 'bg-primary bg-opacity-10';
    case WRITER_TYPE.STORE:
      return 'bg-danger bg-opacity-10';
    default:
      return 'bg-secondary bg-opacity-10';
  }
};

// Writer type text colors
export const getWriterTypeTextClass = (writerType: WriterType): string => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return 'text-primary';
    case WRITER_TYPE.STORE:
      return 'text-danger';
    default:
      return 'text-secondary';
  }
};

// Writer type icons
export const getWriterTypeIcon = (writerType: WriterType): string => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return 'bi-person';
    case WRITER_TYPE.STORE:
      return 'bi-shop';
    default:
      return 'bi-question-circle';
  }
};

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