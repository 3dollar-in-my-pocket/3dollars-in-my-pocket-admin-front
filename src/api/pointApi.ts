import {apiGet, apiGetPaginated} from './apiHelpers';
import {ApiResponse, PaginatedResponse} from '@/types/api';
import {PointHistory, PointHistorySortBy, UserPointBalance} from '@/types/point';

/** 포인트는 티켓(PointTicket)별로 분리 관리됩니다. */
const pointApi = {
  /** 유저의 티켓별 포인트 잔액 조회. 존재하지 않는 유저도 balance=0으로 응답합니다. */
  getUserPoint: async (userId: string, ticket: string): Promise<ApiResponse<UserPointBalance>> => {
    return apiGet<UserPointBalance>(`/v1/user/${userId}/points/${encodeURIComponent(ticket)}`);
  },

  /** 유저의 티켓별 포인트 내역 조회 (size 1~30). 다음 페이지도 첫 페이지와 같은 sortBy로 요청해야 합니다. */
  getUserPointHistories: async (
    userId: string,
    ticket: string,
    cursor: string | null = null,
    size?: number,
    sortBy: PointHistorySortBy = 'LATEST'
  ): Promise<ApiResponse<PaginatedResponse<PointHistory>>> => {
    return apiGetPaginated<PointHistory>(
      `/v1/user/${userId}/points/${encodeURIComponent(ticket)}/histories`,
      {cursor, size},
      {sortBy}
    );
  },
};

export default pointApi;
