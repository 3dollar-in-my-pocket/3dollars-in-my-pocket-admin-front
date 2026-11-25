import {apiGet, apiGetPaginated, apiPost} from './apiHelpers';
import {ApiResponse, PaginatedResponse} from '@/types/api';
import {
  PointBalanceSortBy,
  PointHistory,
  PointHistorySortBy,
  UserPointBalance,
  UserPointBalanceItem,
} from '@/types/point';

/** 포인트는 티켓(PointTicket)별로 분리 관리됩니다. */
const pointApi = {
  /**
   * 포인트 티켓의 유저 잔액 목록 조회 (유저 계정만, size 1~30).
   * 다음 페이지도 첫 페이지와 같은 sortBy로 요청해야 하며, 형식이 틀린 커서는 400 invalid_cursor입니다.
   */
  getPointBalances: async (
    ticket: string,
    cursor: string | null = null,
    size?: number,
    sortBy: PointBalanceSortBy = 'BALANCE_DESC'
  ): Promise<ApiResponse<PaginatedResponse<UserPointBalanceItem>>> => {
    return apiGetPaginated<UserPointBalanceItem>(
      `/v1/points/${encodeURIComponent(ticket)}/users`,
      {cursor, size},
      {sortBy}
    );
  },

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

  /**
   * 유저의 적립(EARN) 내역 1건 회수. 새로 생긴 회수(REVOKE) 내역을 반환합니다.
   * 한 적립 내역은 한 번만 회수할 수 있으며(409 already_revoked_point), 되돌리는 API는 없습니다.
   * 잔액이 회수 금액보다 적으면 400 insufficient_point_to_revoke입니다.
   */
  revokeUserPointHistory: async (
    userId: string,
    ticket: string,
    pointHistoryId: string
  ): Promise<ApiResponse<PointHistory>> => {
    return apiPost<PointHistory>(
      `/v1/user/${userId}/points/${encodeURIComponent(ticket)}/histories/${encodeURIComponent(pointHistoryId)}/revoke`
    );
  },
};

export default pointApi;
