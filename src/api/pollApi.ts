import {apiDelete, apiGet, apiGetPaginated} from './apiHelpers';
import {ContentListResponse} from '../types/api';
import {Poll, PollCategory} from '../types/poll';

const pollApi = {
  // 투표 카테고리 목록 조회
  getPollCategories: async () => {
    return apiGet<ContentListResponse<PollCategory>>('/v1/poll-categories');
  },

  // 카테고리별 투표 목록 조회
  getPolls: async (category: string, size = 30, cursor: string | null = null) => {
    return apiGetPaginated<Poll>('/v1/polls', {cursor, size}, {category});
  },

  // 투표 삭제
  deletePoll: async (pollId: number | string) => {
    return apiDelete(`/v1/poll/${pollId}`);
  }
};

export default pollApi;
