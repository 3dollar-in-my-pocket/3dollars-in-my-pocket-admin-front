/**
 * 신고 관련 타입 정의
 */

export interface StoreReportReason {
  type: string;
  description: string;
}

export interface StoreReportReporter {
  userId: number;
  name: string;
  socialType: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreReportStore {
  storeId: number;
  storeType: string;
  name: string;
  rating: number;
  address: any;
  categories: any[];
  status: string;
  labels: any[];
  activitiesStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreReport {
  reportId: string;
  reason: string | StoreReportReason;
  createdAt: string;
  reporter?: {
    userId: string | number;
    name: string;
    socialType?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface UserStoreReport extends StoreReport {
  store?: {
    storeId: string | number;
    name: string;
    storeType?: string;
  };
}

export interface AllStoreReport {
  reportId: number;
  storeId: number;
  store?: StoreReportStore;
  reporter?: StoreReportReporter;
  reason: StoreReportReason;
  createdAt: string;
  updatedAt: string;
}

export const REPORT_REASON = {
  'NOSTORE': 'NOSTORE',
  'WRONGPOSITION': 'WRONGPOSITION',
  'OVERLAPSTORE': 'OVERLAPSTORE',
  'WRONG_CONTENT': 'WRONG_CONTENT'
}

export const getReportReasonBadgeClass = (reason) => {
  switch (reason) {
    case REPORT_REASON.NOSTORE:
      return 'bg-primary';
    case REPORT_REASON.WRONGPOSITION:
      return 'bg-warning';
    case REPORT_REASON.OVERLAPSTORE:
      return 'bg-info';
    case REPORT_REASON.WRONG_CONTENT:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}
