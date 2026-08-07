import React, {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';

/**
 * searchFunction에 전달되는 검색 파라미터
 *
 * searchType은 도메인마다 고유한 문자열 리터럴 유니온(StoreSearchType 등)이므로
 * 훅 내부에서는 string으로 다루되, 호출부의 좁은 시그니처도 받을 수 있도록
 * SearchType 파라미터로 열어둡니다.
 */
export interface SearchFunctionParams<SearchType extends string = string> {
  searchType: SearchType;
  searchQuery: string;
  /** 도메인별 추가 검색 조건 (예: targetStores) — 호출부마다 형태가 달라 any로 둡니다 */
  additionalParams: Record<string, any>;
  cursor: string | null;
  reset: boolean;
}

/** searchFunction이 반환해야 하는 응답 형태 */
export interface SearchFunctionResponse<T> {
  ok: boolean;
  data: {
    results: T[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface UseSearchConfig<T, SearchType extends string = string> {
  /**
   * 검증 실패 시 에러 메시지를 반환, 통과 시 null
   *
   * 호출부(어댑터)는 searchType을 좁은 유니온으로 선언하고 인자를 일부만 받으므로
   * 파라미터 개수/타입을 느슨하게 받도록 선언합니다.
   */
  validateSearch?: (
    searchType: SearchType,
    searchQuery: string,
    additionalParams: Record<string, any>
  ) => string | null | undefined;
  searchFunction: (params: SearchFunctionParams<SearchType>) => Promise<SearchFunctionResponse<T>>;
  /** 검색 초기화 시 호출부에서 추가로 정리할 로직 (없으면 null) */
  resetFunction?: (() => void) | null;
  errorMessage?: string;
  /** 선택 시 자동으로 검색을 실행할 searchType 목록 */
  autoSearchTypes?: SearchType[];
}

export const useSearch = <T = any, SearchType extends string = string>({
                                                                         validateSearch,
                                                                         searchFunction,
                                                                         resetFunction,
                                                                         errorMessage = '검색 중 오류가 발생했습니다.',
                                                                         autoSearchTypes = []
                                                                       }: UseSearchConfig<T, SearchType>) => {
  const [searchQuery, setSearchQuery] = useState('');
  // searchType은 SearchForm 등 공용 컴포넌트가 string으로 다루므로 string으로 유지하고,
  // 좁은 유니온을 요구하는 어댑터 호출 시점에만 단언합니다.
  const [searchType, setSearchType] = useState<string>('');
  const [additionalParams, setAdditionalParams] = useState<Record<string, any>>({});
  const [results, setResults] = useState<T[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMore = useRef(false);
  const lastScrollTime = useRef(0);
  const hasAutoSearched = useRef<string | null>(null);

  // 검색 실행
  const handleSearch = useCallback(async (reset = true) => {
    // 더보기 요청인데 이미 로딩중이면 중복 요청 방지
    if (!reset && (isLoading || isLoadingMore.current)) {
      return;
    }

    // 더보기 요청인데 더 이상 데이터가 없으면 요청 차단
    if (!reset && (!hasMore || !nextCursor)) {
      return;
    }

    // 검증 함수가 있으면 검증 실행
    if (validateSearch) {
      const validationError = validateSearch(searchType as SearchType, searchQuery, additionalParams);
      if (validationError) {
        toast(validationError);
        return;
      }
    }

    if (!reset) {
      isLoadingMore.current = true;
    }
    setIsSearching(true);
    setIsLoading(true);

    try {
      const response = await searchFunction({
        searchType: searchType as SearchType,
        searchQuery,
        additionalParams,
        cursor: reset ? null : nextCursor,
        reset
      });

      if (!response?.ok) {
        throw new Error('Search failed');
      }

      const {results: newResults, hasMore: newHasMore, nextCursor: newNextCursor} = response.data;

      if (reset) {
        setResults(newResults || []);
      } else {
        setResults(prev => [...prev, ...(newResults || [])]);
      }

      setHasMore(Boolean(newHasMore));
      setNextCursor(newNextCursor || null);
    } catch (error) {
      toast.error(errorMessage);
      if (reset) {
        setResults([]);
        setHasMore(false);
        setNextCursor(null);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      isLoadingMore.current = false;
    }
  }, [searchType, searchQuery, additionalParams, nextCursor, hasMore, validateSearch, searchFunction, errorMessage]);

  // 더 보기
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      handleSearch(false);
    }
  }, [hasMore, isLoading, handleSearch]);

  // searchType 변경 시 자동 검색 (autoSearchTypes에 포함된 타입인 경우)
  useEffect(() => {
    if (searchType && autoSearchTypes.includes(searchType as SearchType)) {
      // 중복 자동 검색 방지
      const searchKey = `${searchType}-${autoSearchTypes.join(',')}`;
      if (!hasAutoSearched.current || hasAutoSearched.current !== searchKey) {
        hasAutoSearched.current = searchKey;
        handleSearch(true);
      }
    }
  }, [searchType, autoSearchTypes]); // handleSearch 제거로 무한루프 방지

  // searchType이나 autoSearchTypes가 변경되면 자동검색 플래그 리셋
  useEffect(() => {
    hasAutoSearched.current = null;
  }, [searchType]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const now = Date.now();

    // 디바운싱 - 300ms 이내 중복 호출 방지
    if (now - lastScrollTime.current < 300) {
      return;
    }

    const {scrollTop, scrollHeight, clientHeight} = e.currentTarget;

    // 스크롤이 하단 95% 지점에 도달했을 때 다음 페이지 로드 (더 보수적으로 변경)
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    const shouldLoadMore = scrollPercentage >= 0.95;

    // 더 엄격한 조건 체크
    if (shouldLoadMore && hasMore && !isLoading && !isLoadingMore.current && nextCursor) {
      lastScrollTime.current = now;
      handleSearch(false);
    }
  }, [hasMore, isLoading, nextCursor, handleSearch]);

  // 아이템 선택
  const handleItemClick = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // 키보드 이벤트 처리
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSearch(true);
    }
  }, [handleSearch]);

  // 검색 상태 초기화
  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setSelectedItem(null);
    setIsLoading(false);
    setHasMore(false);
    setNextCursor(null);
    setIsSearching(false);
    isLoadingMore.current = false;
    lastScrollTime.current = 0;
    if (resetFunction) {
      resetFunction();
    }
  }, [resetFunction]);

  return {
    // State
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    additionalParams,
    setAdditionalParams,
    results,
    setResults,
    selectedItem,
    setSelectedItem,
    isLoading,
    hasMore,
    nextCursor,
    isSearching,
    scrollContainerRef,

    // Actions
    handleSearch,
    handleLoadMore,
    handleItemClick,
    handleCloseModal,
    handleKeyPress,
    handleScroll,
    resetSearch
  };
};

export default useSearch;
