import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import useInfiniteScroll from './useInfiniteScroll';

const observers: {
  notify: (isIntersecting: boolean) => void;
  options: IntersectionObserverInit;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];

interface ListProps {
  showTarget?: boolean;
  nested?: boolean;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
}

const List = ({showTarget = true, nested = false, hasMore = true, isLoading = false, onLoadMore}: ListProps) => {
  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({hasMore, isLoading, onLoadMore});
  return (
    <div ref={nested ? scrollContainerRef : undefined} data-testid="list">
      {showTarget && <div ref={loadMoreRef} data-testid="sentinel"/>}
    </div>
  );
};

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        observers.push({
          notify: isIntersecting => callback([{isIntersecting} as IntersectionObserverEntry], this as any),
          options,
          observe: this.observe,
          disconnect: this.disconnect,
        });
      }
      observe = vi.fn();
      disconnect = vi.fn();
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('페이지 하단이 보이면 뷰포트를 기준으로 다음 페이지를 요청한다', () => {
    const onLoadMore = vi.fn();
    render(<List onLoadMore={onLoadMore}/>);

    expect(observers[0].options.root).toBeNull();
    act(() => observers[0].notify(false));
    expect(onLoadMore).not.toHaveBeenCalled();
    act(() => observers[0].notify(true));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('별도 스크롤 컨테이너를 연결한 기존 화면도 지원한다', () => {
    render(<List nested onLoadMore={vi.fn()}/>);
    expect(observers[0].options.root).toBe(screen.getByTestId('list'));
  });

  it('hasMore가 그대로여도 늦게 나타나거나 교체된 감지 요소를 관찰한다', () => {
    const onLoadMore = vi.fn();
    const {rerender, unmount} = render(<List showTarget={false} onLoadMore={onLoadMore}/>);
    expect(observers).toHaveLength(0);

    rerender(<List onLoadMore={onLoadMore}/>);
    const firstTarget = screen.getByTestId('sentinel');
    expect(observers[0].observe).toHaveBeenCalledWith(firstTarget);

    rerender(<List showTarget={false} onLoadMore={onLoadMore}/>);
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    rerender(<List onLoadMore={onLoadMore}/>);
    expect(screen.getByTestId('sentinel')).not.toBe(firstTarget);
    expect(observers[1].observe).toHaveBeenCalledWith(screen.getByTestId('sentinel'));
    act(() => observers[1].notify(true));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    unmount();
    expect(observers[1].disconnect).toHaveBeenCalledTimes(1);
  });

  it('로딩 중인 요청을 중복 호출하지 않고 최신 콜백을 사용한다', () => {
    const initialLoad = vi.fn();
    const nextLoad = vi.fn();
    const {rerender} = render(<List isLoading onLoadMore={initialLoad}/>);
    act(() => observers[0].notify(true));
    expect(initialLoad).not.toHaveBeenCalled();

    rerender(<List onLoadMore={nextLoad}/>);
    act(() => observers[0].notify(true));
    expect(initialLoad).not.toHaveBeenCalled();
    expect(nextLoad).toHaveBeenCalledTimes(1);
    expect(observers).toHaveLength(1);
  });

  it('마지막 페이지에서는 감지를 해제하고 추가 요청을 막는다', () => {
    const onLoadMore = vi.fn();
    const {rerender} = render(<List onLoadMore={onLoadMore}/>);
    rerender(<List hasMore={false} onLoadMore={onLoadMore}/>);
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    act(() => observers[0].notify(true));
    expect(onLoadMore).not.toHaveBeenCalled();
  });
});
