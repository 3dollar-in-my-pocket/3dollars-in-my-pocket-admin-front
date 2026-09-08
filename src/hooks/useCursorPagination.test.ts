import {act, renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import useCursorPagination from './useCursorPagination';
import {ApiResponse, PaginatedResponse} from '@/types/api';

interface Row {
  id: number;
}

/** 서버 공통 커서 응답을 만듭니다. */
const page = (
  ids: number[],
  {hasMore = false, nextCursor = null, totalCount}: {
    hasMore?: boolean;
    nextCursor?: string | null;
    totalCount?: number;
  } = {}
): ApiResponse<PaginatedResponse<Row>> => ({
  ok: true,
  data: {
    contents: ids.map(id => ({id})),
    cursor: {hasMore, nextCursor, ...(totalCount !== undefined && {totalCount})},
  },
});

const failure = (): ApiResponse<PaginatedResponse<Row>> => ({
  ok: false,
  data: {contents: [], cursor: {hasMore: false, nextCursor: null}},
});

describe('useCursorPagination', () => {
  it('마운트 시 첫 페이지를 한 번만 조회한다', async () => {
    const fetcher = vi.fn().mockResolvedValue(page([1, 2]));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(null);
    expect(result.current.items).toEqual([{id: 1}, {id: 2}]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loadMore는 커서를 넘겨 다음 페이지를 이어 붙인다', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page([1], {hasMore: true, nextCursor: 'c1'}))
      .mockResolvedValueOnce(page([2], {hasMore: false}));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(fetcher).toHaveBeenLastCalledWith('c1');
    expect(result.current.items).toEqual([{id: 1}, {id: 2}]);
    expect(result.current.hasMore).toBe(false);
  });

  // 회귀 테스트: 커서가 없는데 더보기를 호출해 API가 반복 호출되는 것을 막는다
  it('다음 커서가 없으면 loadMore가 요청하지 않는다', async () => {
    const fetcher = vi.fn().mockResolvedValue(page([1], {hasMore: false}));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.loadMore();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('요청이 진행 중이면 중복 호출을 차단한다', async () => {
    let resolveFirst: (value: ApiResponse<PaginatedResponse<Row>>) => void = () => {};
    const fetcher = vi.fn()
      .mockImplementationOnce(() => new Promise(resolve => {
        resolveFirst = resolve;
      }));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    // 첫 요청이 끝나기 전에 refresh를 여러 번 호출한다.
    act(() => {
      result.current.refresh();
      result.current.refresh();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst(page([1]));
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('enabled가 false면 조회하지 않는다', async () => {
    const fetcher = vi.fn().mockResolvedValue(page([1]));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher, enabled: false}));

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
  });

  it('deps가 바뀌면 첫 페이지부터 다시 조회한다', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page([1], {hasMore: true, nextCursor: 'c1'}))
      .mockResolvedValueOnce(page([9]));

    const {result, rerender} = renderHook(
      ({tab}: {tab: string}) => useCursorPagination<Row>({fetcher, deps: [tab]}),
      {initialProps: {tab: 'a'}}
    );

    await waitFor(() => expect(result.current.items).toEqual([{id: 1}]));

    rerender({tab: 'b'});

    await waitFor(() => expect(result.current.items).toEqual([{id: 9}]));
    // 조건이 바뀌면 이전 커서를 쓰지 않고 첫 페이지를 조회한다.
    expect(fetcher).toHaveBeenLastCalledWith(null);
  });

  it('ok가 false면 error에 메시지를 담는다', async () => {
    const fetcher = vi.fn().mockResolvedValue(failure());

    const {result} = renderHook(() => useCursorPagination<Row>({
      fetcher,
      errorMessage: '목록 조회에 실패했습니다.',
    }));

    await waitFor(() => expect(result.current.error).toBe('목록 조회에 실패했습니다.'));
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('예외가 발생해도 로딩이 해제되고 error가 설정된다', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network'));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    await waitFor(() => expect(result.current.error).toBe('데이터를 불러오는데 실패했습니다.'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('totalCount가 응답에 있으면 노출한다', async () => {
    const fetcher = vi.fn().mockResolvedValue(page([1, 2], {totalCount: 42}));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    await waitFor(() => expect(result.current.totalCount).toBe(42));
  });

  it('refresh는 목록을 새 결과로 교체한다', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page([1, 2]))
      .mockResolvedValueOnce(page([3]));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.items).toEqual([{id: 3}]));
  });

  it('더보기 중에는 isLoadingMore가 true가 된다', async () => {
    let resolveSecond: (value: ApiResponse<PaginatedResponse<Row>>) => void = () => {};
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page([1], {hasMore: true, nextCursor: 'c1'}))
      .mockImplementationOnce(() => new Promise(resolve => {
        resolveSecond = resolve;
      }));

    const {result} = renderHook(() => useCursorPagination<Row>({fetcher}));

    await waitFor(() => expect(result.current.hasMore).toBe(true));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.isLoadingMore).toBe(true));

    await act(async () => {
      resolveSecond(page([2]));
    });

    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
  });
});
