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

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    if (!hasMore || isLoading) return;

    const now = Date.now();
    if (now - lastLoadTime.current < SCROLL_DEBOUNCE_MS) return;

    const {scrollTop, scrollHeight, clientHeight} = event.currentTarget;
    if (scrollHeight <= clientHeight) return;

    const scrollRatio = (scrollTop + clientHeight) / scrollHeight;
    if (scrollRatio < LOAD_MORE_THRESHOLD) return;

    lastLoadTime.current = now;
    onLoadMore();
  }, [hasMore, isLoading, onLoadMore]);

  return {scrollContainerRef, handleScroll};
};

export default useScrollPagination;
