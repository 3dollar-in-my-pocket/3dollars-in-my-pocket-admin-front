/** DailyStatisticsResponse */
export interface DailyStatistic {
  date: string;
  newCount?: number;
  totalCount: number;
}

/** 푸시 통계 집계 단위 (TOTAL: 기간 합계, DAILY: 일자별) */
export type PushStatisticsUnit = 'TOTAL' | 'DAILY';

/** PushStatisticsResponse - 유저 앱 푸시 타입별 발송·노출·클릭 통계 */
export interface PushStatistic {
  startDate: string;
  endDate: string;
  pushType: string;
  sentCount: number;
  impressionCount: number;
  clickCount: number;
  /** clickCount / impressionCount 비율 (0.15 = 15%). 노출 0이면 응답에서 생략 */
  clickRate?: number | null;
}
