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
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import PushSendModal from '@/components/push/PushSendModal';
import medalApi from '@/api/medalApi';
import {Medal} from '@/types/medal';

const UserSearch = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showPushModal, setShowPushModal] = useState(false);
  const [showMedalModal, setShowMedalModal] = useState(false);
  const [medals, setMedals] = useState<Medal[]>([]);
  const [selectedMedalId, setSelectedMedalId] = useState<number | null>(null);
  const [isLoadingMedals, setIsLoadingMedals] = useState(false);
  const [isAssigningMedal, setIsAssigningMedal] = useState(false);

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
    <UserCard key={user.userId} user={user} onClick={handleUserClick}
              selected={Boolean(user.userId && selectedUserIds.includes(user.userId))}
              onSelect={(id) => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id])}/>
  );

  const openMedalModal = async () => {
    setShowMedalModal(true);
    setSelectedMedalId(null);
    if (medals.length > 0) return;
    setIsLoadingMedals(true);
    try {
      const response = await medalApi.getMedals();
      if (response.ok) setMedals(response.data?.contents || []);
    } finally { setIsLoadingMedals(false); }
  };

  const assignMedal = async () => {
    if (!selectedMedalId || isAssigningMedal) return;
    setIsAssigningMedal(true);
    try {
      const userIds = selectedUserIds.map(Number).filter(Number.isFinite);
      const response = await medalApi.assignMedalToUsers(selectedMedalId, userIds);
      if (response.ok) {
        toast.success(`${userIds.length}명에게 메달 지급 요청이 완료되었습니다.`);
        setShowMedalModal(false); setSelectedMedalId(null); setSelectedUserIds([]);
      }
    } finally { setIsAssigningMedal(false); }
  };

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
      {selectedUserIds.length > 0 && <div className="position-sticky bottom-0 alert alert-primary shadow d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
        <strong>{selectedUserIds.length}명 선택됨</strong><div className="d-flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={openMedalModal}><i className="bi bi-award me-1"/>메달 지급</button>
          <button className="btn btn-sm btn-primary" onClick={() => setShowPushModal(true)}><i className="bi bi-send-fill me-1"/>푸시 발송</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedUserIds([])}>선택 해제</button>
        </div>
      </div>}
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

      <PushSendModal show={showPushModal} onHide={() => setShowPushModal(false)}
                     initialUserIds={selectedUserIds.map(Number).filter(Number.isFinite)}/>

      <Modal show={showMedalModal} onHide={() => !isAssigningMedal && setShowMedalModal(false)} centered scrollable className="app-modal">
        <Modal.Header closeButton><Modal.Title as="h2"><i className="bi bi-award"/>메달 일괄 지급</Modal.Title></Modal.Header>
        <Modal.Body><div className="alert alert-info py-2">선택한 유저 {selectedUserIds.length}명에게 동일한 메달을 지급합니다.</div>
          {isLoadingMedals ? <div className="text-center py-5"><span className="spinner-border text-primary"/><p className="small text-muted mt-2">메달 목록을 불러오는 중...</p></div> :
            <div className="d-grid gap-2">{medals.map(medal => <button type="button" key={medal.medalId}
              className={`btn text-start p-3 d-flex align-items-center gap-3 ${selectedMedalId === medal.medalId ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedMedalId(medal.medalId)}><img src={medal.iconUrl} alt="" className="rounded-circle flex-shrink-0" style={{width: 48, height: 48, objectFit: 'cover'}}/><span><strong className="d-block">{medal.name}</strong><small>{medal.introduction}</small></span></button>)}</div>}
        </Modal.Body>
        <Modal.Footer><button className="btn btn-outline-secondary" onClick={() => setShowMedalModal(false)} disabled={isAssigningMedal}>취소</button><button className="btn btn-primary" onClick={assignMedal} disabled={!selectedMedalId || isAssigningMedal}>{isAssigningMedal ? '지급 중...' : `${selectedUserIds.length}명에게 지급`}</button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserSearch;
