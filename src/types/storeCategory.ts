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
