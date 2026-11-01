import {apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost} from './apiHelpers';
import {ContentListResponse} from '@/types/api';
import {CreatePollPinRequest, Poll, PollCategory, PollPin, UpdatePollPinRequest} from '@/types/poll';

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
  },

  // 고정 노출 설정 목록 조회 (종료되지 않은 설정만, position 오름차순)
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
