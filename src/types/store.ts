// Store related type definitions and constants
import { WRITER_TYPE, getWriterTypeBadgeClass, WriterType } from './common';
import { BaseEntity } from './api';

// Store status types (using common STATUS constants)
export const STORE_STATUS = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
  AUTO_DELETED: 'AUTO_DELETED',
} as const;

export type StoreStatus = typeof STORE_STATUS[keyof typeof STORE_STATUS];

// Store activities status types
export const ACTIVITIES_STATUS = {
  RECENT_ACTIVITY: 'RECENT_ACTIVITY',
  NO_RECENT_ACTIVITY: 'NO_RECENT_ACTIVITY'
} as const;

export type ActivitiesStatus = typeof ACTIVITIES_STATUS[keyof typeof ACTIVITIES_STATUS];

// Sales type
export const SALES_TYPE = {
  ROAD: 'ROAD',
  STORE: 'STORE',
  CONVENIENCE_STORE: 'CONVENIENCE_STORE',
  FOOD_TRUCK: 'FOOD_TRUCK'
} as const;

export type SalesType = typeof SALES_TYPE[keyof typeof SALES_TYPE];

// Open status
export const OPEN_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
} as const;

export type OpenStatus = typeof OPEN_STATUS[keyof typeof OPEN_STATUS];

// Re-export WRITER_TYPE for backward compatibility
export { WRITER_TYPE };

// Store type
export const STORE_TYPE = {
  USER_STORE: 'USER_STORE',
  BOSS_STORE: 'BOSS_STORE'
} as const;

export type StoreType = typeof STORE_TYPE[keyof typeof STORE_TYPE];

// Search types
export const STORE_SEARCH_TYPES = {
  KEYWORD: 'keyword',
  RECENT: 'recent'
} as const;

export type StoreSearchType = typeof STORE_SEARCH_TYPES[keyof typeof STORE_SEARCH_TYPES];

// Store interfaces
export interface Store extends BaseEntity {
  name: string;
  status: StoreStatus;
  activitiesStatus?: ActivitiesStatus;
  salesType: SalesType;
  openStatus?: OpenStatus;
  storeType: StoreType;
  rating?: number;
  categoryId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface StoreSearchRequest {
  type: StoreSearchType;
  keyword?: string;
  cursor?: string | null;
  size: number;
}

export interface StoreSearchResponse {
  stores: Store[];
  hasMore: boolean;
  nextCursor?: string | null;
  totalCount: number;
}

// Utility functions
export const getStoreStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return '활성된 가게';
    case 'AUTO_DELETED':
      return '자동 삭제된 가게';
    case 'DELETED':
      return '삭제된 가게';
    default:
      return '알 수 없음';
  }
};

