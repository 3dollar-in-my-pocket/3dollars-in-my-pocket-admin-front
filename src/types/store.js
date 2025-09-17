// Store related type definitions and constants

// Store status types
export const STORE_STATUS = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
  AUTO_DELETED: 'AUTO_DELETED',
};

// Store activities status types
export const ACTIVITIES_STATUS = {
  RECENT_ACTIVITY: 'RECENT_ACTIVITY',
  NO_RECENT_ACTIVITY: 'NO_RECENT_ACTIVITY'
};

// Sales type
export const SALES_TYPE = {
  ROAD: 'ROAD',
  STORE: 'STORE',
  CONVENIENCE_STORE: 'CONVENIENCE_STORE',
  FOOD_TRUCK: 'FOOD_TRUCK'
};

// Open status
export const OPEN_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

// Writer type
export const WRITER_TYPE = {
  USER: 'USER',
  STORE: 'STORE'
};

// Store type
export const STORE_TYPE = {
  USER_STORE: 'USER_STORE',
  BOSS_STORE: 'BOSS_STORE'
};

// Search types
export const STORE_SEARCH_TYPES = {
  KEYWORD: 'keyword',
  RECENT: 'recent'
};

// Utility functions
export const getStoreStatusDisplayName = (status) => {
  switch (status) {
    case STORE_STATUS.ACTIVE:
      return '활성된 가게';
    case STORE_STATUS.AUTO_DELETED:
      return '자동 삭제된 가게';
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
    case STORE_STATUS.AUTO_DELETED:
      return 'bg-danger';
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
  if (!rating || rating <= 0) {
    return '아직 리뷰가 없어요';
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

export const getWriterTypeBadgeClass = (writerType) => {
  switch (writerType) {
    case WRITER_TYPE.USER:
      return 'bg-primary';
    case WRITER_TYPE.STORE:
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

export const getStoreTypeDisplayName = (storeType) => {
  switch (storeType) {
    case STORE_TYPE.USER_STORE:
      return '유저 제보 가게';
    case STORE_TYPE.BOSS_STORE:
      return '사장님 가게';
    default:
      return '알 수 없음';
  }
};

export const getStoreTypeBadgeClass = (storeType) => {
  switch (storeType) {
    case STORE_TYPE.USER_STORE:
      return 'bg-info';
    case STORE_TYPE.BOSS_STORE:
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

export const getStoreTypeIcon = (storeType) => {
  switch (storeType) {
    case STORE_TYPE.USER_STORE:
      return 'bi-people-fill';
    case STORE_TYPE.BOSS_STORE:
      return 'bi-person-badge-fill';
    default:
      return 'bi-question-circle-fill';
  }
};
