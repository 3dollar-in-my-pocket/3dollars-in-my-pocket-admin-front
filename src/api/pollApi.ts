import {apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost} from './apiHelpers';
import {ContentListResponse} from '@/types/api';
import {
  CreatePollPinRequest,
  Poll,
  PollCategory,
  PollPin,
  PollSortType,
  UpdatePollPinRequest
} from '@/types/poll';

const pollApi = {
  // 투표 카테고리 목록 조회
  getPollCategories: async () => {
    return apiGet<ContentListResponse<PollCategory>>('/v1/poll-categories');
  },

  // 카테고리별 투표 목록 조회 (POPULAR는 커서 없이 한 페이지만 반환)
  getPolls: async (category: string, size = 30, cursor: string | null = null, sortType: PollSortType = 'LATEST') => {
    return apiGetPaginated<Poll>('/v1/polls', {cursor, size}, {category, sortType});
  },

  // 투표 제목 부분 일치 검색 (전체 카테고리, 최신순)
  searchPolls: async (title: string, size = 20, cursor: string | null = null) => {
    return apiGetPaginated<Poll>('/v1/search/polls', {cursor, size}, {title});
  },

  // 투표 삭제
  deletePoll: async (pollId: number | string) => {
    return apiDelete(`/v1/poll/${pollId}`);
  },

  // 고정 노출 설정 목록 조회 (예정·노출 중·종료 설정 모두 포함)
  getPollPins: async (categoryId: string) => {
    return apiGet<ContentListResponse<PollPin>>('/v1/poll-pins', {categoryId});
  },

  // 고정 노출 설정 등록
  createPollPin: async (request: CreatePollPinRequest) => {
    return apiPost<PollPin>('/v1/poll-pin', request);
  },

  // 고정 노출 설정 수정 (전달한 필드만 변경)
  updatePollPin: async (pollPinId: number, request: UpdatePollPinRequest) => {
    return apiPatch<PollPin>(`/v1/poll-pin/${pollPinId}`, request);
  },

  // 고정 노출 설정 삭제
  deletePollPin: async (pollPinId: number) => {
    return apiDelete(`/v1/poll-pin/${pollPinId}`);
  }
};

export default pollApi;
