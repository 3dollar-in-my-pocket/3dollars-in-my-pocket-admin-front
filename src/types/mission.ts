/**
 * 미션 enum 값과 표시명은 서버 enum API(/v1/enums)에서 내려받습니다. 화면에 하드코딩하지 않습니다.
 * - MissionActivityType: 활동 타입 (STORE_VISIT 등)
 * - MissionPeriodType: 기간 타입 (DAILY 등)
 * - MissionRewardType: 리워드 타입 (POINT 등)
 */
export const MISSION_ENUM_NAMES = {
  activityType: 'MissionActivityType',
  periodType: 'MissionPeriodType',
  rewardType: 'MissionRewardType',
} as const;

/** 지급 포인트(amount)가 필요한 리워드 타입 */
export const POINT_REWARD_TYPE = 'POINT';

export const MISSION_TITLE_MAX_LENGTH = 100;

/** 기간 내 최대 완료 회차 범위 */
export const MISSION_MAX_COMPLETION_COUNT_MIN = 1;
export const MISSION_MAX_COMPLETION_COUNT_MAX = 10;

export const MISSION_GROUP_CODE_MAX_LENGTH = 50;
export const MISSION_GROUP_CODE_PATTERN = /^[a-z0-9_-]+$/;
export const MISSION_GROUP_NAME_MAX_LENGTH = 100;
/** 상시 운영 그룹의 종료 일시 (종료 일시는 필수이므로 충분히 먼 일시로 지정) */
export const MISSION_GROUP_ALWAYS_END_DATE_TIME = '2099-12-31T00:00:00';

/**
 * MissionGroupResponse
 * 유효 기간은 startDateTime 포함, endDateTime 미포함입니다. code는 등록 후 변경할 수 없습니다.
 */
export interface MissionGroup {
  missionGroupId: string;
  code: string;
  name: string;
  startDateTime: string;
  endDateTime: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** 미션 그룹 수정 (전체 교체). code는 경로로만 지정합니다. */
export interface UpdateMissionGroupRequest {
  name: string;
  startDateTime: string;
  endDateTime: string;
}

export interface CreateMissionGroupRequest extends UpdateMissionGroupRequest {
  code: string;
}

export interface MissionCondition {
  activityType: string;
  targetCount: number;
}

/** 리워드는 type으로 구분되는 다형성 구조입니다. type=POINT이면 amount가 필수입니다. */
export interface MissionReward {
  type: string;
  amount?: number | null;
}

/** MissionResponse — missionId는 Snowflake ID라 숫자로 변환하지 않고 문자열 그대로 다룹니다. */
export interface Mission {
  missionId: string;
  /** 소속 그룹 ID (missionGroupId). 그룹 code는 응답에 없어 현재 경로의 code를 사용합니다. */
  groupId: string;
  title: string;
  periodType: string;
  /** 기간 내 최대 완료 회차 (1~10) */
  maxCompletionCount: number;
  conditions: MissionCondition[];
  rewards: MissionReward[];
  isVisible: boolean;
  displayOrder: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** 수정은 전체 교체(PUT)이며 periodType은 변경할 수 없어 바디에 포함하지 않습니다. */
export interface UpdateMissionRequest {
  title: string;
  maxCompletionCount: number;
  conditions: MissionCondition[];
  rewards: MissionReward[];
  isVisible: boolean;
  displayOrder: number;
}

export interface CreateMissionRequest extends UpdateMissionRequest {
  periodType: string;
}

/**
 * 유저 미션 완료 이력 (GET /v1/user/{userId}/mission-completions)
 * 미션을 찾을 수 없으면(삭제 등) missionTitle, periodType이 null입니다.
 */
export interface MissionCompletion {
  missionCompletionId: string;
  missionId: string;
  missionTitle?: string | null;
  periodType?: string | null;
  /** 완료한 기간 키. DAILY는 완료 일자(KST) yyyy-MM-dd */
  periodKey: string;
  /** 기간 안에서 완료한 회차 (1부터) */
  sequence: number;
  completedAt: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
