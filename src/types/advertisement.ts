/**
 * 광고(Advertisement) 관련 타입 정의
 *
 * api-docs.json(OpenAPI)의 Advertisement* 스키마와 대응합니다.
 */

/** 광고 구좌(노출 위치) 타입 */
export type AdvertisementPositionType =
  | 'LOADING'
  | 'SPLASH'
  | 'STORE_MARKER'
  | 'STORE_MARKER_POPUP'
  | 'MAIN_PAGE_CARD'
  | 'MENU_CATEGORY_BANNER'
  | 'MENU_CATEGORY_ICON'
  | 'STORE_CATEGORY_LIST'
  | 'STORE_LIST'
  | 'POLL_CARD'
  | 'LOCAL_NEWS_FEED';

/** 광고 노출 플랫폼 */
export type AdvertisementPlatformType = 'AOS' | 'IOS' | 'ALL';

/** 광고 정렬 방식 */
export type AdvertisementOrderType = 'PINNED' | 'RANDOM';

/** 광고 콘텐츠 타입 */
export type AdvertisementContentType = 'STATIC' | 'NEAR_YOUNG_COFFEE_STORE';

/** 광고 링크 타입 */
export type AdvertisementLinkType = 'WEB' | 'APP_SCHEME';

/** 셀렉트 박스 등에서 사용하는 enum 옵션 (서버 enum API 응답 형태) */
export interface EnumOption {
  key: string;
  description: string;
}

/** AdvertisementResponse — 광고 조회 응답 (콘텐츠 필드가 플랫하게 내려옵니다) */
export interface Advertisement {
  advertisementId: string;
  groupId: string;
  description?: string | null;
  positionType: AdvertisementPositionType;
  platformType: AdvertisementPlatformType;
  title?: string | null;
  titleFontColor?: string | null;
  subTitle?: string | null;
  subTitleFontColor?: string | null;
  extraContent?: string | null;
  /**
   * 서버 응답 스키마상 필드명은 extraFontColor 이지만
   * 프론트 전반(AdPreview, ContentInfoStep 등)은 extraContentFontColor 를 사용합니다.
   * 실제 응답 형태를 확인하기 전까지 두 이름을 모두 허용합니다. (서버/프론트 필드명 불일치)
   */
  extraFontColor?: string | null;
  extraContentFontColor?: string | null;
  backgroundColor?: string | null;
  imageUrl: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
  /** 응답 스키마에는 명시되어 있지 않으나 콘텐츠 수정 화면에서 참조합니다. */
  linkType?: AdvertisementLinkType | null;
  linkUrl?: string | null;
  exposureIndex?: number | null;
  startDateTime: string;
  endDateTime: string;
  orderType: AdvertisementOrderType;
  sortNumber?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

/** ImageRequest — 광고 콘텐츠 이미지 폼 */
export interface AdvertisementImageForm {
  url: string | null;
  width: number | null;
  height: number | null;
}

/** AdvertisementLinkRequest — 광고 링크 폼 */
export interface AdvertisementLinkForm {
  linkType: AdvertisementLinkType | null;
  linkUrl: string | null;
}

/** AdvertisementContentRequest — 등록 마법사의 콘텐츠 단계 폼 상태 */
export interface AdvertisementContentForm {
  title: string | null;
  titleFontColor: string | null;
  subTitle: string | null;
  subTitleFontColor: string | null;
  extraContent: string | null;
  extraContentFontColor: string | null;
  backgroundColor: string | null;
  image: AdvertisementImageForm;
  link: AdvertisementLinkForm;
  exposureIndex: number | null;
}

/** 광고 등록 마법사 전체 폼 상태 (AdvertisementCreateRequest 대응) */
export interface AdvertisementForm {
  groupId: string | null;
  description: string | null;
  position: AdvertisementPositionType | null;
  platform: AdvertisementPlatformType | null;
  startDateTime: string | null;
  endDateTime: string | null;
  contentType: AdvertisementContentType;
  content: AdvertisementContentForm;
  sortNumber: number | null;
  orderType: AdvertisementOrderType;
}

/**
 * 광고 기본 정보 폼 (AdvertisementUpdateRequest 대응)
 * BasicInfoStep 이 등록/수정 양쪽에서 공유하므로 모든 필드를 선택적으로 둡니다.
 */
export interface AdvertisementBasicInfoForm {
  groupId?: string | null;
  description?: string | null;
  position?: AdvertisementPositionType | null;
  platform?: AdvertisementPlatformType | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  sortNumber?: number | null;
  orderType?: AdvertisementOrderType | null;
}

/** 광고 콘텐츠 수정 폼 — 응답이 플랫하므로 폼 상태도 플랫하게 관리합니다. */
export interface AdvertisementContentEditForm {
  title: string;
  titleFontColor: string;
  subTitle: string;
  subTitleFontColor: string;
  extraContent: string;
  extraContentFontColor: string;
  backgroundColor: string;
  imageUrl: string;
  imageWidth: number | string;
  imageHeight: number | string;
  linkType: AdvertisementLinkType;
  linkUrl: string;
  exposureIndex: number | null;
}
