import {Mission, MissionGroup} from './mission';

/** 포인트 티켓 enum 이름. 값(GOODS_PROMOTION_2026 등)은 서버 enum API(/v1/enums)에서 받으며 하드코딩하지 않습니다. */
export const POINT_TICKET_ENUM_NAME = 'PointTicket';

/** 포인트 잔액 목록 정렬 (기본 BALANCE_DESC). 정렬을 바꾸면 커서를 버리고 첫 페이지부터 다시 조회해야 합니다. */
export type PointBalanceSortBy = 'BALANCE_DESC' | 'BALANCE_ASC';

/**
 * 포인트 잔액 목록의 유저 (어드민 UserResponse)
 * 탈퇴 등으로 유저를 찾을 수 없으면 userId·socialType·createdAt·updatedAt이 null(또는 생략)인 고정 객체
 * (name = "사라진 제보자")로 내려옵니다. 이때는 유저 상세로 이동할 수 없습니다.
 */
export interface PointBalanceUser {
  userId?: number | string | null;
  name: string;
  socialType?: string | null;
  role?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** 포인트 티켓의 유저 잔액 목록 항목 (GET /v1/points/{ticket}/users) */
export interface UserPointBalanceItem {
  user: PointBalanceUser;
  balance: number;
}

/** 포인트 잔액 (GET /v1/user/{userId}/points/{ticket}) */
export interface UserPointBalance {
  balance: number;
}

/** 포인트 내역 유형 (EARN 적립, REVOKE 회수, USE 사용). 알 수 없는 값은 원문 그대로 표시합니다. */
export type PointHistoryType = 'EARN' | 'REVOKE' | 'USE' | string;

/** 포인트 내역 정렬. 정렬을 바꾸면 커서를 버리고 첫 페이지부터 다시 조회해야 합니다. */
export type PointHistorySortBy = 'LATEST' | 'OLDEST';

/** 미션 완료로 인한 적립 상세. source가 있으면 안의 필드는 모두 non-null입니다. */
export interface MissionCompletedPointSource {
  reason: 'MISSION_COMPLETED';
  missionGroup: MissionGroup;
  mission: Mission;
  /** 완료한 기간 키. DAILY는 완료 일자(KST) yyyy-MM-dd */
  periodKey: string;
  /** 기간 안에서 완료한 회차 (1부터) */
  sequence: number;
}

/** 응모로 인한 사용 상세 */
export interface RaffleEnteredPointSource {
  reason: 'RAFFLE_ENTERED';
  raffle: {
    raffleId: string;
    /** 응모 대상 코드 (단건 조회의 raffleCode) */
    code: string;
    title: string;
  };
}

/**
 * 사유별 상세. source.reason(= 상위 reason)으로 구조를 판별합니다.
 * 서버에 새 reason이 추가될 수 있으므로 알 수 없는 reason은 상세 영역만 비워 둡니다.
 */
export type PointHistorySource = MissionCompletedPointSource | RaffleEnteredPointSource | { reason: string };

/** 포인트 내역 (GET /v1/user/{userId}/points/{ticket}/histories). ID 필드는 문자열입니다. */
export interface PointHistory {
  pointHistoryId: string;
  /** 포인트 티켓 (PointTicket) */
  ticket: string;
  type: PointHistoryType;
  /** 사유 코드. 표시는 description을 사용합니다. */
  reason: string;
  /** 출처(미션 그룹·미션, 응모 대상 등)를 찾지 못하면 null. 이때 description만 표시합니다. */
  source: PointHistorySource | null;
  description: string;
  /** 부호 있는 변동량 (EARN 양수, REVOKE·USE 음수) */
  amount: number;
  idempotencyKey: string;
  /** REVOKE가 회수한 원본 적립 내역 ID. EARN이면 null */
  relatedHistoryId?: string | null;
  occurredAt: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
