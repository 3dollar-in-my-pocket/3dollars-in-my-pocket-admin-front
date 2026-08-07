/**
 * 신고 관련 타입 정의
 */

import { SimpleStore, SimpleUser } from './domain';

export type ReportReasonCode = 'NOSTORE' | 'WRONGNOPOSITION' | 'OVERLAPSTORE' | 'WRONG_CONTENT';

/** StoreReportReasonResponse */
export interface StoreReportReason {
  type: ReportReasonCode;
  description: string;
}

/**
 * StoreReportResponse
 *
 * 가게별(GET /v1/store/{storeId}/reports), 사용자별
 * (GET /v1/user/{userId}/store-reports), 전체(GET /v1/store-reports)
 * 신고 이력이 모두 동일하게 사용합니다.
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

/** 응답 스키마가 StoreReport와 동일합니다. */
export type UserStoreReport = StoreReport;

/** 응답 스키마가 StoreReport와 동일합니다. */
export type AllStoreReport = StoreReport;

export const REPORT_REASON: Record<ReportReasonCode, ReportReasonCode> = {
  'NOSTORE': 'NOSTORE',
  'WRONGNOPOSITION': 'WRONGNOPOSITION',
  'OVERLAPSTORE': 'OVERLAPSTORE',
  'WRONG_CONTENT': 'WRONG_CONTENT'
}

export const getReportReasonBadgeClass = (reason: ReportReasonCode): string => {
  switch (reason) {
    case REPORT_REASON.NOSTORE:
      return 'bg-primary';
    case REPORT_REASON.WRONGNOPOSITION:
      return 'bg-warning';
    case REPORT_REASON.OVERLAPSTORE:
      return 'bg-info';
    case REPORT_REASON.WRONG_CONTENT:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}
