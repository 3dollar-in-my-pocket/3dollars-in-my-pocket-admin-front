// User related type definitions and constants

// Social login types
export const SOCIAL_TYPES = {
  KAKAO: 'KAKAO',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
  NAVER: 'NAVER',
  ANONYMOUS: null
};

// Marketing consent types
export const MARKETING_CONSENT = {
  APPROVE: 'APPROVE',
  DENY: 'DENY',
  UNVERIFIED: 'UNVERIFIED'
};

// Search types
export const SEARCH_TYPES = {
  NAME: 'name',
  USER_ID: 'userId'
};

// User search request interface
export const createUserSearchRequest = ({
                                          type = SEARCH_TYPES.NAME,
                                          query = '',
                                          userIds = [],
                                          cursor = null,
                                          size = 20
                                        }) => ({
  type,
  query: type === SEARCH_TYPES.NAME ? query : undefined,
  userIds: type === SEARCH_TYPES.USER_ID ? userIds : undefined,
  cursor,
  size
});

// Search response interface
export const createUserSearchResponse = ({
                                           users = [],
                                           hasMore = false,
                                           nextCursor = null,
                                           totalCount = 0
                                         }) => ({
  users,
  hasMore,
  nextCursor,
  totalCount
});

// User settings interface
export const createUserSettings = ({
                                     enableActivitiesPush = false,
                                     marketingConsent = MARKETING_CONSENT.UNVERIFIED
                                   }) => ({
  enableActivitiesPush,
  marketingConsent
});

// User detail response interface
export const createUserDetailResponse = ({
                                           user = null,
                                           representativeMedal = null,
                                           medals = [],
                                           setting = null
                                         }) => ({
  user,
  representativeMedal,
  medals,
  setting,
});

// Utility functions
export const getSocialTypeDisplayName = (socialType) => {
  switch (socialType) {
    case SOCIAL_TYPES.KAKAO:
      return 'KAKAO';
    case SOCIAL_TYPES.GOOGLE:
      return 'GOOGLE';
    case SOCIAL_TYPES.APPLE:
      return 'APPLE';
    case SOCIAL_TYPES.NAVER:
      return 'NAVER';
    case SOCIAL_TYPES.ANONYMOUS:
      return '익명 가입';
    default:
      return '알 수 없음';
  }
};

export const getSocialTypeBadgeClass = (socialType) => {
  switch (socialType) {
    case SOCIAL_TYPES.KAKAO:
      return 'bg-warning';
    case SOCIAL_TYPES.GOOGLE:
      return 'bg-danger';
    case SOCIAL_TYPES.APPLE:
      return 'bg-dark';
    case SOCIAL_TYPES.NAVER:
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

export const formatUserIds = (userIdsString) => {
  if (!userIdsString || !userIdsString.trim()) {
    return [];
  }

  return userIdsString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
};

export const getMarketingConsentDisplayName = (marketingConsent) => {
  switch (marketingConsent) {
    case MARKETING_CONSENT.APPROVE:
      return '동의';
    case MARKETING_CONSENT.DENY:
      return '거부';
    case MARKETING_CONSENT.UNVERIFIED:
      return '미확인';
    default:
      return '알 수 없음';
  }
};

export const getMarketingConsentBadgeClass = (marketingConsent) => {
  switch (marketingConsent) {
    case MARKETING_CONSENT.APPROVE:
      return 'bg-success';
    case MARKETING_CONSENT.DENY:
      return 'bg-danger';
    case MARKETING_CONSENT.UNVERIFIED:
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

export const validateUserSearch = (searchType, searchQuery, userIds) => {
  if (searchType === SEARCH_TYPES.NAME) {
    if (!searchQuery || !searchQuery.trim()) {
      return '검색어를 입력해주세요.';
    }
  }

  if (searchType === SEARCH_TYPES.USER_ID) {
    const formattedUserIds = formatUserIds(userIds);
    if (formattedUserIds.length === 0) {
      return '유저 ID를 입력해주세요.';
    }
  }

  return null;
};
