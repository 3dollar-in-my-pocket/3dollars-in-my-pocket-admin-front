/**
 * 가게 검색 입력값 검증
 */

import { STORE_SEARCH_TYPES, StoreSearchType } from '@/types/store';

export const validateStoreSearch = (searchType: StoreSearchType, keyword: string): string | null => {
  if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
    if (!keyword || !keyword.trim()) {
      return '검색어를 입력해주세요.';
    }
  }

  if (searchType === STORE_SEARCH_TYPES.STORE_ID) {
    if (!keyword || !keyword.trim()) {
      return '가게 ID를 입력해주세요.';
    }

    // 쉼표로 구분된 ID들 검증
    const ids = keyword.split(',').map(id => id.trim()).filter(id => id);

    if (ids.length === 0) {
      return '가게 ID를 입력해주세요.';
    }

    if (ids.length > 5) {
      return '최대 5개의 가게 ID만 입력 가능합니다.';
    }

    // 모든 ID가 숫자인지 확인
    const hasInvalidId = ids.some(id => !/^\d+$/.test(id));
    if (hasInvalidId) {
      return '가게 ID는 숫자만 입력 가능합니다.';
    }
  }

  return null;
};
