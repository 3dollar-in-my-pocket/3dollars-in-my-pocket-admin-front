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

  // 검색 실행
  const handleSearch = useCallback(async (reset = true) => {
    // 검증 함수가 있으면 검증 실행
    if (validateSearch) {
      const validationError = validateSearch(searchType, searchQuery, additionalParams);
      if (validationError) {
        toast(validationError);
        return;
      }
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

      setHasMore(newHasMore || false);
      setNextCursor(newNextCursor || null);
    } catch (error) {
      console.error('Search error:', error);
      toast.error(errorMessage);
      if (reset) {
        setResults([]);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [searchType, searchQuery, additionalParams, nextCursor, validateSearch, searchFunction, errorMessage]);

  // 더 보기
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      handleSearch(false);
    }
  }, [hasMore, isLoading, handleSearch]);

  // searchType 변경 시 자동 검색 (autoSearchTypes에 포함된 타입인 경우)
  useEffect(() => {
    if (searchType && autoSearchTypes.includes(searchType)) {
      handleSearch(true);
    }
  }, [searchType, autoSearchTypes, handleSearch]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading, handleLoadMore]);

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