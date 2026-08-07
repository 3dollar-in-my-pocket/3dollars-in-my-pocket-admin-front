import {ApiResponse, ContentListResponse} from "@/types/api";
import {DailyStatistic} from "@/types/statistics";
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
      ...(groupId && { groupId }),
    });
  },
};
