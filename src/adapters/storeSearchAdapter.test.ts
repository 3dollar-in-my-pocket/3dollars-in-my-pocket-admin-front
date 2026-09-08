import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@/api/storeApi', () => ({
  default: {
    searchStores: vi.fn(),
    getStores: vi.fn(),
    getStoreDetail: vi.fn(),
  },
}));

import storeApi from '@/api/storeApi';
import {STORE_SEARCH_TYPES, STORE_TYPE} from '@/types/store';
import {storeSearchAdapter} from './storeSearchAdapter';

const searchStoresMock = storeApi.searchStores as ReturnType<typeof vi.fn>;
const getStoresMock = storeApi.getStores as ReturnType<typeof vi.fn>;
const getStoreDetailMock = storeApi.getStoreDetail as ReturnType<typeof vi.fn>;

/** 커서 페이지네이션 응답을 만듭니다. */
const listResponse = (
  ids: number[],
  {hasMore, nextCursor}: {hasMore?: boolean; nextCursor?: string | null} = {}
) => ({
  ok: true,
  data: {
    contents: ids.map(storeId => ({storeId})),
    cursor: {hasMore, nextCursor},
  },
});

/** 어댑터 호출 파라미터의 기본값을 채웁니다. */
const search = (overrides: Record<string, any> = {}) =>
  storeSearchAdapter.searchFunction({
    searchType: STORE_SEARCH_TYPES.KEYWORD,
    searchQuery: '',
    cursor: null,
    ...overrides,
  } as any);

