import {useEffect, useState} from 'react';
import type {SimpleStore} from '@/types/store';
import type {User} from '@/types/user';
import {SEARCH_TYPES} from '@/types/user';
import type {SearchCustomInputsArgs} from '@/components/common/SearchForm';
import SearchForm from '@/components/common/SearchForm';
import UserDetailModal from './UserDetailModal';
import StoreDetailModal from '@/pages/store/StoreDetailModal';
import useSearch from '@/hooks/useSearch';
import {userSearchAdapter} from '@/adapters/userSearchAdapter';
import SearchResults from '@/components/common/SearchResults';
import UserCard from '@/components/user/UserCard';
import PageHeader from '@/components/common/PageHeader';

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

  const renderCustomInputs = ({
                                searchType,
                                searchQuery,
                                handleSearchQueryChange,
                                additionalParams,
                                handleAdditionalParamChange,
                                onKeyPress
                              }: SearchCustomInputsArgs) => {
    if (searchType === SEARCH_TYPES.NAME) {
      return (
        <input
          type="text"
          className="form-control"
          placeholder="닉네임을 입력하세요"
          value={searchQuery}
          onChange={handleSearchQueryChange}
          onKeyPress={onKeyPress}
          onCompositionEnd={(e: any) => {
            setSearchQuery(e.target.value);
          }}
        />
      );
    }

    return (
      <input
        type="text"
        className="form-control"
        placeholder="유저 ID를 쉼표로 구분해 입력하세요 (예: 1, 2, 3)"
        value={additionalParams.userIds || ''}
        onChange={(e) => handleAdditionalParamChange('userIds', e.target.value)}
        onKeyPress={onKeyPress}
        onCompositionEnd={(e: any) => {
          handleAdditionalParamChange('userIds', e.target.value);
        }}
      />
    );
  };

  const renderUserCard = (user: User) => (
    <UserCard key={user.userId} user={user} onClick={handleUserClick}/>
  );

  // 가게 클릭 핸들러
  const handleStoreClick = (store: SimpleStore) => {
    if (store && store.storeId) {
      setSelectedStore(store);
    }
  };

  // 가게 모달 닫기 핸들러
  const handleCloseStoreModal = () => {
    setSelectedStore(null);
  };

  return (
    <div>
      <PageHeader description="닉네임 또는 유저 ID로 회원을 검색하고 상세 정보를 확인합니다."/>

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
        onAuthorClick={() => {
        }}
        onStoreDeleted={() => {
        }}
      />
    </div>
  );
};

export default UserSearch;
