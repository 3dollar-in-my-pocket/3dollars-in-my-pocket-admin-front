// Store related type definitions and constants
import {WriterType} from './common';
import { Address, Location, Writer } from './domain';

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
  CLOSED: 'CLOSED',
  UNKNOWN: 'UNKNOWN'
} as const;

export type OpenStatus = typeof OPEN_STATUS[keyof typeof OPEN_STATUS];

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

/** StoreFoodCategoryResponse */
export interface StoreFoodCategory {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  classification?: any;
  isNew: boolean;
  displayOrder?: number;
}

/** StoreSimpleResponse — 목록/이력 응답에 포함되는 가게 요약 정보 */
export interface SimpleStore {
  storeId: number;
  storeType: StoreType;
  name: string;
  rating: number;
  address: Address;
  categories: StoreFoodCategory[];
  status: StoreStatus;
  labels: StoreLabel[];
  activitiesStatus: ActivitiesStatus;
  location?: Location;
  createdAt?: string;
  updatedAt?: string;
}

/** StoreSalesTypeResponse */
export interface StoreSalesType {
  type: SalesType;
  description: string;
}

/** StoreOpenResponse */
export interface StoreOpen {
  status: OpenStatus;
  openStartDateTime?: string;
  isOpening: boolean;
}

/** StoreOpeningHoursResponse */
export interface StoreOpeningHours {
  startTime?: string;
  endTime?: string;
  extra?: string;
}

/** StoreMenuResponse */
export interface StoreMenu {
  name: string;
  description: string;
  price?: number;
  imageUrl?: string;
  count?: number;
  category?: StoreFoodCategory;
}

/** StoreMetadataResponse */
export interface StoreMetadata {
  reviewCount: number;
  subscriberCount: number;
  reportCount: number;
}

/**
 * StoreDetailResponse — 가게 상세 조회(GET /v1/store/{storeId}) 응답
 *
 * 목록 응답(SimpleStore)에는 없는 salesType, openStatus, menus,
 * appearanceDays, paymentMethods, metadata를 포함합니다.
 */
export interface StoreDetail {
  storeId: number;
  storeType: StoreType;
  name: string;
  rating: number;
  address: Address;
  categories: StoreFoodCategory[];
  appearanceDays: string[];
  paymentMethods: string[];
  menus: StoreMenu[];
  status: StoreStatus;
  activitiesStatus: ActivitiesStatus;
  labels: StoreLabel[];
  owner?: Writer;
  salesType?: StoreSalesType;
  location?: Location;
  openingHours?: StoreOpeningHours;
  openStatus?: StoreOpen;
  metadata?: StoreMetadata;
  createdAt?: string;
  updatedAt?: string;
}
