import { useEffect, useRef } from 'react';
import { InfiniteScrollConfig } from '../types/common';

/**
 * Infinite Scroll Hook
 * IntersectionObserver를 사용하여 스크롤 하단 도달 시 자동으로 다음 페이지를 로드합니다.
 *
 * @param hasMore - 더 로드할 데이터가 있는지 여부
 * @param isLoading - 현재 로딩 중인지 여부
 * @param onLoadMore - 다음 페이지 로드 함수
 * @param threshold - Intersection 감지 threshold (기본값: 0.1)
 * @param rootMargin - IntersectionObserver rootMargin (기본값: undefined)
 *
 * @returns scrollContainerRef - 스크롤 컨테이너에 연결할 ref
 * @returns loadMoreRef - 감지 대상 요소에 연결할 ref
 */
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin
}: InfiniteScrollConfig) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 모든 동적 값을 ref로 관리하여 Observer 재생성 방지
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);

  // 최신 값으로 ref 업데이트
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // IntersectionObserver 초기화 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    // IntersectionObserver 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        // 요소가 화면에 보이고, 더 로드할 데이터가 있으며, 현재 로딩 중이 아닐 때 로드
        // ref를 통해 항상 최신 값 확인
        if (firstEntry.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          onLoadMoreRef.current();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold,
        rootMargin
      }
    );

    // cleanup 함수
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // loadMoreRef 요소 관찰 (요소가 DOM에 추가/제거될 때마다 재관찰)
  useEffect(() => {
    const observer = observerRef.current;
    const target = loadMoreRef.current;

    if (observer && target) {
      observer.observe(target);

      return () => {
        observer.unobserve(target);
      };
    }
  }, [hasMore]); // hasMore 변경 시 loadMoreRef 요소가 DOM에 추가/제거되므로 재관찰

  return {
    scrollContainerRef,
    loadMoreRef
  };
};

export default useInfiniteScroll;