export const getStoreStatusBadgeClass = (status: StoreStatus): string => {
  switch (status) {
    case STORE_STATUS.ACTIVE:
      return 'bg-success';
    case STORE_STATUS.AUTO_DELETED:
      return 'bg-danger';
    case STORE_STATUS.DELETED:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

export const getActivitiesStatusDisplayName = (activitiesStatus: ActivitiesStatus): string => {
  switch (activitiesStatus) {
    case ACTIVITIES_STATUS.RECENT_ACTIVITY:
      return '최근 활동 있는 가게';
    case ACTIVITIES_STATUS.NO_RECENT_ACTIVITY:
      return '최근 활동 없는 가게';
    default:
      return '최근 활동 알 수 없는 가게';
  }
};

export const getActivitiesStatusBadgeClass = (activitiesStatus: ActivitiesStatus): string => {
  switch (activitiesStatus) {
    case ACTIVITIES_STATUS.RECENT_ACTIVITY:
      return 'bg-primary';
    case ACTIVITIES_STATUS.NO_RECENT_ACTIVITY:
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

export const formatRating = (rating?: number): string => {
  if (!rating || rating <= 0) {
    return '아직 리뷰가 없어요';
  }
  return `${rating.toFixed(1)}점`;
};

export const validateStoreSearch = (searchType: StoreSearchType, keyword: string): string | null => {
  if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
    if (!keyword || !keyword.trim()) {
      return '검색어를 입력해주세요.';
    }
  }

  return null;
};

export const getCategoryIcon = (categoryId: string): string => {
  // 카테고리별 아이콘 매핑
  const categoryIconMap = {
    'JAPANESE_CUISINE': 'bi-emoji-smile',
    'WESTERN_CUISINE': 'bi-cup-hot',
    'GUNGOGUMA': 'bi-fire',
    'DEFAULT': 'bi-shop'
  };

  return categoryIconMap[categoryId] || categoryIconMap['DEFAULT'];
};

export const getSalesTypeDisplayName = (salesType: SalesType): string => {
  switch (salesType) {
    case SALES_TYPE.ROAD:
      return '길거리';
    case SALES_TYPE.STORE:
      return '매장';
    default:
      return '알 수 없음';
  }
};

export const getSalesTypeBadgeClass = (salesType: SalesType): string => {
  switch (salesType) {
    case SALES_TYPE.ROAD:
      return 'bg-info';
    case SALES_TYPE.STORE:
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

export const getOpenStatusDisplayName = (openStatus: OpenStatus): string => {
  switch (openStatus) {
    case OPEN_STATUS.OPEN:
      return '영업중';
    case OPEN_STATUS.CLOSED:
      return '영업종료';
    default:
      return '알 수 없음';
  }
};

export const getOpenStatusBadgeClass = (openStatus: OpenStatus): string => {
  switch (openStatus) {
    case OPEN_STATUS.OPEN:
      return 'bg-success';
    case OPEN_STATUS.CLOSED:
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

// Re-export getWriterTypeBadgeClass for backward compatibility
export { getWriterTypeBadgeClass };

export const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toLocaleString();
};

export const getStoreTypeDisplayName = (storeType: StoreType): string => {
  switch (storeType) {
    case STORE_TYPE.USER_STORE:
      return '유저 제보 가게';
    case STORE_TYPE.BOSS_STORE:
      return '사장님 가게';
    default:
      return '알 수 없음';
  }
};

export const getStoreTypeBadgeClass = (storeType: StoreType): string => {
  switch (storeType) {
    case STORE_TYPE.USER_STORE:
      return 'bg-info';
    case STORE_TYPE.BOSS_STORE:
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

export const getStoreTypeIcon = (storeType: StoreType): string => {
  switch (storeType) {
    case STORE_TYPE.USER_STORE:
      return 'bi-people-fill';
    case STORE_TYPE.BOSS_STORE:
      return 'bi-person-badge-fill';
    default:
      return 'bi-question-circle-fill';
  }
};

// 가게 기능 지원 여부 체크 함수들 (확장 가능)
export const isPostsSupported = (storeType: StoreType): boolean => {
  const supportedTypes: StoreType[] = [STORE_TYPE.BOSS_STORE];
  return supportedTypes.includes(storeType);
};

export const isMessagesSupported = (storeType: StoreType): boolean => {
  const supportedTypes: StoreType[] = [STORE_TYPE.BOSS_STORE];
  return supportedTypes.includes(storeType);
};

export const isVisitsSupported = (storeType: StoreType): boolean => {
  const supportedTypes: StoreType[] = [STORE_TYPE.USER_STORE];
  return supportedTypes.includes(storeType);
};

export const isImagesSupported = (storeType: StoreType): boolean => {
  const supportedTypes: StoreType[] = [STORE_TYPE.USER_STORE];
  return supportedTypes.includes(storeType);
};

export const isReportsSupported = (storeType: StoreType): boolean => {
  const supportedTypes: StoreType[] = [STORE_TYPE.USER_STORE];
  return supportedTypes.includes(storeType);
};

export const getFeatureUnsupportedMessage = (featureName: string, supportedStoreTypeName = '사장님 가게'): string => {
  return `${featureName} 기능은 ${supportedStoreTypeName}에서만 지원하고 있습니다.`;
};
