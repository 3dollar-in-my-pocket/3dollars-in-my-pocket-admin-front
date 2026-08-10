/**
 * 신고 관련 타입 정의
 */

import {SimpleStore} from './store';
import {SimpleUser} from './user';

export type ReportReasonCode = 'NOSTORE' | 'WRONGNOPOSITION' | 'OVERLAPSTORE' | 'WRONG_CONTENT';

/** StoreReportReasonResponse */
export interface StoreReportReason {
  type: ReportReasonCode;
  description: string;
}

/**
 * StoreReportResponse
 */
export interface StoreReport {
  reportId: number;
  storeId: number;
  store?: SimpleStore;
  reporter?: SimpleUser;
  reason: StoreReportReason;
  createdAt?: string;
  updatedAt?: string;
}

export const REPORT_REASON: Record<ReportReasonCode, ReportReasonCode> = {
  'NOSTORE': 'NOSTORE',
  'WRONGNOPOSITION': 'WRONGNOPOSITION',
  'OVERLAPSTORE': 'OVERLAPSTORE',
  'WRONG_CONTENT': 'WRONG_CONTENT'
}
