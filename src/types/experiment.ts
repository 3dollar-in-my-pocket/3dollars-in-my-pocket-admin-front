/**
 * 실험(A/B 테스트) Variant 강제 지정 관련 타입 정의
 */

/** 강제 지정 대상 계정 종류 */
export type ExperimentAccountType = 'USER_ACCOUNT' | 'BOSS_ACCOUNT';

/** 계정 종류 선택지 (드롭다운·배지 표기용) */
export const EXPERIMENT_ACCOUNT_TYPES: { value: ExperimentAccountType; label: string; hint: string }[] = [
  {value: 'USER_ACCOUNT', label: '유저', hint: '닉네임으로 검색해 선택'},
  // 기존 등록 데이터 표시에만 사용합니다. 신규 등록 UI에서는 지원하지 않습니다.
  {value: 'BOSS_ACCOUNT', label: '사장님', hint: '사장님의 bossId (문자열)'},
];

/** 실험당 등록 가능한 최대 강제 지정 개수 */
export const MAX_OVERRIDE_COUNT_PER_EXPERIMENT = 50;

/** 지정 가능한 실험·Variant 정보 */
export interface ExperimentVariantInfo {
  experimentKey: string;
  description: string;
  variantKeys: string[];
}

/** 등록된 Variant 강제 지정 */
export interface ExperimentVariantOverride {
  overrideId: number;
  experimentKey: string;
  accountType: ExperimentAccountType;
  accountId: string;
  variantKey: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperimentVariantOverrideRequest {
  accountType: ExperimentAccountType;
  accountId: string;
  variantKey: string;
  memo?: string | null;
}

/**
 * Variant 강제 지정 수정 요청 (PATCH)
 *
 * 필드를 생략하면 기존 값이 유지되고, memo에 null을 보내면 메모가 삭제됩니다.
 * "변경 없음"과 "빈 값으로 삭제"를 반드시 구분해서 전달하세요.
 */
export interface UpdateExperimentVariantOverrideRequest {
  variantKey?: string;
  memo?: string | null;
}
