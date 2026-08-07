/**
 * 방문 관련 타입 정의
 */

import { SimpleStore, User } from './domain';

/** 방문 유형 코드 (StoreVisitTypeResponse.type) */
export type VisitTypeCode = 'EXISTS' | 'NOT_EXISTS';

/** StoreVisitTypeResponse */
export interface VisitType {
  type: VisitTypeCode;
  description: string;
}

/**
 * StoreVisitResponse
 *
 * 가게 방문 목록(GET /v1/store/{storeId}/visits)과
 * 사용자 방문 이력(GET /v1/user/{userId}/store-visits)이 동일하게 사용합니다.
 * 전자는 visitor를, 후자는 store를 채워 내려줍니다.
 */
export interface Visit {
  visitId: string;
  visitType: VisitType;
  /** 방문 일시 */
  visitDateTime: string;
  store?: SimpleStore;
  visitor?: User;
  createdAt?: string;
  updatedAt?: string;
}

/** 응답 스키마가 Visit과 동일합니다. */
export type UserVisit = Visit;

// 방문 타입 표시 이름
export const getVisitTypeDisplayName = (visitType: VisitTypeCode): string => {
  switch (visitType) {
    case 'EXISTS':
      return '존재해요';
    case 'NOT_EXISTS':
      return '없어졌어요';
    default:
      return visitType;
  }
};

// 방문 타입 배지 클래스
export const getVisitTypeBatchClass = (visitType: VisitTypeCode): string => {
  switch (visitType) {
    case 'EXISTS':
      return 'bg-success';
    case 'NOT_EXISTS':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

// 방문 타입 아이콘 클래스
export const getVisitIconClass = (visitType: VisitTypeCode): string => {
  switch (visitType) {
    case 'EXISTS':
      return 'bi-check-circle-fill';
    case 'NOT_EXISTS':
      return 'bi-x-circle-fill';
    default:
      return 'bi-question-circle-fill';
  }
};
