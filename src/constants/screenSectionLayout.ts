import {ScreenType, ScreenTypeMeta, SectionType, SectionTypeMeta} from '@/types/screenSectionLayout';

/**
 * 레이아웃을 설정할 수 있는 유저 앱 화면 목록
 *
 * 현재 섹션 목록이 정의된 화면은 STORE_DETAIL 뿐이며,
 * 나머지 화면으로 교체를 시도하면 서버가 400을 반환합니다.
 */
export const SCREEN_TYPES: ScreenTypeMeta[] = [
  {value: 'STORE_DETAIL', label: '가게 상세', isConfigurable: true},
  {value: 'HOME', label: '홈', isConfigurable: false},
  {value: 'HOME_LIST', label: '홈 리스트', isConfigurable: false},
  {value: 'STORE_BOTTOM_SHEET', label: '가게 바텀시트', isConfigurable: false},
  {value: 'STORE_CONTRIBUTORS', label: '가게 기여자', isConfigurable: false},
];

export const DEFAULT_SCREEN_TYPE: ScreenType = 'STORE_DETAIL';

/**
 * STORE_DETAIL 화면에서 사용할 수 있는 섹션 목록
 *
 * - isRequired: PREVIEW, TAB은 isVisible=true로 반드시 포함되어야 합니다.
 * - isConfigurable: MARGIN은 서버가 marginBottom을 보고 자동 삽입하므로 어드민에서 다루지 않습니다.
 * - allowsMultiple: AD_MOB만 동일 섹션을 여러 번 넣을 수 있습니다.
 */
export const STORE_DETAIL_SECTION_TYPES: SectionTypeMeta[] = [
  {value: 'PREVIEW', label: '가게 미리보기', isRequired: true, isConfigurable: true, allowsMultiple: false},
  {value: 'TAB', label: '탭', isRequired: true, isConfigurable: true, allowsMultiple: false},
  {value: 'CALLOUT', label: '인증 가게 안내 배너', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'RELATED_STORES', label: '연관 가게 추천', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'AD_MOB', label: '애드몹 광고', isRequired: false, isConfigurable: true, allowsMultiple: true},
  {value: 'EDIT', label: '지도 & 정보 수정', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'VISIT', label: '방문 인증', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'REVIEW', label: '방문자 리뷰', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'POST', label: '가게 소식 (사장님 가게 전용)', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'IMAGE', label: '가게 이미지', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'APPEARANCE_DAY', label: '영업 일정 (사장님 가게 전용)', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'COUPON', label: '쿠폰 (사장님 가게 전용)', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'INFO', label: '가게 정보 & 매뉴', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'CTA', label: '사장님 앱 홍보 CTA (유저 가게 전용)', isRequired: false, isConfigurable: true, allowsMultiple: false},
  {value: 'MARGIN', label: '여백', isRequired: false, isConfigurable: false, allowsMultiple: false},
];

/** 화면별 섹션 메타 목록. 섹션이 정의되지 않은 화면은 빈 배열입니다. */
const SECTION_TYPES_BY_SCREEN: Record<ScreenType, SectionTypeMeta[]> = {
  STORE_DETAIL: STORE_DETAIL_SECTION_TYPES,
  HOME: [],
  HOME_LIST: [],
  STORE_BOTTOM_SHEET: [],
  STORE_CONTRIBUTORS: [],
};

/** 화면에서 사용 가능한 전체 섹션 메타 목록 (MARGIN 등 설정 불가 섹션 포함) */
export const getSectionTypes = (screenType: ScreenType): SectionTypeMeta[] =>
  SECTION_TYPES_BY_SCREEN[screenType] ?? [];

/** 어드민에서 추가할 수 있는 섹션 메타 목록 (MARGIN 제외) */
export const getConfigurableSectionTypes = (screenType: ScreenType): SectionTypeMeta[] =>
  getSectionTypes(screenType).filter((section) => section.isConfigurable);

/** 섹션 메타 조회. 서버에만 존재하는 섹션일 수 있으므로 undefined를 반환할 수 있습니다. */
export const findSectionTypeMeta = (
  screenType: ScreenType,
  sectionType: SectionType
): SectionTypeMeta | undefined =>
  getSectionTypes(screenType).find((section) => section.value === sectionType);

/** 섹션 라벨. 메타에 없는 값이면 원문을 그대로 노출합니다. */
export const getSectionTypeLabel = (screenType: ScreenType, sectionType: SectionType): string =>
  findSectionTypeMeta(screenType, sectionType)?.label ?? sectionType;

/** 화면 메타 조회 */
export const findScreenTypeMeta = (screenType: ScreenType): ScreenTypeMeta | undefined =>
  SCREEN_TYPES.find((screen) => screen.value === screenType);

/** 화면 라벨 */
export const getScreenTypeLabel = (screenType: ScreenType): string =>
  findScreenTypeMeta(screenType)?.label ?? screenType;

/** 필수 섹션 타입 목록 */
export const getRequiredSectionTypes = (screenType: ScreenType): SectionType[] =>
  getSectionTypes(screenType).filter((section) => section.isRequired).map((section) => section.value);
