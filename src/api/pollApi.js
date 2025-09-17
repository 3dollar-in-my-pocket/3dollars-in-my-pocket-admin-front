import apiBase from './apiBase';

const pollApi = {
  // 투표 카테고리 목록 조회
  getPollCategories: async () => {
    try {
      const response = await apiBase.get('/v1/poll-categories');
      return response.data;
    } catch (error) {
      console.error('투표 카테고리 조회 실패:', error);
      throw error;
    }
  },

  // 카테고리별 투표 목록 조회
  getPolls: async (category, size = 30, cursor = null) => {
    try {
      const params = new URLSearchParams({
        category,
        size: size.toString()
      });

      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await apiBase.get(`/v1/polls?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('투표 목록 조회 실패:', error);
      throw error;
    }
  }
};

export default pollApi;