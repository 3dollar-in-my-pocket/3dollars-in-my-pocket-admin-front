/**
 * 광고 요일·시간대 노출 제한(displayWindow) 입력값 검증 — 서버 400 에러 조건과 동일하게 화면에서 먼저 막습니다.
 */

import {AdvertisementDisplayWindow} from '@/types/advertisement';

export const validateDisplayWindow = (window?: AdvertisementDisplayWindow | null): string | null => {
  if (!window) return null;

  if (window.daysOfWeek.length === 0) {
    return '노출 요일을 1개 이상 선택해주세요.';
  }
  if (!window.startTime !== !window.endTime) {
    return '노출 시작 시각과 종료 시각을 함께 입력해주세요.';
  }
  if (window.startTime && window.startTime === window.endTime) {
    return '노출 시작 시각과 종료 시각을 다르게 입력해주세요.';
  }
  return null;
};
