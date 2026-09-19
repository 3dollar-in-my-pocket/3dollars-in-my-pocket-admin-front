/**
 * 화면 섹션 레이아웃 타입 정의
 *
 * 유저 앱 화면(가게 상세 등)의 섹션 노출 순서/하단 여백/노출 여부를 관리합니다.
 */

/** 레이아웃을 설정할 유저 앱 화면 */
export type ScreenType =
  | 'STORE_DETAIL'
  | 'HOME'
  | 'HOME_LIST'
  | 'STORE_BOTTOM_SHEET'
  | 'STORE_CONTRIBUTORS';

/** 섹션 타입 (STORE_DETAIL 기준) */
export type SectionType =
  | 'PREVIEW'
  | 'TAB'
  | 'CALLOUT'
  | 'RELATED_STORES'
  | 'AD_MOB'
  | 'EDIT'
  | 'VISIT'
  | 'REVIEW'
  | 'POST'
  | 'IMAGE'
  | 'APPEARANCE_DAY'
  | 'COUPON'
  | 'INFO'
  | 'CTA'
  | 'MARGIN';

/** 화면 메타 정보 */
export interface ScreenTypeMeta {
  value: ScreenType;
  label: string;
  /** 섹션 목록이 정의된 화면인지 여부. false면 교체 시 서버가 400을 반환합니다. */
  isConfigurable: boolean;
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
  createdAt: string;
  updatedAt: string;
}

/** 교체 요청의 섹션 항목. displayOrder는 배열 순서로 결정되므로 보내지 않습니다. */
export interface ScreenSectionLayoutItemRequest {
  sectionType: SectionType;
  sectionId: string;
  marginBottom: number;
  isVisible: boolean;
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
