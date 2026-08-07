import { Medal } from './medal';

// 유저 응답에 포함되는 메달은 메달 관리와 동일한 모델을 사용합니다.
export type { Medal };

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

/**
 * UserResponse — 작성자/방문자/신고자 등 응답에 포함되는 사용자 요약 정보
 *
 * 유저 검색 응답 모델은 위의 User를 사용하세요. (별개 스키마)
 */
export interface SimpleUser {
  userId?: number;
  name: string;
  socialType?: SocialType;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}
