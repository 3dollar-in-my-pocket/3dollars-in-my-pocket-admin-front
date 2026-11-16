import {Mission, MissionGroup} from './mission';

/** 포인트 티켓 enum 이름. 값(GOODS_PROMOTION_2026 등)은 서버 enum API(/v1/enums)에서 받으며 하드코딩하지 않습니다. */
export const POINT_TICKET_ENUM_NAME = 'PointTicket';

/** 포인트 잔액 (GET /v1/user/{userId}/points/{ticket}) */
export interface UserPointBalance {
  balance: number;
}

/** 포인트 내역 유형. 알 수 없는 값은 원문 그대로 표시합니다. */
export type PointHistoryType = 'EARN' | 'REVOKE' | string;

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

/**
 * 사유별 상세. source.reason(= 상위 reason)으로 구조를 판별합니다.
 * 서버에 새 reason이 추가될 수 있으므로 알 수 없는 reason은 상세 영역만 비워 둡니다.
 */
export type PointHistorySource = MissionCompletedPointSource | { reason: string };

/** 포인트 내역 (GET /v1/user/{userId}/points/{ticket}/histories). ID 필드는 문자열입니다. */
export interface PointHistory {
  pointHistoryId: string;
  /** 포인트 티켓 (PointTicket) */
  ticket: string;
  type: PointHistoryType;
  /** 사유 코드. 표시는 description을 사용합니다. */
  reason: string;
  /** 미션 그룹·미션 중 하나라도 찾지 못하면(삭제 등) null. 이때 description만 표시합니다. */
  source: PointHistorySource | null;
  description: string;
  /** 부호 있는 변동량 (EARN 양수, REVOKE 음수) */
  amount: number;
  idempotencyKey: string;
  /** REVOKE가 회수한 원본 적립 내역 ID. EARN이면 null */
  relatedHistoryId?: string | null;
  occurredAt: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
