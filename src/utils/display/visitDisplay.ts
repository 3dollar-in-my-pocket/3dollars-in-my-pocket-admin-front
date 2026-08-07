/**
 * 방문 유형 표시 로직 (라벨, 배지 클래스, 아이콘)
 *
 * 타입과 상수 정의는 types/visit.ts에 있습니다.
 */

import {VisitTypeCode} from '@/types/visit';

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
