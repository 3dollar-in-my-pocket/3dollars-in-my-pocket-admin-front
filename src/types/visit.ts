/**
 * 방문 관련 타입 정의
 */

export interface Visit {
  visitId: string;
  createdAt: string;
  visitType: string;
  visitor?: {
    userId: string;
    name: string;
  };
}

export interface UserVisit extends Visit {
  store?: {
    storeId: string;
    name: string;
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
