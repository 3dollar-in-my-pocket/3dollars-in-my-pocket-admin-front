import {apiGet, apiGetPaginated} from './apiHelpers';
import {ApiResponse, PaginatedResponse} from '@/types/api';
import {PointHistory, UserPointBalance} from '@/types/point';

/** 포인트는 티켓(PointTicket)별로 분리 관리됩니다. */
const pointApi = {
  /** 유저의 티켓별 포인트 잔액 조회. 존재하지 않는 유저도 balance=0으로 응답합니다. */
  getUserPoint: async (userId: string, ticket: string): Promise<ApiResponse<UserPointBalance>> => {
    return apiGet<UserPointBalance>(`/v1/user/${userId}/points/${encodeURIComponent(ticket)}`);
  },

  /** 유저의 티켓별 포인트 내역 조회 (최신순, size 1~30) */
  getUserPointHistories: async (
    userId: string,
    ticket: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<PointHistory>>> => {
    return apiGetPaginated<PointHistory>(
      `/v1/user/${userId}/points/${encodeURIComponent(ticket)}/histories`,
      {cursor, size}
    );
  },
};

export default pointApi;
