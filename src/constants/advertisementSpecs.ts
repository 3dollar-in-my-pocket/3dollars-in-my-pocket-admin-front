/**
 * 광고 구좌별 스펙 정의
 */

export interface AdPositionSpec {
  key: string;
  name: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  excludedFields: string[];
  // 미리보기 설정
  previewConfig: {
    containerWidth: number;
    containerHeight: number;
    imageWidth: number;
    imageHeight: number;
    layout: 'card' | 'list' | 'image-only' | 'splash' | 'category-icon' | 'category-banner' | 'poll-card' | 'marker-popup';
  };
}

export const AD_POSITION_SPECS: Record<string, AdPositionSpec> = {
  MAIN_PAGE_CARD: {
    key: 'MAIN_PAGE_CARD',
    name: '가게 카드뷰',
    description: '메인 페이지 가게 카드 형태의 광고',
    requiredFields: ['image', 'link', 'title', 'subTitle', 'backgroundColor'],
    optionalFields: ['imageWidth', 'imageHeight', 'titleFontColor', 'subTitleFontColor'],
    excludedFields: ['extraContent', 'extraContentFontColor'],
    previewConfig: {
      containerWidth: 264,
      containerHeight: 456,
      imageWidth: 132,
      imageHeight: 228,
      layout: 'card'
    }
  },
  STORE_LIST: {
    key: 'STORE_LIST',
    name: '가게 리스트뷰',
    description: '가게 목록에 표시되는 리스트 형태의 광고',
    requiredFields: ['image', 'link', 'title', 'subTitle', 'backgroundColor'],
    optionalFields: ['imageWidth', 'imageHeight', 'titleFontColor', 'subTitleFontColor'],
    excludedFields: ['extraContent', 'extraContentFontColor'],
    previewConfig: {
      containerWidth: 500,
      containerHeight: 140,
      imageWidth: 120,
      imageHeight: 120,
      layout: 'list'
    }
  },
  SPLASH: {
    key: 'SPLASH',
    name: '스플래시',
    description: '앱 시작 시 표시되는 전체 화면 광고',
    requiredFields: ['image', 'link'],
    optionalFields: ['imageWidth', 'imageHeight'],
    excludedFields: ['title', 'subTitle', 'titleFontColor', 'subTitleFontColor', 'extraContent', 'extraContentFontColor', 'backgroundColor'],
    previewConfig: {
      containerWidth: 375,
      containerHeight: 667,
      imageWidth: 375,
      imageHeight: 667,
      layout: 'splash'
    }
  },
  LOADING: {
    key: 'LOADING',
    name: '로딩',
    description: '로딩 화면에 표시되는 광고',
    requiredFields: ['image', 'link'],
    optionalFields: ['imageWidth', 'imageHeight'],
    excludedFields: ['title', 'subTitle', 'titleFontColor', 'subTitleFontColor', 'extraContent', 'extraContentFontColor', 'backgroundColor'],
    previewConfig: {
      containerWidth: 375,
      containerHeight: 667,
      imageWidth: 200,
      imageHeight: 200,
      layout: 'image-only'
    }
  },
  STORE_MARKER: {
    key: 'STORE_MARKER',
    name: '가게 마커',
    description: '지도에 표시되는 가게 마커 광고',
    requiredFields: ['image'],
    optionalFields: ['imageWidth', 'imageHeight'],
    excludedFields: ['link', 'title', 'subTitle', 'titleFontColor', 'subTitleFontColor', 'extraContent', 'extraContentFontColor', 'backgroundColor'],
    previewConfig: {
      containerWidth: 150,
      containerHeight: 150,
      imageWidth: 120,
      imageHeight: 120,
      layout: 'image-only'
    }
  },
  MENU_CATEGORY_ICON: {
    key: 'MENU_CATEGORY_ICON',
    name: '메뉴 카테고리 아이콘',
    description: '메뉴 카테고리에 표시되는 아이콘 광고',
    requiredFields: ['image', 'link', 'title'],
    optionalFields: ['imageWidth', 'imageHeight', 'titleFontColor'],
    excludedFields: ['subTitle', 'subTitleFontColor', 'extraContent', 'extraContentFontColor', 'backgroundColor'],
    previewConfig: {
      containerWidth: 156,
      containerHeight: 195,
      imageWidth: 156,
      imageHeight: 156,
      layout: 'category-icon'
    }
  },
  MENU_CATEGORY_BANNER: {
    key: 'MENU_CATEGORY_BANNER',
    name: '메뉴 카테고리 배너',
    description: '메뉴 카테고리에 표시되는 배너 광고',
    requiredFields: ['image', 'link', 'title', 'subTitle'],
    optionalFields: ['imageWidth', 'imageHeight', 'titleFontColor', 'subTitleFontColor', 'backgroundColor'],
    excludedFields: ['extraContent', 'extraContentFontColor'],
    previewConfig: {
      containerWidth: 924,
      containerHeight: 200,
      imageWidth: 200,
      imageHeight: 200,
      layout: 'category-banner'
    }
  },
  POLL_CARD: {
    key: 'POLL_CARD',
    name: '투표 카드',
    description: '투표 페이지에 표시되는 카드 광고',
    requiredFields: ['image', 'link', 'title', 'subTitle', 'extraContent'],
    optionalFields: ['imageWidth', 'imageHeight', 'titleFontColor', 'subTitleFontColor', 'extraContentFontColor', 'backgroundColor'],
    excludedFields: [],
    previewConfig: {
      containerWidth: 345,
      containerHeight: 434,
      imageWidth: 345,
      imageHeight: 230,
      layout: 'poll-card'
    }
  },
  STORE_MARKER_POPUP: {
    key: 'STORE_MARKER_POPUP',
    name: '가게 마커 팝업',
    description: '지도에서 마커 클릭 시 표시되는 팝업 광고',
    requiredFields: ['image', 'link', 'title', 'subTitle', 'extraContent'],
    optionalFields: ['imageWidth', 'imageHeight', 'titleFontColor', 'subTitleFontColor', 'extraContentFontColor', 'backgroundColor'],
    excludedFields: [],
    previewConfig: {
      containerWidth: 420,
      containerHeight: 540,
      imageWidth: 420,
      imageHeight: 270,
      layout: 'marker-popup'
    }
  }
};

/**
 * 특정 구좌의 스펙을 가져옵니다
 */
export const getAdPositionSpec = (positionKey: string): AdPositionSpec | null => {
  return AD_POSITION_SPECS[positionKey] || null;
};

/**
 * 특정 필드가 해당 구좌에서 필수인지 확인합니다
 */
export const isFieldRequired = (positionKey: string, fieldName: string): boolean => {
  const spec = getAdPositionSpec(positionKey);
  if (!spec) return false;
  return spec.requiredFields.includes(fieldName);
};

/**
 * 특정 필드가 해당 구좌에서 사용 가능한지 확인합니다
 */
export const isFieldAvailable = (positionKey: string, fieldName: string): boolean => {
  const spec = getAdPositionSpec(positionKey);
  if (!spec) return true; // 스펙이 없으면 모든 필드 허용
  return !spec.excludedFields.includes(fieldName);
};

/**
 * 이미지만 필요한 구좌인지 확인합니다
 */
export const isImageOnlyPosition = (positionKey: string): boolean => {
  const imageOnlyPositions = ['SPLASH', 'LOADING', 'STORE_MARKER', 'MENU_CATEGORY_ICON'];
  return imageOnlyPositions.includes(positionKey);
};
