import {act, renderHook, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('react-toastify', () => {
  const toastFn = vi.fn() as any;
  toastFn.error = vi.fn();
  toastFn.success = vi.fn();
  toastFn.info = vi.fn();
  toastFn.warning = vi.fn();
  return {toast: toastFn};
});

import {toast} from 'react-toastify';
import useSearch, {SearchFunctionResponse} from './useSearch';

interface Row {
  id: number;
}

const result = (
  ids: number[],
  {hasMore = false, nextCursor = null}: {hasMore?: boolean; nextCursor?: string | null} = {}
): SearchFunctionResponse<Row> => ({
  ok: true,
  data: {results: ids.map(id => ({id})), hasMore, nextCursor},
});

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('검색을 실행하면 결과와 커서 상태를 반영한다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1, 2], {hasMore: true, nextCursor: 'c1'}));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    await act(async () => {
      await hook.current.handleSearch(true);
    });

    expect(hook.current.results).toEqual([{id: 1}, {id: 2}]);
    expect(hook.current.hasMore).toBe(true);
    expect(searchFunction).toHaveBeenCalledWith(expect.objectContaining({cursor: null, reset: true}));
  });

  it('더보기는 커서를 넘겨 결과를 이어 붙인다', async () => {
    const searchFunction = vi.fn()
      .mockResolvedValueOnce(result([1], {hasMore: true, nextCursor: 'c1'}))
      .mockResolvedValueOnce(result([2], {hasMore: false}));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    await act(async () => {
      await hook.current.handleSearch(true);
    });

    await act(async () => {
      hook.current.handleLoadMore();
    });

    await waitFor(() => expect(hook.current.results).toHaveLength(2));
    expect(searchFunction).toHaveBeenLastCalledWith(
      expect.objectContaining({cursor: 'c1', reset: false})
    );
  });

  // 회귀 테스트: 커서가 없을 때 더보기가 API를 반복 호출하지 않아야 한다
  it('다음 커서가 없으면 더보기가 요청하지 않는다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1], {hasMore: false}));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    await act(async () => {
      await hook.current.handleSearch(true);
    });
    expect(searchFunction).toHaveBeenCalledTimes(1);

    await act(async () => {
      hook.current.handleLoadMore();
    });

    expect(searchFunction).toHaveBeenCalledTimes(1);
  });

  it('검증에 실패하면 요청하지 않고 안내한다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1]));
    const validateSearch = vi.fn().mockReturnValue('검색어를 입력해주세요.');

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction, validateSearch}));

    await act(async () => {
      await hook.current.handleSearch(true);
    });

    expect(searchFunction).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('검색어를 입력해주세요.');
  });

  it('검증을 통과하면 요청한다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1]));
    const validateSearch = vi.fn().mockReturnValue(null);

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction, validateSearch}));

    await act(async () => {
      await hook.current.handleSearch(true);
    });

    expect(searchFunction).toHaveBeenCalledTimes(1);
    expect(hook.current.results).toEqual([{id: 1}]);
  });

  it('ok가 false면 에러 메시지를 띄우고 결과를 비운다', async () => {
    const searchFunction = vi.fn().mockResolvedValue({ok: false, data: null});

    const {result: hook} = renderHook(() => useSearch<Row>({
      searchFunction,
      errorMessage: '가게 검색에 실패했습니다.',
    }));

    await act(async () => {
      await hook.current.handleSearch(true);
    });

    expect(toast.error).toHaveBeenCalledWith('가게 검색에 실패했습니다.');
    expect(hook.current.results).toEqual([]);
    expect(hook.current.hasMore).toBe(false);
  });

  it('더보기 실패 시에는 기존 결과를 유지한다', async () => {
    const searchFunction = vi.fn()
      .mockResolvedValueOnce(result([1], {hasMore: true, nextCursor: 'c1'}))
      .mockRejectedValueOnce(new Error('network'));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    await act(async () => {
      await hook.current.handleSearch(true);
    });

    await act(async () => {
      hook.current.handleLoadMore();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    // 더보기 실패는 이미 보고 있던 목록을 지우지 않는다.
    expect(hook.current.results).toEqual([{id: 1}]);
  });

  it('요청이 진행 중이면 중복 검색을 차단한다', async () => {
    let resolveFirst: (value: SearchFunctionResponse<Row>) => void = () => {};
    const searchFunction = vi.fn().mockImplementationOnce(
      () => new Promise(resolve => {
        resolveFirst = resolve;
      })
    );

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    act(() => {
      hook.current.handleSearch(true);
      hook.current.handleSearch(true);
    });

    expect(searchFunction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst(result([1]));
    });
  });

  // 회귀 테스트: resetSearch가 additionalParams를 비우지 않아 이전 조건이 섞이던 버그
  it('resetSearch는 검색어와 추가 파라미터를 모두 비운다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1]));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    act(() => {
      hook.current.setSearchQuery('떡볶이');
      hook.current.setAdditionalParams({storeIds: '1,2,3'});
    });

    await waitFor(() => expect(hook.current.additionalParams).toEqual({storeIds: '1,2,3'}));

    act(() => {
      hook.current.resetSearch();
    });

    expect(hook.current.searchQuery).toBe('');
    expect(hook.current.additionalParams).toEqual({});
    expect(hook.current.results).toEqual([]);
    expect(hook.current.hasMore).toBe(false);
  });

  it('resetSearch 후 더보기는 요청하지 않는다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1], {hasMore: true, nextCursor: 'c1'}));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    await act(async () => {
      await hook.current.handleSearch(true);
    });

    act(() => {
      hook.current.resetSearch();
    });

    await act(async () => {
      hook.current.handleLoadMore();
    });

    // 커서까지 초기화되므로 추가 요청이 발생하지 않는다.
    expect(searchFunction).toHaveBeenCalledTimes(1);
  });

  it('Enter 키를 누르면 검색을 실행한다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1]));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    await act(async () => {
      hook.current.handleKeyPress({key: 'Enter'} as React.KeyboardEvent<HTMLElement>);
    });

    await waitFor(() => expect(searchFunction).toHaveBeenCalledTimes(1));
  });

  it('Enter 외의 키는 검색하지 않는다', async () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1]));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    await act(async () => {
      hook.current.handleKeyPress({key: 'a'} as React.KeyboardEvent<HTMLElement>);
    });

    expect(searchFunction).not.toHaveBeenCalled();
  });

  it('항목 선택과 모달 닫기가 selectedItem을 갱신한다', () => {
    const searchFunction = vi.fn().mockResolvedValue(result([1]));

    const {result: hook} = renderHook(() => useSearch<Row>({searchFunction}));

    act(() => hook.current.handleItemClick({id: 7}));
    expect(hook.current.selectedItem).toEqual({id: 7});

    act(() => hook.current.handleCloseModal());
    expect(hook.current.selectedItem).toBeNull();
  });
});
