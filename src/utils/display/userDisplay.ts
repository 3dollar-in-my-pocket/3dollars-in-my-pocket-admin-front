/**
 * 유저 관련 표시 로직 (라벨, 배지 클래스)
 *
 * 타입과 상수 정의는 types/user.ts에 있습니다.
 */

import {
  MARKETING_CONSENT,
  MarketingConsent,
  SOCIAL_TYPES,
  SocialType,
  USER_ROLES,
  UserRole,
  UserRoleOption
} from '@/types/user';

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

/** 역할 옵션 응답이 키를 여러 형태로 내려주어 순서대로 확인합니다. */
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
      return 'bg-danger bg-opacity-10 text-danger border border-danger';
    case USER_ROLES.MEMBER:
      return 'bg-primary bg-opacity-10 text-primary border border-primary';
    default:
      return 'bg-secondary bg-opacity-10 text-secondary border border-secondary';
  }
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
