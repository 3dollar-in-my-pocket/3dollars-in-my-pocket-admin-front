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
    autoSearchTypes: [STORE_SEARCH_TYPES.RECENT] // 최신순 조회시 자동 검색
  });

  // 초기 검색 타입 설정 (기본값: 최신순)
  useEffect(() => {
    setSearchType(STORE_SEARCH_TYPES.RECENT);
  }, [setSearchType]);

  // 검색 실행 핸들러 (키워드 입력 여부에 따라 검색 타입 자동 결정)
  const handleSearchSubmit = useCallback(() => {
    const trimmedQuery = searchQuery.trim();
    const newSearchType = trimmedQuery ? STORE_SEARCH_TYPES.KEYWORD : STORE_SEARCH_TYPES.RECENT;

    // 검색 타입이 변경되었거나 키워드 검색인 경우 검색 실행
    if (searchType !== newSearchType) {
      resetSearch();
      setSearchType(newSearchType);
    } else if (newSearchType === STORE_SEARCH_TYPES.KEYWORD) {
      // 키워드 검색인 경우 수동으로 검색 실행
      handleSearch(true);
    }
  }, [searchQuery, searchType, setSearchType, resetSearch, handleSearch]);

  // 키보드 이벤트 핸들러 (Enter 키 처리)
  const handleKeyPressCustom = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

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

      {/* 단순화된 검색 폼 */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-end">
            <div className="col-12 col-md-8 col-lg-9 mb-3 mb-md-0">
              <label htmlFor="searchInput" className="form-label fw-semibold text-muted mb-2">
                <i className="bi bi-search me-2"></i>
                가게 검색
              </label>
              <input
                id="searchInput"
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
                placeholder="🔍 가게 이름을 입력하세요 (비워두면 최신순으로 조회)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPressCustom}
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
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <button
                className="btn btn-primary btn-lg w-100 rounded-pill py-3 shadow-sm"
                onClick={handleSearchSubmit}
                disabled={isSearching}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSearching) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
              >
                {isSearching ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    검색 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    검색
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 현재 검색 상태 표시 */}
          <div className="mt-3">
            <small className="text-muted d-flex align-items-center">
              <i className={`bi ${searchQuery.trim() ? 'bi-search' : 'bi-clock-history'} me-2`}></i>
              {searchQuery.trim()
                ? `키워드 검색: "${searchQuery.trim()}"`
                : '최신순으로 가게를 조회합니다'
              }
            </small>
          </div>
        </div>
      </div>

      <SearchResults
        results={storeList}
        isLoading={isLoading}
        hasMore={hasMore}
        scrollContainerRef={scrollContainerRef}
        onScroll={handleScroll}
        renderItem={renderStoreCard}
        emptyMessage="검색 결과가 없습니다"
        emptyDescription="다른 검색어로 시도해보시거나 검색 조건을 변경해보세요"
        loadingMessage={searchQuery.trim() ? '검색 중입니다' : '조회 중입니다'}
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
