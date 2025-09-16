// Store related type definitions and constants

// Store status types
export const STORE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED'
};

// Store activities status types
export const ACTIVITIES_STATUS = {
  RECENT_ACTIVITY: 'RECENT_ACTIVITY',
  NO_RECENT_ACTIVITY: 'NO_RECENT_ACTIVITY'
};

// Sales type
export const SALES_TYPE = {
  ROAD: 'ROAD',
  STORE: 'STORE'
};

// Open status
export const OPEN_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

// Writer type
export const WRITER_TYPE = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

// Search types
export const STORE_SEARCH_TYPES = {
  KEYWORD: 'keyword',
  RECENT: 'recent'
};

// Store search request interface
export const createStoreSearchRequest = ({
  keyword = '',
  cursor = null,
  size = 20
}) => ({
  keyword,
  cursor,
  size
});

// Store basic info interface
export const createStoreBasicInfo = ({
  storeId = 0,
  name = '',
  rating = 0.0,
  location = null,
  address = null,
  categories = [],
  status = STORE_STATUS.ACTIVE,
  activitiesStatus = ACTIVITIES_STATUS.NO_RECENT_ACTIVITY,
  createdAt = null,
  updatedAt = null
}) => ({
  storeId,
  name,
  rating,
  location,
  address,
  categories,
  status,
  activitiesStatus,
  createdAt,
  updatedAt
});

// Store owner interface
export const createStoreOwner = ({
  writerId = null,
  writerType = WRITER_TYPE.USER,
  name = ''
}) => ({
  writerId,
  writerType,
  name
});

// Store sales type interface
export const createStoreSalesType = ({
  type = SALES_TYPE.ROAD,
  description = ''
}) => ({
  type,
  description
});

// Store open status interface
export const createStoreOpenStatus = ({
  status = OPEN_STATUS.CLOSED,
  isOpening = false
}) => ({
  status,
  isOpening
});

// Store metadata interface
export const createStoreMetadata = ({
  reviewCount = 0,
  subscriberCount = 0,
  reportCount = 0
}) => ({
  reviewCount,
  subscriberCount,
  reportCount
});

// Store menu interface
export const createStoreMenu = ({
  name = '',
  description = '',
  category = null
}) => ({
  name,
  description,
  category
});

// Store detail info interface
export const createStoreDetailInfo = ({
  storeId = 0,
  name = '',
  owner = null,
  salesType = null,
  rating = 0.0,
  location = null,
  address = null,
  categories = [],
  appearanceDays = [],
  paymentMethods = [],
  menus = [],
  status = STORE_STATUS.ACTIVE,
  activitiesStatus = ACTIVITIES_STATUS.NO_RECENT_ACTIVITY,
  openStatus = null,
  metadata = null,
  createdAt = null,
  updatedAt = null
}) => ({
  storeId,
  name,
  owner,
  salesType,
  rating,
  location,
  address,
  categories,
  appearanceDays,
  paymentMethods,
  menus,
  status,
  activitiesStatus,
  openStatus,
  metadata,
  createdAt,
  updatedAt
});

// Store location interface
export const createStoreLocation = ({
  latitude = 0.0,
  longitude = 0.0
}) => ({
  latitude,
  longitude
});

// Store address interface
export const createStoreAddress = ({
  fullAddress = ''
}) => ({
  fullAddress
});

// Store category interface
export const createStoreCategory = ({
  categoryId = '',
  name = '',
  description = '',
  imageUrl = '',
  classification = null,
  isNew = false
}) => ({
  categoryId,
  name,
  description,
  imageUrl,
  classification,
  isNew
});

// Store search response interface
export const createStoreSearchResponse = ({
  stores = [],
  hasMore = false,
  nextCursor = null,
  totalCount = 0
}) => ({
  stores,
  hasMore,
  nextCursor,
  totalCount
});

// Utility functions
export const getStoreStatusDisplayName = (status) => {
  switch (status) {
    case STORE_STATUS.ACTIVE:
      return '활성된 가게';
    case STORE_STATUS.INACTIVE:
      return '비활성된 가게';
    case STORE_STATUS.DELETED:
      return '삭제된 가게';
    default:
      return '알 수 없음';
  }
};

export const getStoreStatusBadgeClass = (status) => {
  switch (status) {
    case STORE_STATUS.ACTIVE:
      return 'bg-success';
    case STORE_STATUS.INACTIVE:
      return 'bg-warning';
    case STORE_STATUS.DELETED:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

export const getActivitiesStatusDisplayName = (activitiesStatus) => {
  switch (activitiesStatus) {
    case ACTIVITIES_STATUS.RECENT_ACTIVITY:
      return '최근 활동 있는 가게';
    case ACTIVITIES_STATUS.NO_RECENT_ACTIVITY:
      return '최근 활동 없는 가게';
    default:
      return '최근 활동 알 수 없는 가게';
  }
};

export const getActivitiesStatusBadgeClass = (activitiesStatus) => {
  switch (activitiesStatus) {
    case ACTIVITIES_STATUS.RECENT_ACTIVITY:
      return 'bg-primary';
    case ACTIVITIES_STATUS.NO_RECENT_ACTIVITY:
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

export const formatRating = (rating) => {
  if (!rating || rating === 0) {
    return '평점 없음';
  }
  return `${rating.toFixed(1)}점`;
};

export const validateStoreSearch = (searchType, keyword) => {
  if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
    if (!keyword || !keyword.trim()) {
      return '검색어를 입력해주세요.';
    }
  }

  return null;
};

export const getCategoryIcon = (categoryId) => {
  // 카테고리별 아이콘 매핑
  const categoryIconMap = {
    'JAPANESE_CUISINE': 'bi-emoji-smile',
    'WESTERN_CUISINE': 'bi-cup-hot',
    'GUNGOGUMA': 'bi-fire',
    'DEFAULT': 'bi-shop'
  };

  return categoryIconMap[categoryId] || categoryIconMap['DEFAULT'];
};

export const getSalesTypeDisplayName = (salesType) => {
  switch (salesType) {
    case SALES_TYPE.ROAD:
      return '길거리';
    case SALES_TYPE.STORE:
      return '매장';
    default:
      return '알 수 없음';
  }
};

export const getSalesTypeBadgeClass = (salesType) => {
  switch (salesType) {
    case SALES_TYPE.ROAD:
      return 'bg-info';
    case SALES_TYPE.STORE:
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

export const getOpenStatusDisplayName = (openStatus) => {
  switch (openStatus) {
    case OPEN_STATUS.OPEN:
      return '영업중';
    case OPEN_STATUS.CLOSED:
      return '영업종료';
    default:
      return '알 수 없음';
  }
};

export const getOpenStatusBadgeClass = (openStatus) => {
  switch (openStatus) {
    case OPEN_STATUS.OPEN:
      return 'bg-success';
    case OPEN_STATUS.CLOSED:
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

export const getWriterTypeDisplayName = (writerType) => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return '일반 사용자';
    case WRITER_TYPE.ADMIN:
      return '관리자';
    default:
      return '알 수 없음';
  }
};

export const getWriterTypeBadgeClass = (writerType) => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return 'bg-primary';
    case WRITER_TYPE.ADMIN:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

export const formatCount = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toLocaleString();
};
