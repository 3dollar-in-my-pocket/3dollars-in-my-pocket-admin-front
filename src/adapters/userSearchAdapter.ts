import userApi from '../api/userApi';
import {
  SEARCH_TYPES,
  createUserSearchRequest,
  formatUserIds,
  validateUserSearch,
  SearchType,
  User
} from '../types/user';

interface UserSearchParams {
  searchType: SearchType;
  searchQuery: string;
  additionalParams: any;
  cursor: string | null;
}

interface UserSearchResult {
  ok: boolean;
  data: {
    results: User[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export const userSearchAdapter = {
  // 검색 함수
  searchFunction: async ({ searchType, searchQuery, additionalParams, cursor }: UserSearchParams): Promise<UserSearchResult> => {
    const searchRequest = createUserSearchRequest({
      type: searchType,
      query: searchType === SEARCH_TYPES.NAME ? searchQuery : undefined,
      userIds: searchType === SEARCH_TYPES.USER_ID ? formatUserIds(additionalParams.userIds || '') : undefined,
      cursor,
      size: 30
    });

    const response = await userApi.searchUsers(searchRequest);

    if (!response.ok) {
      throw new Error('User search failed');
    }

    const { users, hasMore, nextCursor } = response.data;

    return {
      ok: true,
      data: {
        results: users || [],
        hasMore: hasMore || false,
        nextCursor: nextCursor || null
      }
    };
  },

  // 검증 함수
  validateSearch: (searchType: SearchType, searchQuery: string, additionalParams: any = {}): string | null => {
    if (searchType === SEARCH_TYPES.USER_ID) {
      return validateUserSearch(searchType, searchQuery, additionalParams.userIds || '');
    }
    return validateUserSearch(searchType, searchQuery, '');
  },

  // 검색 옵션
  searchOptions: [
    { value: SEARCH_TYPES.NAME, label: '닉네임 검색' },
    { value: SEARCH_TYPES.USER_ID, label: '유저 ID' }
  ],

  // 기본 설정
  defaultSearchType: SEARCH_TYPES.NAME,
  errorMessage: '사용자 정보를 불러오는 중 오류가 발생했습니다.'
};