describe('storeSearchAdapter.searchFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('키워드 검색', () => {
    it('검색어가 있으면 searchStores를 호출한다', async () => {
      searchStoresMock.mockResolvedValue(listResponse([1]));

      const result = await search({searchQuery: '떡볶이'});

      expect(searchStoresMock).toHaveBeenCalledWith('떡볶이', null, 20, undefined);
      expect(getStoresMock).not.toHaveBeenCalled();
      expect(result.data.results).toEqual([{storeId: 1}]);
    });

    it('검색어의 앞뒤 공백을 제거해 호출한다', async () => {
      searchStoresMock.mockResolvedValue(listResponse([1]));

      await search({searchQuery: '  떡볶이  '});

      expect(searchStoresMock).toHaveBeenCalledWith('떡볶이', null, 20, undefined);
    });

    it('검색어가 비어 있으면 전체 목록을 조회한다', async () => {
      getStoresMock.mockResolvedValue(listResponse([1, 2]));

      const result = await search({searchQuery: '   '});

      expect(getStoresMock).toHaveBeenCalledWith(null, 20, undefined);
      expect(searchStoresMock).not.toHaveBeenCalled();
      expect(result.data.results).toHaveLength(2);
    });

    it('가게 타입 필터를 전달한다', async () => {
      getStoresMock.mockResolvedValue(listResponse([1]));

      await search({searchQuery: '', targetStores: [STORE_TYPE.BOSS_STORE]});

      expect(getStoresMock).toHaveBeenCalledWith(null, 20, [STORE_TYPE.BOSS_STORE]);
    });

    it('커서를 전달한다', async () => {
      searchStoresMock.mockResolvedValue(listResponse([2]));

      await search({searchQuery: '떡볶이', cursor: 'c1'});

      expect(searchStoresMock).toHaveBeenCalledWith('떡볶이', 'c1', 20, undefined);
    });

    it('응답이 ok가 아니면 예외를 던진다', async () => {
      searchStoresMock.mockResolvedValue({ok: false, data: null});

      await expect(search({searchQuery: '떡볶이'})).rejects.toThrow('Store search failed');
    });
  });

  describe('hasMore 계산', () => {
    it('nextCursor가 있고 결과가 있으면 더 있음으로 본다', async () => {
      getStoresMock.mockResolvedValue(listResponse([1], {hasMore: true, nextCursor: 'c1'}));

      const result = await search();

      expect(result.data.hasMore).toBe(true);
      expect(result.data.nextCursor).toBe('c1');
    });

    it('nextCursor가 없으면 더 없음으로 본다', async () => {
      getStoresMock.mockResolvedValue(listResponse([1], {hasMore: true, nextCursor: null}));

      const result = await search();

      expect(result.data.hasMore).toBe(false);
      expect(result.data.nextCursor).toBeNull();
    });

    // 서버가 nextCursor를 줬더라도 결과가 비면 더 요청하지 않는다
    it('결과가 비어 있으면 더 없음으로 본다', async () => {
      getStoresMock.mockResolvedValue(listResponse([], {hasMore: true, nextCursor: 'c1'}));

      const result = await search();

      expect(result.data.hasMore).toBe(false);
      expect(result.data.nextCursor).toBeNull();
    });

    it('hasMore가 명시적으로 false면 더 없음으로 본다', async () => {
      getStoresMock.mockResolvedValue(listResponse([1], {hasMore: false, nextCursor: 'c1'}));

      const result = await search();

      expect(result.data.hasMore).toBe(false);
    });
  });

  describe('가게 ID 검색', () => {
    const idSearch = (searchQuery: string, targetStores?: any) =>
      search({searchType: STORE_SEARCH_TYPES.STORE_ID, searchQuery, targetStores});

    it('쉼표로 구분된 ID를 각각 조회한다', async () => {
      getStoreDetailMock
        .mockResolvedValueOnce({ok: true, data: {storeId: 1, storeType: STORE_TYPE.USER_STORE}})
        .mockResolvedValueOnce({ok: true, data: {storeId: 2, storeType: STORE_TYPE.USER_STORE}});

      const result = await idSearch('1, 2');

      expect(getStoreDetailMock).toHaveBeenCalledTimes(2);
      expect(getStoreDetailMock).toHaveBeenCalledWith('1');
      expect(getStoreDetailMock).toHaveBeenCalledWith('2');
      expect(result.data.results).toHaveLength(2);
    });

    it('조회에 실패한 ID는 결과에서 제외한다', async () => {
      getStoreDetailMock
        .mockResolvedValueOnce({ok: true, data: {storeId: 1, storeType: STORE_TYPE.USER_STORE}})
        .mockResolvedValueOnce({ok: false, data: null});

      const result = await idSearch('1, 2');

      expect(result.data.results).toEqual([{storeId: 1, storeType: STORE_TYPE.USER_STORE}]);
    });

    it('가게 타입 필터로 결과를 걸러낸다', async () => {
      getStoreDetailMock
        .mockResolvedValueOnce({ok: true, data: {storeId: 1, storeType: STORE_TYPE.USER_STORE}})
        .mockResolvedValueOnce({ok: true, data: {storeId: 2, storeType: STORE_TYPE.BOSS_STORE}});

      const result = await idSearch('1, 2', [STORE_TYPE.BOSS_STORE]);

      expect(result.data.results).toEqual([{storeId: 2, storeType: STORE_TYPE.BOSS_STORE}]);
    });

    it('ID 검색은 페이징하지 않는다', async () => {
      getStoreDetailMock.mockResolvedValue({ok: true, data: {storeId: 1}});

      const result = await idSearch('1');

      expect(result.data.hasMore).toBe(false);
      expect(result.data.nextCursor).toBeNull();
    });

    it('빈 항목은 조회하지 않는다', async () => {
      getStoreDetailMock.mockResolvedValue({ok: true, data: {storeId: 1}});

      await idSearch('1, , ');

      expect(getStoreDetailMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('최신순 조회', () => {
    it('검색어와 무관하게 전체 목록을 조회한다', async () => {
      getStoresMock.mockResolvedValue(listResponse([1]));

      await search({searchType: STORE_SEARCH_TYPES.RECENT, searchQuery: '무시됨'});

      expect(getStoresMock).toHaveBeenCalledWith(null, 20, undefined);
      expect(searchStoresMock).not.toHaveBeenCalled();
    });
  });
});

describe('storeSearchAdapter.validateSearch', () => {
  it('가게 ID 검색은 검증한다', () => {
    expect(storeSearchAdapter.validateSearch(STORE_SEARCH_TYPES.STORE_ID, ''))
      .toBe('가게 ID를 입력해주세요.');
  });

  it('키워드 검색은 빈 검색어를 허용한다', () => {
    expect(storeSearchAdapter.validateSearch(STORE_SEARCH_TYPES.KEYWORD, '')).toBeNull();
  });

  it('최신순 조회는 검증하지 않는다', () => {
    expect(storeSearchAdapter.validateSearch(STORE_SEARCH_TYPES.RECENT, '')).toBeNull();
  });
});
