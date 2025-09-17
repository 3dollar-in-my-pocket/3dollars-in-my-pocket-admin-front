import { useEffect } from 'react';
import StoreDetailModal from './StoreDetailModal';
import { STORE_SEARCH_TYPES } from '../../types/store';
import useSearch from '../../hooks/useSearch';
import { storeSearchAdapter } from '../../adapters/storeSearchAdapter';
import SearchHeader from '../../components/common/SearchHeader';
import SearchForm from '../../components/common/SearchForm';
import SearchResults from '../../components/common/SearchResults';
import StoreCard from '../../components/store/StoreCard';

const StoreSearch = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    results: storeList,
    selectedItem: selectedStore,
    isLoading,
    hasMore,
    isSearching,
    scrollContainerRef,
    handleSearch,
    handleItemClick: handleStoreClick,
    handleCloseModal,
    handleKeyPress,
    handleScroll
  } = useSearch({
    validateSearch: storeSearchAdapter.validateSearch,
    searchFunction: storeSearchAdapter.searchFunction,
    errorMessage: storeSearchAdapter.errorMessage
  });

  // 초기 검색 타입 설정
  useEffect(() => {
    setSearchType(storeSearchAdapter.defaultSearchType);
  }, [setSearchType]);

  const renderCustomInputs = ({ searchType, searchQuery, handleSearchQueryChange, onKeyPress }) => {
    if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
      return (
        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '15px',
            padding: '15px 20px',
            border: '2px solid transparent',
            transition: 'all 0.3s ease',
            fontSize: '16px'
          }}
          placeholder="🔍 가게 이름을 입력하세요"
          value={searchQuery}
          onChange={handleSearchQueryChange}
          onKeyPress={onKeyPress}
          onFocus={(e) => {
            e.target.style.border = '2px solid #667eea';
            e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)';
            e.target.style.backgroundColor = '#ffffff';
          }}
          onBlur={(e) => {
            e.target.style.border = '2px solid transparent';
            e.target.style.boxShadow = 'none';
            e.target.style.backgroundColor = '#f8f9fa';
          }}
        />
      );
    } else {
      return (
        <div className="form-control form-control-lg border-0 shadow-sm d-flex align-items-center"
             style={{
               backgroundColor: '#f8f9fa',
               borderRadius: '15px',
               padding: '15px 20px',
               color: '#6c757d',
               fontSize: '16px',
               border: '2px solid #e9ecef'
             }}>
          <i className="bi bi-clock-history me-2 text-info"></i>
          최신순으로 가게를 조회합니다
        </div>
      );
    }
  };

  const renderStoreCard = (store) => (
    <StoreCard key={store.storeId} store={store} onClick={handleStoreClick} />
  );

  return (
    <div className="container-fluid px-4 py-4" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh'}}>
      <SearchHeader
        title="가게 검색 & 관리"
        description="가게를 검색하고 상세 정보를 관리하세요"
        icon="bi-shop"
      />

      <SearchForm
        searchType={searchType}
        setSearchType={setSearchType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOptions={storeSearchAdapter.searchOptions}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress}
        isSearching={isSearching}
        customInputs={renderCustomInputs}
      />

      <SearchResults
        results={storeList}
        isLoading={isLoading}
        hasMore={hasMore}
        scrollContainerRef={scrollContainerRef}
        onScroll={handleScroll}
        renderItem={renderStoreCard}
        emptyMessage="검색 결과가 없습니다"
        emptyDescription="다른 검색어로 시도해보시거나 검색 조건을 변경해보세요"
        loadingMessage={searchType === STORE_SEARCH_TYPES.KEYWORD ? '검색 중입니다' : '조회 중입니다'}
        title="가게 검색 결과"
      />

      <StoreDetailModal
        show={!!selectedStore}
        onHide={handleCloseModal}
        store={selectedStore}
      />
    </div>
  );
};

export default StoreSearch;
