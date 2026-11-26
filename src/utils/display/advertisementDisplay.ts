/**
 * 광고 요일·시간대 노출 제한(displayWindow) 표시 로직
 */

import {AdvertisementDisplayWindow, DayOfTheWeek} from '@/types/advertisement';

/** 월~일 순서 (서버 응답 정렬 순서와 동일) */
export const DAYS_OF_WEEK: { key: DayOfTheWeek; label: string }[] = [
  {key: 'MONDAY', label: '월'},
  {key: 'TUESDAY', label: '화'},
  {key: 'WEDNESDAY', label: '수'},
  {key: 'THURSDAY', label: '목'},
  {key: 'FRIDAY', label: '금'},
  {key: 'SATURDAY', label: '토'},
  {key: 'SUNDAY', label: '일'},
];

/** 요일 배열을 월~일 순서로 정렬하고 중복을 제거합니다. */
export const sortDaysOfWeek = (days: DayOfTheWeek[]): DayOfTheWeek[] =>
  DAYS_OF_WEEK.map(({key}) => key).filter((key) => days.includes(key));

/** endTime 이 startTime 보다 이르면 자정을 넘는 구간입니다. (HH:mm 은 문자열 비교로 충분) */
export const isOvernightWindow = (window: AdvertisementDisplayWindow): boolean =>
  !!window.startTime && !!window.endTime && window.endTime < window.startTime;

/** 예) "금·토 22:00~02:00(다음날)", "월·화·수·목·금 종일" */
export const formatDisplayWindow = (window?: AdvertisementDisplayWindow | null): string => {
  if (!window) return '제한 없음';

  const days = sortDaysOfWeek(window.daysOfWeek)
    .map((day) => DAYS_OF_WEEK.find(({key}) => key === day)?.label)
    .join('·');

  if (!window.startTime || !window.endTime) return `${days} 종일`;

  return `${days} ${window.startTime}~${window.endTime}${isOvernightWindow(window) ? '(다음날)' : ''}`;
};
