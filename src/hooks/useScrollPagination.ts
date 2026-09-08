import React, {useCallback, useRef} from 'react';

/** 하단에서 다음 페이지를 불러오기 시작할 스크롤 비율 */
const LOAD_MORE_THRESHOLD = 0.95;

/** 스크롤 이벤트 연속 발생으로 중복 호출되는 것을 막는 간격 (ms) */
const SCROLL_DEBOUNCE_MS = 300;

export interface UseScrollPaginationConfig {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

/**
 * 스크롤 컨테이너의 onScroll 기반 더보기 훅
 *
 * `SearchResults`처럼 스크롤 컨테이너를 직접 렌더링하는 컴포넌트와 함께 사용합니다.
 * 감지용 sentinel 요소를 둘 수 있는 화면이라면 IntersectionObserver 기반의
 * `useInfiniteScroll`을 사용하세요.
 */
export const useScrollPagination = ({hasMore, isLoading, onLoadMore}: UseScrollPaginationConfig) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastLoadTime = useRef(0);

  // 최신 값을 ref로 유지해 handleScroll의 참조를 안정화합니다.
  // 하위 컴포넌트가 handleScroll을 메모이제이션해도 낡은 hasMore/isLoading을 보지 않습니다.
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);
  hasMoreRef.current = hasMore;
  isLoadingRef.current = isLoading;
  onLoadMoreRef.current = onLoadMore;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    if (!hasMoreRef.current || isLoadingRef.current) return;

    const now = Date.now();
    if (now - lastLoadTime.current < SCROLL_DEBOUNCE_MS) return;

    const {scrollTop, scrollHeight, clientHeight} = event.currentTarget;
    if (scrollHeight <= clientHeight) return;

    const scrollRatio = (scrollTop + clientHeight) / scrollHeight;
    if (scrollRatio < LOAD_MORE_THRESHOLD) return;

    lastLoadTime.current = now;
    onLoadMoreRef.current();
  }, []);

  return {scrollContainerRef, handleScroll};
};

export default useScrollPagination;
