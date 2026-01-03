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

  useEffect(() => {
    // 기존 observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // IntersectionObserver 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        // 요소가 화면에 보이고, 더 로드할 데이터가 있으며, 현재 로딩 중이 아닐 때 로드
        if (firstEntry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold,
        rootMargin
      }
    );

    // loadMoreRef 요소 관찰 시작
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    // cleanup 함수
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold, rootMargin]);

  return {
    scrollContainerRef,
    loadMoreRef
  };
};

export default useInfiniteScroll;
