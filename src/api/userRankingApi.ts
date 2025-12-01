import axiosInstance from './apiBase';
import { UserRankingRequest, UserRankingResponse } from '../types/userRanking';

export default {
  /**
   * 유저 랭킹 조회
   */
  getUserRankings: async (request: UserRankingRequest): Promise<UserRankingResponse> => {
    try {
      const params: any = {};

      if (request.cursor) {
        params.cursor = request.cursor;
      }

      if (request.size) {
        params.size = request.size;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/user-rankings/${request.userRankingType}`,
        params
      });

      return response.data;
    } catch (error: any) {
      return error.response;
    }
  }
};
