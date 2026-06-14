import {apiGet} from './apiHelpers';
import {ApiResponse} from '../types/api';
import {StorePostList, StorePostSort} from '../types/storePost';

const storePostApi = {
  /**
   * 전체 가게 소식 조회
   */
  getStorePosts: async (
    sortBy: StorePostSort,
    cursor: string | null = null
  ): Promise<ApiResponse<StorePostList>> => {
    return apiGet<StorePostList>('/v1/store-posts', {
      sortBy,
      ...(cursor ? {cursor} : {}),
    });
  },
};

export default storePostApi;
