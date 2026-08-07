import {apiDelete, apiGet} from './apiHelpers';

const pollApi = {
  // 투표 카테고리 목록 조회
  getPollCategories: async () => {
    return apiGet<any>('/v1/poll-categories');
  },

  // 카테고리별 투표 목록 조회
  getPolls: async (category: any, size = 30, cursor: any = null) => {
    return apiGet<any>('/v1/polls', {
      category,
      size,
      ...(cursor && {cursor})
    });
  },

  // 투표 삭제
  deletePoll: async (pollId: any) => {
    return apiDelete(`/v1/poll/${pollId}`);
  }
};

export default pollApi;
