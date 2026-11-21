import {apiGet, apiGetPaginated, apiPost, apiPut} from './apiHelpers';
import {ApiResponse, PaginatedResponse} from '@/types/api';
import {CreateRaffleRequest, Raffle, UpdateRaffleRequest} from '@/types/raffle';

const ticketPath = (ticket: string) => `/v1/raffles/${encodeURIComponent(ticket)}`;

/**
 * 응모 관리 API
 *
 * 응모 대상은 응모 티켓(RaffleTicket) 하위 경로로 다룹니다. 경로 티켓과 대상 티켓이 다르면 404 not_exists_raffle.
 * 등록·수정은 OPERATOR 이상, 조회는 로그인만 필요합니다. 삭제 API는 없으며 내리려면 HIDDEN으로 수정합니다.
 */
const raffleApi = {
  /** 응모 대상 목록 조회 (모든 상태, 등록 최신순 커서 페이지, size 1~30 기본 10) */
  getRaffles: async (
    ticket: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<Raffle>>> => {
    return apiGetPaginated<Raffle>(ticketPath(ticket), {cursor, size});
  },

  /** 응모 대상 단건 조회 (모든 상태) */
  getRaffle: async (ticket: string, raffleId: string): Promise<ApiResponse<Raffle>> => {
    return apiGet<Raffle>(`${ticketPath(ticket)}/${encodeURIComponent(raffleId)}`);
  },

  /** 응모 대상 등록. 등록 직후 상태는 항상 ACTIVE이며, 기간 역전은 400 invalid_date_range_order */
  createRaffle: async (ticket: string, data: CreateRaffleRequest): Promise<ApiResponse<Raffle>> => {
    return apiPost<Raffle>(ticketPath(ticket), data);
  },

  /** 응모 대상 수정 (상태·선택 필드 포함 전체 교체) */
  updateRaffle: async (
    ticket: string,
    raffleId: string,
    data: UpdateRaffleRequest
  ): Promise<ApiResponse<Raffle>> => {
    return apiPut<Raffle>(`${ticketPath(ticket)}/${encodeURIComponent(raffleId)}`, data);
  },
};

export default raffleApi;
