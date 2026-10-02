/**
 * 화면 섹션 레이아웃 타입 정의
 *
 * 유저 앱 화면(가게 상세 등)의 섹션 노출 순서/하단 여백/노출 여부를 관리합니다.
 */

/** 레이아웃을 설정할 유저 앱 화면 */
export type ScreenType = string;

/** 섹션 타입 (STORE_DETAIL 기준) */
export type SectionType = string;

/** 화면 메타 정보 */
export interface ScreenTypeMeta {
  value: ScreenType;
  label: string;
  /** 섹션 추가·삭제·순서 변경 지원 여부. false면 섹션 구성이 고정되고 섹션별 설정값만 편집합니다. */
  supportsSectionOrdering: boolean;
}

export type ConfigValueType = 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'INTEGER_LIST';

/** 설정 입력 필드 정의 */
export interface SectionConfigFieldMeta {
  name: string;
  valueType: ConfigValueType;
  isRequired: boolean;
  /** 최솟값. INTEGER_LIST는 각 원소의 최솟값 */
  min?: number;
  /** 최댓값(포함). INTEGER_LIST는 각 원소의 최댓값 */
  max?: number;
  /** INTEGER_LIST의 최대 원소 개수 */
  maxItems?: number;
  /** true면 min을 포함하지 않습니다(초과). */
  isMinExclusive?: boolean;
  description?: string;
}

/** 섹션이 지원하는 설정 타입과 입력 필드 스키마. 저장된 설정값이 아닙니다. (constants/screenSectionLayout.ts) */
export interface SectionConfigMeta {
  type: string;
  fields: SectionConfigFieldMeta[];
}

/** 섹션 메타 정보 */
export interface SectionTypeMeta {
  value: SectionType;
  label: string;
  /** 교체 요청에 반드시 isVisible=true로 포함되어야 하는 섹션 */
  isRequired: boolean;
  /** 어드민에서 교체 요청에 포함할 수 있는 섹션 */
  isConfigurable: boolean;
  /** 동일 섹션을 여러 번 넣을 수 있는지 여부 */
  allowsMultiple: boolean;
}

/** 설정 필드 값. 입력 도중에는 숫자 자리에 NaN이 들어갈 수 있으며, 저장 전 검증에서 걸러집니다. */
export type SectionConfigValue = number | boolean | number[];

/**
 * 섹션 설정값.
 *
 * type은 섹션 타입별 설정 정의(SECTION_CONFIGS)의 type 중 하나이고, 나머지 키는 해당 fields의 name입니다.
 * 예: {type: 'AD_MOB', height: 100}, {type: 'HOME_LIST', pageSize: 20, adPositions: [3, 8], adHeight: 80}
 */
export interface ScreenSectionLayoutConfig {
  type: string;
  [field: string]: SectionConfigValue | string | undefined;
}

/** 섹션 레이아웃 (서버 응답) */
export interface ScreenSectionLayout {
  id: number;
  screenType: ScreenType;
  sectionType: SectionType;
  sectionId: string;
  /** 노출 순서. 서버가 배열 순서로 계산해 내려줍니다. */
  displayOrder: number;
  marginBottom: number;
  isVisible: boolean;
  config?: ScreenSectionLayoutConfig | null;
  createdAt: string;
  updatedAt: string;
}

/** 교체 요청의 섹션 항목. displayOrder는 배열 순서로 결정되므로 보내지 않습니다. */
export interface ScreenSectionLayoutItemRequest {
  sectionType: SectionType;
  sectionId: string;
  marginBottom: number;
  isVisible: boolean;
  /** 생략하면 서버 기본값을 사용합니다. */
  config?: ScreenSectionLayoutConfig;
}

/** 섹션 레이아웃 전체 교체 요청 */
export interface ReplaceScreenSectionLayoutsRequest {
  /** 섹션 목록. 배열 순서가 곧 노출 순서입니다. */
  sections: ScreenSectionLayoutItemRequest[];
}

/** 섹션 레이아웃 목록 응답 */
export interface ScreenSectionLayoutListResponse {
  contents: ScreenSectionLayout[];
}

/** marginBottom 허용 범위 */
export const MARGIN_BOTTOM_MIN = 0;
export const MARGIN_BOTTOM_MAX = 100;

/** sectionId 최대 길이 */
export const SECTION_ID_MAX_LENGTH = 100;
