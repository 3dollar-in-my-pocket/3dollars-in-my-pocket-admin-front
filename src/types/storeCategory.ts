/**
 * 가게 카테고리 분류 타입
 */
export interface StoreCategoryClassification {
  type: StoreCategoryClassificationType;
  description: string;
  priority: number;
}

export type StoreCategoryClassificationType = 'TREND_SNACKS' | 'SNACKS' | 'MEAL';
export type StoreCategoryMetaType = 'DEFAULT' | 'NEW';

export const STORE_CATEGORY_CLASSIFICATIONS: Array<{
  value: StoreCategoryClassificationType;
  label: string;
}> = [
  /* deslop-ignore-next-line 15 서버 카테고리 라벨 원문 */
  {value: 'TREND_SNACKS', label: '✨트렌드 간식'},
  {value: 'SNACKS', label: '간식'},
  {value: 'MEAL', label: '식사'},
];

/**
 * 가게 카테고리
 */
export interface StoreCategory {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  disableImageUrl: string;
  defaultMarkerImageFocusedUrl?: string;
  defaultMarkerImageUnfocusedUrl?: string;
  recentlyActivityMarkerImageFocusedUrl?: string;
  recentlyActivityMarkerImageUnfocusedUrl?: string;
  hasIssuableCouponMarkerImageFocusedUrl?: string;
  hasIssuableCouponMarkerImageUnfocusedUrl?: string;
  verifiedStoreMarkerImageFocusedUrl?: string;
  verifiedStoreMarkerImageUnfocusedUrl?: string;
  classification: StoreCategoryClassification;
  isNew: boolean;
  displayOrder?: number;
  metaType: StoreCategoryMetaType;
}

export interface CreateStoreCategoryRequest {
  categoryType: string;
  name: string;
  description: string;
  imageUrl: string;
  disableImageUrl: string;
  defaultMarkerImageFocusedUrl: string | null;
  defaultMarkerImageUnfocusedUrl: string | null;
  recentlyActivityMarkerImageFocusedUrl: string | null;
  recentlyActivityMarkerImageUnfocusedUrl: string | null;
  hasIssuableCouponMarkerImageFocusedUrl: string | null;
  hasIssuableCouponMarkerImageUnfocusedUrl: string | null;
  verifiedStoreMarkerImageFocusedUrl: string | null;
  verifiedStoreMarkerImageUnfocusedUrl: string | null;
  classificationType: StoreCategoryClassificationType;
  metaType: StoreCategoryMetaType;
  displayOrder: number | null;
}

export type UpdateStoreCategoryRequest = Partial<Omit<CreateStoreCategoryRequest, 'categoryType'>>;

/**
 * 가게 카테고리 응답
 */
export interface StoreCategoryResponse {
  contents: StoreCategory[];
}

/**
 * 카테고리 마커 이미지 필드 정의 (상태별 마커 이미지)
 * 등록/수정 폼과 상세 화면에서 동일한 순서/라벨로 사용한다.
 */
export const STORE_CATEGORY_MARKER_FIELDS = [
  ['defaultMarkerImageFocusedUrl', '기본 선택 마커'],
  ['defaultMarkerImageUnfocusedUrl', '기본 미선택 마커'],
  ['recentlyActivityMarkerImageFocusedUrl', '최근 활동 선택 마커'],
  ['recentlyActivityMarkerImageUnfocusedUrl', '최근 활동 미선택 마커'],
  ['hasIssuableCouponMarkerImageFocusedUrl', '쿠폰 선택 마커'],
  ['hasIssuableCouponMarkerImageUnfocusedUrl', '쿠폰 미선택 마커'],
  ['verifiedStoreMarkerImageFocusedUrl', '사장님 가게 선택 마커'],
  ['verifiedStoreMarkerImageUnfocusedUrl', '사장님 가게 미선택 마커'],
] as const;

export type StoreCategoryMarkerField = typeof STORE_CATEGORY_MARKER_FIELDS[number][0];

/**
 * 마커를 상태별로 묶은 정의. 같은 상태의 선택/미선택 마커를 나란히 보여줄 때 사용한다.
 * STORE_CATEGORY_MARKER_FIELDS와 동일한 필드를 상태 기준으로 재구성한 것이다.
 */
export const STORE_CATEGORY_MARKER_GROUPS: Array<{
  title: string;
  icon: string;
  description: string;
  focused: StoreCategoryMarkerField;
  unfocused: StoreCategoryMarkerField;
}> = [
  {
    title: '기본',
    icon: 'bi-geo-alt',
    description: '아무 조건에도 해당하지 않는 기본 상태',
    focused: 'defaultMarkerImageFocusedUrl',
    unfocused: 'defaultMarkerImageUnfocusedUrl',
  },
  {
    title: '최근 활동',
    icon: 'bi-fire',
    description: '최근 활동이 있는 가게',
    focused: 'recentlyActivityMarkerImageFocusedUrl',
    unfocused: 'recentlyActivityMarkerImageUnfocusedUrl',
  },
  {
    title: '쿠폰',
    icon: 'bi-ticket-perforated',
    description: '발급 가능한 쿠폰이 있는 가게',
    focused: 'hasIssuableCouponMarkerImageFocusedUrl',
    unfocused: 'hasIssuableCouponMarkerImageUnfocusedUrl',
  },
  {
    title: '사장님 가게',
    icon: 'bi-patch-check',
    description: '사장님이 인증한 가게',
    focused: 'verifiedStoreMarkerImageFocusedUrl',
    unfocused: 'verifiedStoreMarkerImageUnfocusedUrl',
  },
];

/** 카테고리 아이콘 이미지 필드 정의 (필터 노출용) */
export const STORE_CATEGORY_ICON_FIELDS = [
  ['imageUrl', '활성 이미지'],
  ['disableImageUrl', '비활성 이미지'],
] as const;

export type StoreCategoryIconField = typeof STORE_CATEGORY_ICON_FIELDS[number][0];

/**
 * 카테고리 등록 폼에서 에셋 예시로 보여줄 기준 카테고리.
 * 이 카테고리의 에셋이 각 이미지 필드 옆에 참고용 썸네일로 표시된다.
 */
export const SAMPLE_CATEGORY_ID = 'BUNGEOPPANG';
