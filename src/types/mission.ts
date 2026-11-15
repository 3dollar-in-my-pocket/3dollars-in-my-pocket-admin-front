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
  title: string;
  periodType: string;
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
  conditions: MissionCondition[];
  rewards: MissionReward[];
  isVisible: boolean;
  displayOrder: number;
}

export interface CreateMissionRequest extends UpdateMissionRequest {
  periodType: string;
}
