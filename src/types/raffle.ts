/**
 * 응모 enum 값과 표시명은 서버 enum API(/v1/enums)에서 내려받습니다.
 * - RaffleTicket: 응모 티켓 (GOODS_PROMOTION_2026 등). 응모 대상은 티켓별로 분리 관리됩니다.
 * - RaffleEntryCostType: 응모 비용 타입 (POINT 등)
 * - RaffleStatus: 응모 대상 상태 (ACTIVE / STOPPED / HIDDEN). 상태 전이 제한은 없습니다.
 *   진행 예정·종료는 상태가 아니라 기간으로 결정됩니다. 기간 밖이면 ACTIVE여도 노출·응모되지 않습니다.
 */
export const RAFFLE_ENUM_NAMES = {
  ticket: 'RaffleTicket',
  status: 'RaffleStatus',
  costType: 'RaffleEntryCostType',
} as const;

/** 포인트 티켓(pointTicket)·차감 포인트(amount)가 필요한 비용 타입. 화면이 입력 구조를 아는 비용 타입은 현재 POINT뿐입니다. */
export const POINT_RAFFLE_COST_TYPE = 'POINT';

export const RAFFLE_TITLE_MAX_LENGTH = 100;

/** 응모 대상 코드. 티켓 안에서 유일하며 등록 후 수정할 수 없습니다. */
export const RAFFLE_CODE_MAX_LENGTH = 50;
export const RAFFLE_CODE_PATTERN = /^[a-z0-9_-]+$/;

/** 포인트 차감 비용. pointTicket은 PointTicket enum 값입니다. */
export interface PointRaffleEntryCost {
  type: typeof POINT_RAFFLE_COST_TYPE;
  pointTicket: string;
  /** 응모 1회당 차감 포인트 (양수) */
  amount: number;
}

export type RaffleEntryCost = PointRaffleEntryCost;

/**
 * RaffleResponse — 단건 조회·수정은 code로 식별합니다. raffleId는 내부 ID(문자열)입니다.
 * 응모 기간은 startDateTime 포함, endDateTime 미포함입니다.
 */
export interface Raffle {
  raffleId: string;
  code: string;
  /** 응모 티켓 (RaffleTicket) */
  ticket: string;
  title: string;
  cost: RaffleEntryCost;
  startDateTime: string;
  endDateTime: string;
  /** RaffleStatus */
  status: string;
  /** 표시용 전체 응모 수 (비동기 집계라 실제보다 작을 수 있어 정산·추첨 기준으로 쓰지 않습니다) */
  entryCount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface RaffleRequestBase {
  title: string;
  cost: RaffleEntryCost;
  startDateTime: string;
  endDateTime: string;
}

/** 등록 직후 상태는 항상 ACTIVE입니다. */
export interface CreateRaffleRequest extends RaffleRequestBase {
  code: string;
}

/** 수정은 전체 교체(PUT)이며 마지막 저장이 이깁니다. code는 경로로만 지정합니다. */
export interface UpdateRaffleRequest extends RaffleRequestBase {
  status: string;
}
