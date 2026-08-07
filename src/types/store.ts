// Store related type definitions and constants
import {WRITER_TYPE, WriterType, getWriterTypeBadgeClass} from './common';

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
export {WRITER_TYPE};

// Store type
export const STORE_TYPE = {
  USER_STORE: 'USER_STORE',
  BOSS_STORE: 'BOSS_STORE'
} as const;

export type StoreType = typeof STORE_TYPE[keyof typeof STORE_TYPE];

// Store label types
export const STORE_LABEL = {
  VERIFIED: 'VERIFIED'
} as const;

export type StoreLabel = typeof STORE_LABEL[keyof typeof STORE_LABEL];

// Search types
export const STORE_SEARCH_TYPES = {
  KEYWORD: 'keyword',
  RECENT: 'recent',
  STORE_ID: 'storeId'
} as const;

export type StoreSearchType = typeof STORE_SEARCH_TYPES[keyof typeof STORE_SEARCH_TYPES];

// Store interfaces
export interface Store {
  storeId: number;
  name: string;
  status: StoreStatus;
  activitiesStatus?: ActivitiesStatus;
  salesType: SalesType;
  openStatus?: OpenStatus;
  storeType: StoreType;
  rating?: number;
  categoryId?: string;
  labels?: StoreLabel[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

// Re-export getWriterTypeBadgeClass for backward compatibility
export {getWriterTypeBadgeClass};

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

// Change attribute types
export const CHANGE_ATTRIBUTE_TYPE = {
  NAME: 'NAME',
  LOCATION: 'LOCATION',
  OPENING_DAY: 'OPENING_DAY',
  OPENING_HOUR: 'OPENING_HOUR',
  SALES_TYPE: 'SALES_TYPE',
  PAYMENT_METHOD: 'PAYMENT_METHOD'
} as const;

export type ChangeAttributeType = typeof CHANGE_ATTRIBUTE_TYPE[keyof typeof CHANGE_ATTRIBUTE_TYPE];

// Store change history interfaces
export interface ChangeAttribute {
  attributeType: ChangeAttributeType;
  description: string;
}

export interface ChangeHistoryActor {
  writerId: string;
  writerType: WriterType;
  name: string;
}

export interface StoreChangeHistory {
  changeAttributes: ChangeAttribute[];
  actor: ChangeHistoryActor;
  changedAt: string;
}

/**
 * 하위 호환용 re-export
 *
 * 표시·검증·포맷 로직은 아래 위치로 옮겼습니다. 새 코드는 원본 경로에서
 * 직접 import하세요.
 */
export {
  getStoreStatusDisplayName,
  getStoreStatusBadgeClass,
  getActivitiesStatusDisplayName,
  getActivitiesStatusBadgeClass,
  getCategoryIcon,
  getSalesTypeDisplayName,
  getSalesTypeBadgeClass,
  getOpenStatusDisplayName,
  getOpenStatusBadgeClass,
  getStoreTypeDisplayName,
  getStoreTypeBadgeClass,
  getStoreTypeIcon,
  getChangeAttributeIcon,
  getChangeAttributeBadgeClass,
  getLabelDisplayName,
  getLabelBadgeClass,
  getLabelIcon
} from '../utils/display/storeDisplay';
export {validateStoreSearch} from '../utils/validation/storeValidation';
export {formatRating, formatCount} from '../utils/formatUtils';
