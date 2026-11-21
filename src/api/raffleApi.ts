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
  /** 응모 대상 목록 조회 (모든 상태, 등록 최신순, size 1~30) */
  getRaffles: async (
    ticket: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<Raffle>>> => {
    return apiGetPaginated<Raffle>(ticketPath(ticket), {cursor, size});
  },

  /** 응모 대상 단건 조회 (모든 상태) */
  getRaffle: async (ticket: string, raffleCode: string): Promise<ApiResponse<Raffle>> => {
    return apiGet<Raffle>(`${ticketPath(ticket)}/${encodeURIComponent(raffleCode)}`);
  },

  /** 응모 대상 등록. 등록 직후 상태는 항상 ACTIVE이며, 같은 티켓에 같은 code가 있으면 409 duplicated_raffle_code */
  createRaffle: async (ticket: string, data: CreateRaffleRequest): Promise<ApiResponse<Raffle>> => {
    return apiPost<Raffle>(ticketPath(ticket), data);
  },

  /** 응모 대상 수정 (상태 포함 전체 교체) */
  updateRaffle: async (
    ticket: string,
    raffleCode: string,
    data: UpdateRaffleRequest
  ): Promise<ApiResponse<Raffle>> => {
    return apiPut<Raffle>(`${ticketPath(ticket)}/${encodeURIComponent(raffleCode)}`, data);
  },
};

export default raffleApi;
