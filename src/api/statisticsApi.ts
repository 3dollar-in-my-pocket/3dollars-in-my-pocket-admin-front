import {ApiResponse, ContentListResponse} from "@/types/api";
import {DailyStatistic, PushStatistic, PushStatisticsUnit} from "@/types/statistics";
import {apiGet} from "./apiHelpers";

export default {
  getDailyStatistics: async (
    statisticsType: string,
    startDate: string,
    endDate: string,
    groupId?: string
  ): Promise<ApiResponse<ContentListResponse<DailyStatistic>>> => {
    return apiGet<ContentListResponse<DailyStatistic>>(`/statistics/daily`, {
      type: statisticsType,
      startDate,
      endDate,
      ...(groupId && {groupId}),
    });
  },

  /** 유저 앱 푸시 통계. 조회 가능 기간: 오늘-29일 <= startDate <= endDate <= 어제 */
  getPushStatistics: async (
    startDate: string,
    endDate: string,
    unit: PushStatisticsUnit
  ): Promise<ApiResponse<ContentListResponse<PushStatistic>>> => {
    return apiGet<ContentListResponse<PushStatistic>>(`/statistics/push`, {startDate, endDate, unit});
  },
};
