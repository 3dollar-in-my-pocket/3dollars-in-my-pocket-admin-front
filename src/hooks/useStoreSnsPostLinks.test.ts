import {act, renderHook, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import storeSnsPostLinkApi from '@/api/storeSnsPostLinkApi';
import useStoreSnsPostLinks from './useStoreSnsPostLinks';
import {StoreSnsPostLinkSort} from '@/types/storeSnsPostLink';

vi.mock('@/api/storeSnsPostLinkApi', () => ({default: {list: vi.fn()}}));
const list = vi.mocked(storeSnsPostLinkApi.list);
const page = (postId: string, hasMore = false, nextCursor?: string) => ({
  ok: true,
  data: {contents: [{postId, platform: 'THREADS' as const, createdAt: '2026-10-12T14:30:15'}], cursor: {hasMore, nextCursor}},
});

describe('SNS 포스트 커서 목록', () => {
  beforeEach(() => list.mockReset());

  it('서버 커서를 그대로 전달하고 마지막 페이지 이후 요청을 중단한다', async () => {
    list.mockResolvedValueOnce(page('98765', true, 'OTg3NjU='))
      .mockResolvedValueOnce(page('98764', false, '남은 커서는 무시'));
    const {result} = renderHook(() => useStoreSnsPostLinks('12345', 'LATEST'));
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    await act(async () => { await result.current.loadMore(); });
    expect(list).toHaveBeenLastCalledWith('12345', 'OTg3NjU=', 'LATEST');
    expect(result.current.items.map(post => post.postId)).toEqual(['98765', '98764']);
    await act(async () => { await result.current.loadMore(); });
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('invalid_cursor이면 첫 페이지로 복구하고 기존 목록을 교체한다', async () => {
    list.mockResolvedValueOnce(page('old', true, 'broken'))
      .mockResolvedValueOnce({ok: false, data: null, error: 'invalid_cursor'})
      .mockResolvedValueOnce(page('new'));
    const {result} = renderHook(() => useStoreSnsPostLinks('12345', 'LATEST'));
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    await act(async () => { await result.current.loadMore(); });
    expect(list).toHaveBeenLastCalledWith('12345', null, 'LATEST');
    expect(result.current.items[0].postId).toBe('new');
    expect(result.current.items).toHaveLength(1);
  });

  it('다른 오류 코드는 커서 복구로 반복 조회하지 않는다', async () => {
    list.mockResolvedValueOnce(page('old', true, 'broken'))
      .mockResolvedValueOnce({ok: false, data: null, error: 'invalid_parameter', message: '잘못된 커서'});
    const {result} = renderHook(() => useStoreSnsPostLinks('12345', 'LATEST'));
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    await act(async () => { await result.current.loadMore(); });
    expect(list).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBe('잘못된 커서');
  });

  it('조회 중 중복 호출을 막고 가게·정렬 변경 후 이전 응답을 무시한다', async () => {
    let resolveOld: (value: ReturnType<typeof page>) => void;
    list.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
      .mockResolvedValueOnce(page('new'));
    const {result, rerender} = renderHook(
      ({storeId, sortBy}) => useStoreSnsPostLinks(storeId, sortBy),
      {initialProps: {storeId: '1', sortBy: 'LATEST' as StoreSnsPostLinkSort}}
    );
    await act(async () => { await result.current.refresh(); });
    expect(list).toHaveBeenCalledTimes(1);
    rerender({storeId: '2', sortBy: 'OLDEST'});
    await waitFor(() => expect(result.current.items[0]?.postId).toBe('new'));
    await act(async () => { resolveOld(page('old')); });
    expect(result.current.items[0].postId).toBe('new');
    expect(list).toHaveBeenLastCalledWith('2', null, 'OLDEST');
  });
});
