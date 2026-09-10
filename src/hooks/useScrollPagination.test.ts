import React from 'react';
import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import useScrollPagination from './useScrollPagination';

/** 스크롤 이벤트를 흉내내어 currentTarget의 측정값만 전달합니다. */
const scrollEvent = (
  {scrollTop, scrollHeight, clientHeight}: {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  }
) => ({
  currentTarget: {scrollTop, scrollHeight, clientHeight},
} as React.UIEvent<HTMLElement>);

/** 컨테이너 높이 500, 전체 1000일 때 하단(95% 이상)에 도달한 이벤트 */
const atBottom = scrollEvent({scrollTop: 500, scrollHeight: 1000, clientHeight: 500});
/** 상단에 머물러 있는 이벤트 */
const atTop = scrollEvent({scrollTop: 0, scrollHeight: 1000, clientHeight: 500});

describe('useScrollPagination', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('하단에 도달하면 onLoadMore를 호출한다', () => {
    const onLoadMore = vi.fn();
    const {result} = renderHook(() => useScrollPagination({
      hasMore: true,
      isLoading: false,
      onLoadMore,
    }));

    act(() => result.current.handleScroll(atBottom));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('하단에 도달하지 않으면 호출하지 않는다', () => {
    const onLoadMore = vi.fn();
    const {result} = renderHook(() => useScrollPagination({
      hasMore: true,
      isLoading: false,
      onLoadMore,
    }));

    act(() => result.current.handleScroll(atTop));

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('hasMore가 false면 호출하지 않는다', () => {
    const onLoadMore = vi.fn();
    const {result} = renderHook(() => useScrollPagination({
      hasMore: false,
      isLoading: false,
      onLoadMore,
    }));

    act(() => result.current.handleScroll(atBottom));

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('로딩 중이면 호출하지 않는다', () => {
    const onLoadMore = vi.fn();
    const {result} = renderHook(() => useScrollPagination({
      hasMore: true,
      isLoading: true,
      onLoadMore,
    }));

    act(() => result.current.handleScroll(atBottom));

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('스크롤이 없는 컨테이너에서는 호출하지 않는다', () => {
    const onLoadMore = vi.fn();
    const {result} = renderHook(() => useScrollPagination({
      hasMore: true,
      isLoading: false,
      onLoadMore,
    }));

    // 콘텐츠가 컨테이너보다 짧으면 비율이 1이 되어 잘못 호출될 수 있다.
    act(() => result.current.handleScroll(
      scrollEvent({scrollTop: 0, scrollHeight: 400, clientHeight: 500})
    ));

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('연속 스크롤은 디바운스 간격 안에서 한 번만 호출한다', () => {
    const onLoadMore = vi.fn();
    const {result} = renderHook(() => useScrollPagination({
      hasMore: true,
      isLoading: false,
      onLoadMore,
    }));

    act(() => {
      result.current.handleScroll(atBottom);
      result.current.handleScroll(atBottom);
      result.current.handleScroll(atBottom);
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('디바운스 간격이 지나면 다시 호출한다', () => {
    const onLoadMore = vi.fn();
    const {result} = renderHook(() => useScrollPagination({
      hasMore: true,
      isLoading: false,
      onLoadMore,
    }));

    act(() => result.current.handleScroll(atBottom));
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(301);
      result.current.handleScroll(atBottom);
    });

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  // 회귀 테스트: handleScroll 참조가 매 렌더링 바뀌면 하위 컴포넌트가 불필요하게 리렌더된다
  it('handleScroll 참조는 상태가 바뀌어도 유지된다', () => {
    const onLoadMore = vi.fn();
    const {result, rerender} = renderHook(
      ({hasMore, isLoading}: {hasMore: boolean; isLoading: boolean}) =>
        useScrollPagination({hasMore, isLoading, onLoadMore}),
      {initialProps: {hasMore: true, isLoading: false}}
    );

    const firstHandler = result.current.handleScroll;

    rerender({hasMore: false, isLoading: true});

    expect(result.current.handleScroll).toBe(firstHandler);
  });

  // 회귀 테스트: 참조를 고정하면서 낡은 hasMore/isLoading을 보지 않아야 한다
  it('참조가 유지되어도 최신 hasMore/isLoading을 반영한다', () => {
    const onLoadMore = vi.fn();
    const {result, rerender} = renderHook(
      ({hasMore}: {hasMore: boolean}) =>
        useScrollPagination({hasMore, isLoading: false, onLoadMore}),
      {initialProps: {hasMore: false}}
    );

    const handler = result.current.handleScroll;

    act(() => handler(atBottom));
    expect(onLoadMore).not.toHaveBeenCalled();

    // hasMore가 true로 바뀌면 같은 핸들러 참조로도 로드되어야 한다.
    rerender({hasMore: true});

    act(() => handler(atBottom));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('최신 onLoadMore 콜백을 호출한다', () => {
    const first = vi.fn();
    const second = vi.fn();
    const {result, rerender} = renderHook(
      ({onLoadMore}: {onLoadMore: () => void}) =>
        useScrollPagination({hasMore: true, isLoading: false, onLoadMore}),
      {initialProps: {onLoadMore: first}}
    );

    rerender({onLoadMore: second});

    act(() => result.current.handleScroll(atBottom));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
