import {useCallback, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import useScrollPagination from './useScrollPagination';

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
  errorMessage?: string;
}

/**
 * 검색 + 커서 페이지네이션 훅
 *
 * 검색어/검색 타입/검증이 필요한 화면에서 사용합니다.
 * 검색 조건 없이 목록만 조회하는 화면은 `useCursorPagination`을 사용하세요.
 */
export const useSearch = <T = any, SearchType extends string = string>({
                                                                         validateSearch,
                                                                         searchFunction,
                                                                         errorMessage = '검색 중 오류가 발생했습니다.'
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

  // 커서와 진행 상태는 콜백 재생성을 막기 위해 ref로 관리합니다.
  const cursorRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  // 검색 실행
  const handleSearch = useCallback(async (reset = true) => {
    // 중복 호출 방지
    if (isFetchingRef.current) return;

    // 더보기 요청인데 더 이상 데이터가 없으면 요청 차단
    if (!reset && !cursorRef.current) return;

    // 검증 함수가 있으면 검증 실행
    if (validateSearch) {
      const validationError = validateSearch(searchType as SearchType, searchQuery, additionalParams);
      if (validationError) {
        toast(validationError);
        return;
      }
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const response = await searchFunction({
        searchType: searchType as SearchType,
        searchQuery,
        additionalParams,
        cursor: reset ? null : cursorRef.current,
        reset
      });

      if (!response?.ok) {
        throw new Error('Search failed');
      }

      const {results: newResults, hasMore: newHasMore, nextCursor} = response.data;

      setResults(prev => (reset ? (newResults || []) : [...prev, ...(newResults || [])]));
      setHasMore(Boolean(newHasMore));
      cursorRef.current = nextCursor || null;
    } catch (error) {
      toast.error(errorMessage);
      if (reset) {
        setResults([]);
        setHasMore(false);
        cursorRef.current = null;
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [searchType, searchQuery, additionalParams, validateSearch, searchFunction, errorMessage]);

  // 더 보기
  const handleLoadMore = useCallback(() => {
    handleSearch(false);
  }, [handleSearch]);

  const {scrollContainerRef, handleScroll} = useScrollPagination({
    hasMore,
    isLoading,
    onLoadMore: handleLoadMore
  });

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
    setHasMore(false);
    cursorRef.current = null;
  }, []);

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
    isLoading,
    hasMore,
    /** @deprecated isLoading과 동일합니다. isLoading을 사용하세요. */
    isSearching: isLoading,
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
