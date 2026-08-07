/**
 * 방문 관련 타입 정의
 */

import {SimpleStore} from './store';
import {SimpleUser} from './user';

/** 방문 유형 코드 (StoreVisitTypeResponse.type) */
export type VisitTypeCode = 'EXISTS' | 'NOT_EXISTS';

/** StoreVisitTypeResponse */
export interface VisitType {
  type: VisitTypeCode;
  description: string;
}

/**
 * StoreVisitResponse
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
