/**
 * 유저 검색 입력값 검증
 */

import { SEARCH_TYPES, SearchType } from '@/types/user';

/** 쉼표로 구분된 유저 ID 문자열을 숫자 배열로 변환합니다. */
export const formatUserIds = (userIdsString: string): number[] => {
  if (!userIdsString?.trim()) {
    return [];
  }

  return userIdsString
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));
};

export const validateUserSearch = (
  searchType: SearchType,
  searchQuery: string,
  userIds: string
): string | null => {
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
