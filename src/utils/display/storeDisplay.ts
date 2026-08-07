/**
 * 가게 관련 표시 로직 (라벨, 배지 클래스, 아이콘)
 *
 * 타입과 상수 정의는 types/store.ts에 있습니다.
 */

import {
  ACTIVITIES_STATUS,
  ActivitiesStatus,
  OPEN_STATUS,
  OpenStatus,
  SALES_TYPE,
  SalesType,
  STORE_LABEL,
  STORE_STATUS,
  STORE_TYPE,
  StoreStatus,
  StoreType
} from '@/types/store';
import { CHANGE_ATTRIBUTE_TYPE, ChangeAttributeType } from '@/types/storeChangeHistory';

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

export const getCategoryIcon = (categoryId: string): string => {
  // 카테고리별 아이콘 매핑
  const categoryIconMap: Record<string, string> = {
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

export const getChangeAttributeIcon = (attributeType: ChangeAttributeType): string => {
  switch (attributeType) {
    case CHANGE_ATTRIBUTE_TYPE.NAME:
      return 'bi-tag-fill';
    case CHANGE_ATTRIBUTE_TYPE.LOCATION:
      return 'bi-geo-alt-fill';
    case CHANGE_ATTRIBUTE_TYPE.OPENING_DAY:
      return 'bi-calendar-week-fill';
    case CHANGE_ATTRIBUTE_TYPE.OPENING_HOUR:
      return 'bi-clock-fill';
    case CHANGE_ATTRIBUTE_TYPE.SALES_TYPE:
      return 'bi-shop';
    case CHANGE_ATTRIBUTE_TYPE.PAYMENT_METHOD:
      return 'bi-credit-card-fill';
    default:
      return 'bi-pencil-fill';
  }
};

export const getChangeAttributeBadgeClass = (attributeType: ChangeAttributeType): string => {
  switch (attributeType) {
    case CHANGE_ATTRIBUTE_TYPE.NAME:
      return 'bg-primary';
    case CHANGE_ATTRIBUTE_TYPE.LOCATION:
      return 'bg-success';
    case CHANGE_ATTRIBUTE_TYPE.OPENING_DAY:
      return 'bg-info';
    case CHANGE_ATTRIBUTE_TYPE.OPENING_HOUR:
      return 'bg-warning';
    case CHANGE_ATTRIBUTE_TYPE.SALES_TYPE:
      return 'bg-danger';
    case CHANGE_ATTRIBUTE_TYPE.PAYMENT_METHOD:
      return 'bg-secondary';
    default:
      return 'bg-dark';
  }
};

export const getLabelDisplayName = (label: string): string => {
  switch (label) {
    case STORE_LABEL.VERIFIED:
      return '인증된 가게';
    default:
      return label;
  }
};

export const getLabelBadgeClass = (label: string): string => {
  switch (label) {
    case STORE_LABEL.VERIFIED:
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

export const getLabelIcon = (label: string): string => {
  switch (label) {
    case STORE_LABEL.VERIFIED:
      return 'bi-patch-check-fill';
    default:
      return 'bi-tag-fill';
  }
};
