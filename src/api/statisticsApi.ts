import axiosInstance from "./apiBase";
import {ApiResponse, ContentListResponse} from "@/types/api";
import {DailyStatistic} from "@/types/statistics";

export default {
  getDailyStatistics: async (
    statisticsType: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ContentListResponse<DailyStatistic>>> => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: `/statistics/daily`,
        params: {
          type: statisticsType,          
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
