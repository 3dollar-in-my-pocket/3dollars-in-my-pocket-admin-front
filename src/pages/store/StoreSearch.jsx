import { useEffect, useCallback, useState } from 'react';
import StoreDetailModal from './StoreDetailModal';
import UserDetailModal from '../user/UserDetailModal';
import { STORE_SEARCH_TYPES } from '../../types/store';
import useSearch from '../../hooks/useSearch';
import { storeSearchAdapter } from '../../adapters/storeSearchAdapter';
import SearchForm from '../../components/common/SearchForm';
import SearchResults from '../../components/common/SearchResults';
import StoreCard from '../../components/store/StoreCard';

const StoreSearch = () => {
  const [selectedUser, setSelectedUser] = useState(null);

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
    handleScroll,
    resetSearch,
    setResults
  } = useSearch({
    validateSearch: storeSearchAdapter.validateSearch,
    searchFunction: storeSearchAdapter.searchFunction,
    errorMessage: storeSearchAdapter.errorMessage,
    autoSearchTypes: [] // 자동 검색 비활성화
  });

  // 초기 검색 타입 설정
  useEffect(() => {
    setSearchType(storeSearchAdapter.defaultSearchType);
  }, [setSearchType]);

  // 검색 타입 변경 핸들러
  const handleSearchTypeChange = useCallback((newSearchType) => {
    if (searchType !== newSearchType) {
      resetSearch(); // 이전 검색 결과 초기화
      setSearchType(newSearchType);
    }
  }, [searchType, setSearchType, resetSearch]);

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
    <StoreCard
      key={store.storeId}
      store={store}
      onClick={handleStoreClick}
      isDeleted={store.isDeleted}
    />
  );

  // 작성자 클릭 핸들러
  const handleAuthorClick = (writer) => {
    // writer, owner, visitor, reporter 등 다양한 객체 구조 지원
    const userId = writer.userId || writer.writerId || writer.id;
    const userName = writer.name || writer.nickname;

    if (userId) {
      const userForModal = {
        userId: userId,
        nickname: userName || `ID: ${userId}`
      };
      setSelectedUser(userForModal);
    }
  };

  // 유저 모달 닫기 핸들러
  const handleCloseUserModal = () => {
    setSelectedUser(null);
  };

  // 가게 삭제 핸들러
  const handleStoreDeleted = useCallback((deletedStoreId) => {
    // 결과 목록에서 해당 가게를 삭제 상태로 표시
    const updatedResults = storeList.map(store =>
      store.storeId === deletedStoreId
        ? { ...store, isDeleted: true }
        : store
    );

    // setResults를 사용하여 상태 업데이트
    setResults(updatedResults);
  }, [storeList, setResults]);

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h2 className="fw-bold">가게 검색</h2>
      </div>

      <SearchForm
        searchType={searchType}
        setSearchType={handleSearchTypeChange}
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
        onAuthorClick={handleAuthorClick}
        onStoreDeleted={handleStoreDeleted}
      />

      {/* 유저 상세 모달 */}
      <UserDetailModal
        show={!!selectedUser}
        onHide={handleCloseUserModal}
        user={selectedUser}
      />
    </div>
  );
};

export default StoreSearch;
