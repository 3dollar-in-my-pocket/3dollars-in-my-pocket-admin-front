/**
 * 방문 관련 타입 정의
 */

export interface Visit {
  visitId: string;
  /** 방문 일시 */
  visitDateTime: string;
  createdAt?: string;
  /** 문자열 코드 또는 { type, description } 객체로 응답됩니다. */
  visitType: string | { type?: string; description?: string };
  /** 일부 응답에서 방문 유형이 최상위 type으로 내려옵니다. */
  type?: string;
  visitor?: {
    userId: string;
    name: string;
  };
  device?: {
    os?: string;
    version?: string;
  };
}

export interface UserVisit extends Visit {
  store?: {
    storeId: string;
    name: string;
    storeType?: string;
    address?: any;
    salesType?: any;
    status?: string;
    activitiesStatus?: string;
    rating?: number;
    categories?: any[];
  };
}

// 방문 타입 표시 이름
export const getVisitTypeDisplayName = (visitType: string): string => {
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
export const getVisitTypeBatchClass = (visitType: string): string => {
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
export const getVisitIconClass = (visitType: string): string => {
  switch (visitType) {
    case 'EXISTS':
      return 'bi-check-circle-fill';
    case 'NOT_EXISTS':
      return 'bi-x-circle-fill';
    default:
      return 'bi-question-circle-fill';
  }
};
