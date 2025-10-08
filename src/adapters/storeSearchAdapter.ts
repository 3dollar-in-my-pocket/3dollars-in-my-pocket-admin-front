import storeApi from '../api/storeApi';
import { STORE_SEARCH_TYPES, validateStoreSearch, StoreSearchType, Store, StoreType } from '../types/store';

interface SearchParams {
  searchType: StoreSearchType;
  searchQuery: string;
  cursor: string | null;
  targetStores?: StoreType[];
}

interface SearchResult {
  ok: boolean;
  data: {
    results: Store[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export const storeSearchAdapter = {
  // 검색 함수
  searchFunction: async ({ searchType, searchQuery, cursor, targetStores }: SearchParams): Promise<SearchResult> => {
    let response;

    if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
      response = await storeApi.searchStores(searchQuery, cursor, 20, targetStores);
    } else {
      response = await storeApi.getStores(cursor, 20, targetStores);
    }

    if (!response.ok) {
      throw new Error('Store search failed');
    }

    const { contents, cursor: responseCursor } = response.data;

    // 페이징 종료 조건: nextCursor가 없거나 결과가 비어있으면 더 이상 데이터 없음
    const hasMore = Boolean(
      responseCursor?.nextCursor &&
      contents &&
      contents.length > 0 &&
      responseCursor.hasMore !== false
    );

    return {
      ok: true,
      data: {
        results: contents || [],
        hasMore,
        nextCursor: hasMore ? responseCursor.nextCursor : null
      }
    };
  },

  // 검증 함수
  validateSearch: (searchType: StoreSearchType, searchQuery: string): string | null => {
    if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
      return validateStoreSearch(searchType, searchQuery);
    }
    return null;
  },

  // 검색 옵션
  searchOptions: [
    { value: STORE_SEARCH_TYPES.RECENT, label: '최신순 조회' },
    { value: STORE_SEARCH_TYPES.KEYWORD, label: '키워드 검색' }
  ],

  // 기본 설정
  defaultSearchType: STORE_SEARCH_TYPES.RECENT,
  errorMessage: '가게 정보를 불러오는 중 오류가 발생했습니다.'
};