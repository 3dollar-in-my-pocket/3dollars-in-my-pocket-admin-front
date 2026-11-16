/** 포인트 티켓 enum 이름. 값(GOODS_PROMOTION_2026 등)은 서버 enum API(/v1/enums)에서 받으며 하드코딩하지 않습니다. */
export const POINT_TICKET_ENUM_NAME = 'PointTicket';

/** 포인트 잔액 (GET /v1/user/{userId}/points/{ticket}) */
export interface UserPointBalance {
  balance: number;
}

/** 포인트 내역 유형. 알 수 없는 값은 원문 그대로 표시합니다. */
export type PointHistoryType = 'EARN' | 'REVOKE' | string;

/** 포인트 내역 (GET /v1/user/{userId}/points/{ticket}/histories). ID 필드는 문자열입니다. */
export interface PointHistory {
  pointHistoryId: string;
  /** 포인트 티켓 (PointTicket) */
  ticket: string;
  type: PointHistoryType;
  /** 사유 코드. 표시는 description을 사용합니다. */
  reason: string;
  description: string;
  /** 부호 있는 변동량 (EARN 양수, REVOKE 음수) */
  amount: number;
  balanceAfter: number;
  idempotencyKey: string;
  /** REVOKE가 회수한 원본 적립 내역 ID. EARN이면 null */
  relatedHistoryId?: string | null;
  occurredAt: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
