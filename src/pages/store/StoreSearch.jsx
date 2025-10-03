import { useEffect, useCallback, useState } from 'react';
import StoreDetailModal from './StoreDetailModal';
import UserDetailModal from '../user/UserDetailModal';
import { STORE_SEARCH_TYPES, STORE_TYPE } from '../../types/store';
import useSearch from '../../hooks/useSearch';
import { storeSearchAdapter } from '../../adapters/storeSearchAdapter';
import SearchResults from '../../components/common/SearchResults';
import StoreCard from '../../components/store/StoreCard';

const StoreSearch = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedStoreTypes, setSelectedStoreTypes] = useState([]);

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
    handleScroll,
    resetSearch,
    setResults
  } = useSearch({
    validateSearch: storeSearchAdapter.validateSearch,
    searchFunction: (params) => storeSearchAdapter.searchFunction({
      ...params,
      targetStores: selectedStoreTypes.length > 0 ? selectedStoreTypes : null
    }),
    errorMessage: storeSearchAdapter.errorMessage,
    autoSearchTypes: [STORE_SEARCH_TYPES.RECENT] // 최신순 조회시 자동 검색
  });

  // 초기 검색 타입 설정 (기본값: 최신순)
  useEffect(() => {
    setSearchType(STORE_SEARCH_TYPES.RECENT);
  }, [setSearchType]);

  // 가게 타입 필터 변경 핸들러
  const handleStoreTypeToggle = useCallback((storeType) => {
    setSelectedStoreTypes(prev => {
      if (prev.includes(storeType)) {
        return prev.filter(type => type !== storeType);
      } else {
        return [...prev, storeType];
      }
    });
  }, []);

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

  // 가게 타입 필터가 변경되면 검색 재실행
  useEffect(() => {
    if (searchType) {
      resetSearch();
      handleSearch(true);
    }
  }, [selectedStoreTypes]);


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


  // 가게 삭제 핸들러 (모달에서 삭제 후 목록 업데이트)
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
    <div className="container-fluid px-2 px-md-4 py-3 py-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold">가게 검색</h2>
      </div>

      {/* 단순화된 검색 폼 */}
      <div className="card border-0 shadow-sm mb-3 mb-md-4">
        <div className="card-body p-3 p-md-4">
          <div className="row align-items-end g-2 g-md-3">
            <div className="col-12 col-md-8 col-lg-9 mb-2 mb-md-0">
              <label htmlFor="searchInput" className="form-label fw-semibold text-muted mb-2 d-none d-md-block">
                <i className="bi bi-search me-2"></i>
                가게 검색
              </label>
              <input
                id="searchInput"
                type="text"
                className="form-control form-control-lg border-0 shadow-sm"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  fontSize: '15px'
                }}
                placeholder="🔍 가게 이름 입력 (비워두면 최신순)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isComposing) {
                    handleSearchSubmit();
                  }
                }}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e) => {
                  setIsComposing(false);
                  setSearchQuery(e.target.value);
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.boxShadow = '0 0 15px rgba(102, 126, 234, 0.3)';
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
                className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm"
                onClick={handleSearchSubmit}
                disabled={isSearching}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '12px 16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSearching) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
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
                    <span className="d-none d-sm-inline">검색 중...</span>
                    <span className="d-inline d-sm-none">검색중</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    <span className="d-none d-sm-inline">검색</span>
                    <span className="d-inline d-sm-none">검색</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 가게 타입 필터 */}
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <small className="text-muted fw-semibold me-3">
                <i className="bi bi-funnel me-1"></i>
                가게 종류:
              </small>
              <button
                type="button"
                className={`btn btn-sm rounded-pill ${
                  selectedStoreTypes.includes(STORE_TYPE.USER_STORE)
                    ? 'btn-info text-white'
                    : 'btn-outline-info'
                }`}
                onClick={() => handleStoreTypeToggle(STORE_TYPE.USER_STORE)}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  border: '1px solid #17a2b8',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="bi bi-people-fill me-1"></i>
                일반 가게
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill ${
                  selectedStoreTypes.includes(STORE_TYPE.BOSS_STORE)
                    ? 'btn-warning text-dark'
                    : 'btn-outline-warning'
                }`}
                onClick={() => handleStoreTypeToggle(STORE_TYPE.BOSS_STORE)}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  border: '1px solid #ffc107',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="bi bi-person-badge-fill me-1"></i>
                사장님 직영점
              </button>
              {selectedStoreTypes.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill"
                  onClick={() => setSelectedStoreTypes([])}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px'
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  전체
                </button>
              )}
            </div>
          </div>

          {/* 현재 검색 상태 표시 */}
          <div className="mt-2 mt-md-3">
            <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
              <i className={`bi ${searchQuery.trim() ? 'bi-search' : 'bi-clock-history'} me-2`}></i>
              <span className="d-none d-md-inline">
                {searchQuery.trim()
                  ? `키워드 검색: "${searchQuery.trim()}"`
                  : '최신순으로 가게를 조회합니다'
                }
                {selectedStoreTypes.length > 0 && (
                  <span className="ms-2 text-primary">
                    | 필터: {selectedStoreTypes.map(type =>
                      type === STORE_TYPE.USER_STORE ? '일반' : '사장님'
                    ).join(', ')}
                  </span>
                )}
              </span>
              <span className="d-inline d-md-none">
                {searchQuery.trim()
                  ? `키워드: "${searchQuery.trim()}"`
                  : '최신순 조회'
                }
                {selectedStoreTypes.length > 0 && (
                  <span className="ms-1 text-primary">
                    | {selectedStoreTypes.length}개 필터
                  </span>
                )}
              </span>
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
