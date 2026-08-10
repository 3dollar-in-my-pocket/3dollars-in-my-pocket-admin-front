import {useCallback, useEffect, useState} from 'react';
import type {ActivityAuthor} from '@/types/domain';
import StoreDetailModal from './StoreDetailModal';
import UserDetailModal from '@/pages/user/UserDetailModal';
import {SimpleStore, STORE_SEARCH_TYPES, STORE_TYPE, StoreType} from '@/types/store';
import useSearch from '@/hooks/useSearch';
import {storeSearchAdapter} from '@/adapters/storeSearchAdapter';
import SearchResults from '@/components/common/SearchResults';
import StoreCard from '@/components/store/StoreCard';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';

/** 삭제 처리 후 목록에서 표시하기 위해 클라이언트가 isDeleted를 덧붙입니다. */
type SearchedStore = SimpleStore & { isDeleted?: boolean };

const SEARCH_TYPE_OPTIONS = [
  {value: STORE_SEARCH_TYPES.RECENT, label: '최신순 조회', icon: 'bi-clock-history'},
  {value: STORE_SEARCH_TYPES.KEYWORD, label: '가게 이름', icon: 'bi-search'},
  {value: STORE_SEARCH_TYPES.STORE_ID, label: '가게 ID', icon: 'bi-hash'}
];

const STORE_TYPE_OPTIONS = [
  {value: STORE_TYPE.USER_STORE, label: '일반 가게', icon: 'bi-people-fill'},
  {value: STORE_TYPE.BOSS_STORE, label: '사장님 직영점', icon: 'bi-person-badge-fill'}
];

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
    resetFunction: null,
    errorMessage: storeSearchAdapter.errorMessage,
    autoSearchTypes: [STORE_SEARCH_TYPES.RECENT] // 최신순 조회시 자동 검색
  });

  // 초기 검색 타입 설정 (기본값: 최신순)
  useEffect(() => {
    setSearchType(STORE_SEARCH_TYPES.RECENT);
  }, [setSearchType]);

  // 가게 타입 필터 변경 핸들러
  const handleStoreTypeToggle = useCallback((storeType: StoreType) => {
    setSelectedStoreTypes(prev => {
      if (prev.includes(storeType)) {
        return prev.filter(type => type !== storeType);
      } else {
        return [...prev, storeType];
      }
    });
  }, []);

  // 검색 실행 핸들러
  const handleSearchSubmit = useCallback(() => {
    // 검색 타입에 따라 검색 실행
    if (searchType === STORE_SEARCH_TYPES.KEYWORD || searchType === STORE_SEARCH_TYPES.STORE_ID) {
      // 키워드 또는 ID 검색인 경우 수동으로 검색 실행
      handleSearch(true);
    }
    // 최신순 조회는 자동 검색이므로 여기서는 별도 처리 불필요
  }, [searchType, handleSearch]);

  // 가게 타입 필터가 변경되면 검색 재실행
  useEffect(() => {
    if (searchType) {
      resetSearch();
      handleSearch(true);
    }
  }, [selectedStoreTypes]);


  const renderStoreCard = (store: SearchedStore) => (
    <StoreCard
      key={store.storeId}
      store={store}
      onClick={handleStoreClick}
      isDeleted={store.isDeleted}
    />
  );

  // 작성자 클릭 핸들러
  const handleAuthorClick = (writer: ActivityAuthor) => {
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
  const handleStoreDeleted = useCallback((deletedStoreId: number) => {
    // 결과 목록에서 해당 가게를 삭제 상태로 표시
    const updatedResults = storeList.map(store =>
      store.storeId === deletedStoreId
        ? {...store, isDeleted: true}
        : store
    );

    // setResults를 사용하여 상태 업데이트
    setResults(updatedResults);
  }, [storeList, setResults]);

  const isRecentSearch = searchType === STORE_SEARCH_TYPES.RECENT;

  return (
    <div>
      <PageHeader description="가게 이름·ID로 검색하거나 최신 등록순으로 조회합니다."/>

      <FilterCard>
        <div className="row g-3">
          <div className="col-12">
            <span className="form-label d-block">검색 방식</span>
            <div className="filter-chips">
              {SEARCH_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-chip ${searchType === option.value ? 'filter-chip--active' : ''}`}
                  onClick={() => {
                    resetSearch();
                    setSearchType(option.value);
                  }}
                >
                  <i className={`bi ${option.icon} me-1`}/>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-md">
            <label className="form-label" htmlFor="store-search-query">
              {isRecentSearch ? '최신순 조회' : searchType === STORE_SEARCH_TYPES.STORE_ID ? '가게 ID' : '가게 이름'}
            </label>
            <input
              id="store-search-query"
              type="text"
              className="form-control"
              placeholder={
                searchType === STORE_SEARCH_TYPES.STORE_ID
                  ? '가게 ID를 쉼표로 구분해 입력하세요 (최대 5개)'
                  : isRecentSearch
                    ? '최신순 조회에는 검색어가 필요하지 않습니다'
                    : '가게 이름을 입력하세요'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isComposing) {
                  handleSearchSubmit();
                }
              }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={(e: any) => {
                setIsComposing(false);
                setSearchQuery(e.target.value);
              }}
              disabled={isRecentSearch}
            />
          </div>

          <div className="col-12 col-md-auto d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              onClick={handleSearchSubmit}
              disabled={isSearching || isRecentSearch}
            >
              {isSearching ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                  검색 중...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-1"/>
                  검색
                </>
              )}
            </button>
          </div>

          {/* 가게 타입 필터 (가게 ID 검색이 아닐 때만 표시) */}
          {searchType !== STORE_SEARCH_TYPES.STORE_ID && (
            <div className="col-12">
              <span className="form-label d-block">가게 종류</span>
              <div className="filter-chips">
                <button
                  type="button"
                  className={`filter-chip ${selectedStoreTypes.length === 0 ? 'filter-chip--active' : ''}`}
                  onClick={() => setSelectedStoreTypes([])}
                >
                  전체
                </button>
                {STORE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`filter-chip ${selectedStoreTypes.includes(option.value) ? 'filter-chip--active' : ''}`}
                    onClick={() => handleStoreTypeToggle(option.value)}
                  >
                    <i className={`bi ${option.icon} me-1`}/>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </FilterCard>

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
        onStoreClick={() => {
        }}
      />
    </div>
  );
};

export default StoreSearch;
