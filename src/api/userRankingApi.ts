import {apiGetPaginated} from './apiHelpers';
import {UserRankingItem, UserRankingRequest, UserRankingResponse} from '@/types/userRanking';

export default {
  /**
   * 유저 랭킹 조회
   */
  getUserRankings: async (request: UserRankingRequest): Promise<UserRankingResponse> => {
    return apiGetPaginated<UserRankingItem>(
      `/v1/user-rankings/${request.userRankingType}`,
      {cursor: request.cursor, size: request.size}
    );
  }
};
