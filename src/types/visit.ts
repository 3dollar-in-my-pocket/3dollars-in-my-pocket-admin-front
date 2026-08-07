/**
 * 방문 관련 타입 정의
 */

import { SimpleStore, SimpleUser } from './domain';

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
  visitor?: SimpleUser;
  createdAt?: string;
  updatedAt?: string;
}

/** 응답 스키마가 Visit과 동일합니다. */
export type UserVisit = Visit;

/**
 * 하위 호환용 re-export
 *
 * 표시 로직은 utils/display/visitDisplay.ts로 옮겼습니다.
 * 새 코드는 원본 경로에서 직접 import하세요.
 */
export {
  getVisitTypeDisplayName,
  getVisitTypeBatchClass,
  getVisitIconClass
} from '../utils/display/visitDisplay';
