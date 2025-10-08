import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useSearch = ({
  validateSearch,
  searchFunction,
  resetFunction,
  errorMessage = '검색 중 오류가 발생했습니다.',
  autoSearchTypes = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [additionalParams, setAdditionalParams] = useState({});
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const scrollContainerRef = useRef(null);
  const isLoadingMore = useRef(false);
  const lastScrollTime = useRef(0);
  const hasAutoSearched = useRef(null);

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
      const validationError = validateSearch(searchType, searchQuery, additionalParams);
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
        searchType,
        searchQuery,
        additionalParams,
        cursor: reset ? null : nextCursor,
        reset
      });

      if (!response?.ok) {
        throw new Error('Search failed');
      }

      const { results: newResults, hasMore: newHasMore, nextCursor: newNextCursor } = response.data;

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
    if (searchType && autoSearchTypes.includes(searchType)) {
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
  const handleScroll = useCallback((e) => {
    const now = Date.now();

    // 디바운싱 - 300ms 이내 중복 호출 방지
    if (now - lastScrollTime.current < 300) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = e.target;

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
  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // 키보드 이벤트 처리
  const handleKeyPress = useCallback((e) => {
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