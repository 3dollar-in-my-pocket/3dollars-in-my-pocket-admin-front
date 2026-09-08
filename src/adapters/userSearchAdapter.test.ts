import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@/api/userApi', () => ({
  default: {searchUsers: vi.fn()},
}));

import userApi from '@/api/userApi';
import {SEARCH_TYPES} from '@/types/user';
import {userSearchAdapter} from './userSearchAdapter';

const searchUsersMock = userApi.searchUsers as ReturnType<typeof vi.fn>;

/** 유저 검색 응답을 만듭니다. */
const usersResponse = (
  ids: string[],
  {hasMore, nextCursor}: {hasMore?: boolean; nextCursor?: string | null} = {}
) => ({
  ok: true,
  data: {
    users: ids.map(userId => ({userId})),
    hasMore,
    nextCursor,
  },
});

/** 어댑터 호출 파라미터의 기본값을 채웁니다. */
const search = (overrides: Record<string, any> = {}) =>
  userSearchAdapter.searchFunction({
    searchType: SEARCH_TYPES.NAME,
    searchQuery: '',
    additionalParams: {},
    cursor: null,
    ...overrides,
  } as any);

describe('userSearchAdapter.searchFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('닉네임 검색', () => {
    it('검색어를 query로 전달한다', async () => {
      searchUsersMock.mockResolvedValue(usersResponse(['1']));

      const result = await search({searchQuery: '홍길동'});

      expect(searchUsersMock).toHaveBeenCalledWith(
        expect.objectContaining({type: SEARCH_TYPES.NAME, query: '홍길동'})
      );
      expect(result.data.results).toEqual([{userId: '1'}]);
    });

    it('userIds는 전달하지 않는다', async () => {
      searchUsersMock.mockResolvedValue(usersResponse([]));

      await search({searchQuery: '홍길동', additionalParams: {userIds: '1,2'}});

      const request = searchUsersMock.mock.calls[0][0];
      expect(request.userIds).toBeUndefined();
    });
  });

  describe('유저 ID 검색', () => {
    it('쉼표로 구분된 ID를 숫자 배열로 전달한다', async () => {
      searchUsersMock.mockResolvedValue(usersResponse(['1', '2']));

      await search({
        searchType: SEARCH_TYPES.USER_ID,
        additionalParams: {userIds: '1, 2'},
      });

      expect(searchUsersMock).toHaveBeenCalledWith(
        expect.objectContaining({type: SEARCH_TYPES.USER_ID, userIds: [1, 2]})
      );
    });

    it('query는 전달하지 않는다', async () => {
      searchUsersMock.mockResolvedValue(usersResponse([]));

      await search({
        searchType: SEARCH_TYPES.USER_ID,
        searchQuery: '무시됨',
        additionalParams: {userIds: '1'},
      });

      const request = searchUsersMock.mock.calls[0][0];
      expect(request.query).toBeUndefined();
    });

    it('userIds가 없으면 빈 배열로 전달한다', async () => {
      searchUsersMock.mockResolvedValue(usersResponse([]));

      await search({searchType: SEARCH_TYPES.USER_ID, additionalParams: {}});

      expect(searchUsersMock).toHaveBeenCalledWith(
        expect.objectContaining({userIds: []})
      );
    });
  });

  describe('페이지네이션', () => {
    it('커서를 전달한다', async () => {
      searchUsersMock.mockResolvedValue(usersResponse(['1']));

      await search({searchQuery: '홍길동', cursor: 'c1'});

      expect(searchUsersMock).toHaveBeenCalledWith(
        expect.objectContaining({cursor: 'c1'})
      );
    });

    it('hasMore와 nextCursor를 그대로 반영한다', async () => {
      searchUsersMock.mockResolvedValue(
        usersResponse(['1'], {hasMore: true, nextCursor: 'c2'})
      );

      const result = await search({searchQuery: '홍길동'});

      expect(result.data.hasMore).toBe(true);
      expect(result.data.nextCursor).toBe('c2');
    });

    it('hasMore와 nextCursor가 없으면 더 없음으로 본다', async () => {
      searchUsersMock.mockResolvedValue(usersResponse(['1']));

      const result = await search({searchQuery: '홍길동'});

      expect(result.data.hasMore).toBe(false);
      expect(result.data.nextCursor).toBeNull();
    });
  });

  it('users가 없으면 빈 배열을 반환한다', async () => {
    searchUsersMock.mockResolvedValue({ok: true, data: {}});

    const result = await search({searchQuery: '홍길동'});

    expect(result.data.results).toEqual([]);
  });

  it('응답이 ok가 아니면 예외를 던진다', async () => {
    searchUsersMock.mockResolvedValue({ok: false, data: null});

    await expect(search({searchQuery: '홍길동'})).rejects.toThrow('User search failed');
  });
});

describe('userSearchAdapter.validateSearch', () => {
  it('닉네임 검색은 검색어를 요구한다', () => {
    expect(userSearchAdapter.validateSearch(SEARCH_TYPES.NAME, ''))
      .toBe('검색어를 입력해주세요.');
  });

  it('닉네임이 있으면 통과한다', () => {
    expect(userSearchAdapter.validateSearch(SEARCH_TYPES.NAME, '홍길동')).toBeNull();
  });

  it('유저 ID 검색은 additionalParams의 userIds를 검증한다', () => {
    expect(userSearchAdapter.validateSearch(SEARCH_TYPES.USER_ID, '', {userIds: ''}))
      .toBe('유저 ID를 입력해주세요.');
    expect(userSearchAdapter.validateSearch(SEARCH_TYPES.USER_ID, '', {userIds: '1,2'}))
      .toBeNull();
  });

  it('additionalParams를 넘기지 않아도 동작한다', () => {
    expect(userSearchAdapter.validateSearch(SEARCH_TYPES.USER_ID, ''))
      .toBe('유저 ID를 입력해주세요.');
  });
});
