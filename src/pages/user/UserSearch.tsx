import { useEffect, useState } from 'react';
import UserDetailModal from './UserDetailModal';
import StoreDetailModal from '../store/StoreDetailModal';
import { SEARCH_TYPES } from '../../types/user';
import useSearch from '../../hooks/useSearch';
import { userSearchAdapter } from '../../adapters/userSearchAdapter';
import SearchForm from '../../components/common/SearchForm';
import SearchResults from '../../components/common/SearchResults';
import UserCard from '../../components/user/UserCard';

const UserSearch = () => {
  const [selectedStore, setSelectedStore] = useState(null);

  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    additionalParams,
    setAdditionalParams,
    results: userList,
    selectedItem: selectedUser,
    isLoading,
    hasMore,
    isSearching,
    scrollContainerRef,
    handleSearch,
    handleItemClick: handleUserClick,
    handleCloseModal,
    handleKeyPress,
    handleScroll
  } = useSearch({
    validateSearch: userSearchAdapter.validateSearch,
    searchFunction: userSearchAdapter.searchFunction,
    resetFunction: null,
    errorMessage: userSearchAdapter.errorMessage
  });

  // 초기 검색 타입 설정
  useEffect(() => {
    setSearchType(userSearchAdapter.defaultSearchType);
  }, [setSearchType]);

  const renderCustomInputs = ({ searchType, searchQuery, handleSearchQueryChange, additionalParams, handleAdditionalParamChange, onKeyPress }) => {
    if (searchType === SEARCH_TYPES.NAME) {
      return (
        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm"
          style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px'}}
          placeholder="닉네임을 입력하세요"
          value={searchQuery}
          onChange={handleSearchQueryChange}
          onKeyPress={onKeyPress}
          onCompositionEnd={(e: any) => {
            setSearchQuery(e.target.value);
          }}
        />
      );
    } else {
      return (
        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm"
          style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px'}}
          placeholder="1, 2, 3"
          value={additionalParams.userIds || ''}
          onChange={(e) => handleAdditionalParamChange('userIds', e.target.value)}
          onKeyPress={onKeyPress}
          onCompositionEnd={(e: any) => {
            handleAdditionalParamChange('userIds', e.target.value);
          }}
        />
      );
    }
  };

  const renderUserCard = (user) => (
    <UserCard key={user.userId} user={user} onClick={handleUserClick} />
  );

  // 가게 클릭 핸들러
  const handleStoreClick = (store) => {
    if (store && store.storeId) {
      setSelectedStore(store);
    }
  };

  // 가게 모달 닫기 핸들러
  const handleCloseStoreModal = () => {
    setSelectedStore(null);
  };

  return (
    <div className="container-fluid px-4 py-4">
    <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h2 className="fw-bold">유저 검색</h2>
      </div>

      <SearchForm
        searchType={searchType}
        setSearchType={setSearchType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        additionalParams={additionalParams}
        setAdditionalParams={setAdditionalParams}
        searchOptions={userSearchAdapter.searchOptions}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress}
        isSearching={isSearching}
        customInputs={renderCustomInputs}
      />

      <SearchResults
        results={userList}
        isLoading={isLoading}
        hasMore={hasMore}
        scrollContainerRef={scrollContainerRef}
        onScroll={handleScroll}
        renderItem={renderUserCard}
        emptyMessage="검색 결과가 없습니다"
        emptyDescription="다른 검색어로 시도해보세요"
        loadingMessage="검색 중입니다"
        title="유저 검색 결과"
      />
      <UserDetailModal
        show={!!selectedUser}
        onHide={handleCloseModal}
        user={selectedUser}
        onStoreClick={handleStoreClick}
      />

      {/* 가게 상세 모달 */}
      <StoreDetailModal
        show={!!selectedStore}
        onHide={handleCloseStoreModal}
        store={selectedStore}
        onAuthorClick={() => {}}
        onStoreDeleted={() => {}}
      />
    </div>
  );
};

export default UserSearch;
