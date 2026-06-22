// Social login types
export const SOCIAL_TYPES = {
  KAKAO: 'KAKAO',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
  NAVER: 'NAVER',
  ANONYMOUS: null
} as const;

export type SocialType = typeof SOCIAL_TYPES[keyof typeof SOCIAL_TYPES];

// User role types
export const USER_ROLES = {
  MEMBER: 'MEMBER',
  MANAGER: 'MANAGER'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES] | null | string;

export interface UserRoleOption {
  type?: string;
  key?: string;
  value?: string;
  name?: string;
  description?: string;
  displayName?: string;
}

// Marketing consent types
export const MARKETING_CONSENT = {
  APPROVE: 'APPROVE',
  DENY: 'DENY',
  UNVERIFIED: 'UNVERIFIED'
} as const;

export type MarketingConsent = typeof MARKETING_CONSENT[keyof typeof MARKETING_CONSENT];

// Search types
export const SEARCH_TYPES = {
  NAME: 'name',
  USER_ID: 'userId'
} as const;

export type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];

// User interfaces
export interface User {
  name: string;
  nickname?: string;
  socialType: SocialType;
  role?: UserRole;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  enableActivitiesPush: boolean;
  marketingConsent: MarketingConsent;
}

export interface Medal {
  id: number;
  medalId?: number;
  name: string;
  iconUrl?: string;
  disableIconUrl?: string;
  introduction?: string;
  acquisition?: {
    description: string;
    createdAt: string;
  } | null;
}

export interface UserSearchRequest {
  type: SearchType;
  query?: string;
  userIds?: number[];
  cursor?: string | null;
  size: number;
}

export interface UserSearchResponse {
  users: User[];
  hasMore: boolean;
  nextCursor?: string | null;
  totalCount: number;
}

export interface UserDetailResponse {
  user: User | null;
  representativeMedal: Medal | null;
  medals: Medal[];
  setting: UserSettings | null;
}

// User search request interface
export const createUserSearchRequest = ({
                                          type = SEARCH_TYPES.NAME,
                                          query = '',
                                          userIds = [],
                                          cursor = null,
                                          size = 20
                                        }: Partial<UserSearchRequest> & { type?: SearchType }): UserSearchRequest => ({
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
                                         }: Partial<UserSearchResponse>): UserSearchResponse => ({
  users,
  hasMore,
  nextCursor,
  totalCount
});

// User settings interface
export const createUserSettings = ({
                                     enableActivitiesPush = false,
                                     marketingConsent = MARKETING_CONSENT.UNVERIFIED
                                   }: Partial<UserSettings>): UserSettings => ({
  enableActivitiesPush,
  marketingConsent
});

// User detail response interface
export const createUserDetailResponse = ({
                                           user = null,
                                           representativeMedal = null,
                                           medals = [],
                                           setting = null
                                         }: Partial<UserDetailResponse>): UserDetailResponse => ({
  user,
  representativeMedal,
  medals,
  setting,
});

// Utility functions
export const getSocialTypeDisplayName = (socialType: SocialType): string => {
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

export const getSocialTypeBadgeClass = (socialType: SocialType): string => {
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

export const getUserRoleValue = (option: UserRoleOption): string => {
  return option.type || option.key || option.value || option.name || '';
};

export const getUserRoleLabel = (role: UserRole, roleOptions: UserRoleOption[] = []): string => {
  if (!role) return '없음';

  const option = roleOptions.find((item) => getUserRoleValue(item) === role);
  if (option) {
    return option.description || option.displayName || getUserRoleValue(option);
  }

  switch (role) {
    case USER_ROLES.MEMBER:
      return '일반 유저';
    case USER_ROLES.MANAGER:
      return '매니저';
    default:
      return role;
  }
};

export const getUserRoleBadgeClass = (role: UserRole): string => {
  switch (role) {
    case USER_ROLES.MANAGER:
      return 'bg-danger text-danger border-danger';
    case USER_ROLES.MEMBER:
      return 'bg-primary text-primary border-primary';
    default:
      return 'bg-secondary text-secondary border-secondary';
  }
};

export const formatUserIds = (userIdsString: string): number[] => {
  if (!userIdsString?.trim()) {
    return [];
  }

  return userIdsString
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));
};

export const getMarketingConsentDisplayName = (marketingConsent: MarketingConsent): string => {
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

export const getMarketingConsentBadgeClass = (marketingConsent: MarketingConsent): string => {
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

export const validateUserSearch = (searchType: SearchType, searchQuery: string, userIds: string): string | null => {
  if (searchType === SEARCH_TYPES.NAME) {
    if (!searchQuery?.trim()) {
      return '검색어를 입력해주세요.';
    }
  }

  if (searchType === SEARCH_TYPES.USER_ID) {
    const formattedUserIds = formatUserIds(userIds);
    if (formattedUserIds.length === 0) {
      return '유저 ID를 입력해주세요.';
    }
    if (formattedUserIds.length > 50) {
      return '유저 ID는 최대 50개까지 조회 가능합니다.';
    }
  }

  return null;
};

// Random name types
export interface RandomNameItem {
  prefix: string;
  sequence: number;
}

export interface RandomNameResponse {
  contents: RandomNameItem[];
}

export const createRandomNameResponse = ({
                                           contents = []
                                         }: Partial<RandomNameResponse>): RandomNameResponse => ({
  contents
});
