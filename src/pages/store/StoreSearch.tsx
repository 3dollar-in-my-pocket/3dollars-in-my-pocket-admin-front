import {FormEvent, useCallback, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeApi from '@/api/storeApi';
import BulkMarkerFormModal from '@/components/store/BulkMarkerFormModal';
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
import BulkSelectionToolbar from '@/components/common/BulkSelectionToolbar';
import useBulkSelection from '@/hooks/useBulkSelection';
import enumApi from '@/api/enumApi';

/** 삭제 처리 후 목록에서 표시하기 위해 클라이언트가 isDeleted를 덧붙입니다. */
type SearchedStore = SimpleStore & { isDeleted?: boolean };

const SEARCH_TYPE_OPTIONS = [
  {value: STORE_SEARCH_TYPES.KEYWORD, label: '가게 이름', icon: 'bi-search'},
  {value: STORE_SEARCH_TYPES.STORE_ID, label: '가게 ID', icon: 'bi-hash'}
];

/** 라벨/마커 일괄 처리 API가 한 번에 받을 수 있는 최대 가게 수 */
const MAX_BULK_SELECTION = 50;

const STORE_TYPE_OPTIONS = [
  {value: STORE_TYPE.USER_STORE, label: '일반 가게', icon: 'bi-people-fill'},
  {value: STORE_TYPE.BOSS_STORE, label: '사장님 직영점', icon: 'bi-person-badge-fill'}
];

const StoreSearch = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedStoreTypes, setSelectedStoreTypes] = useState([]);
  const [showLabels, setShowLabels] = useState(false);
  const [showMarker, setShowMarker] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [customLabelInput, setCustomLabelInput] = useState('');
  const [availableLabels, setAvailableLabels] = useState<{key: string; description: string}[]>([]);
  const [isFetchingEnums, setIsFetchingEnums] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

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
    errorMessage: storeSearchAdapter.errorMessage
  });

  const selection = useBulkSelection<SearchedStore, number>({
    items: storeList,
    getKey: store => store.storeId,
    max: MAX_BULK_SELECTION,
    // 삭제된 가게는 일괄 처리 대상이 아닙니다.
    isSelectable: store => !store.isDeleted,
    // 검색 조건이 바뀌면 화면에서 사라진 가게가 선택된 채 남지 않도록 초기화합니다.
    resetDeps: [searchType, searchQuery, selectedStoreTypes]
  });
  const selectedIds = selection.selectedList;

  // 기본 검색 조건은 가게 이름입니다.
  useEffect(() => {
    setSearchType(STORE_SEARCH_TYPES.KEYWORD);
  }, [setSearchType]);

  // 가게 이름 조건으로 진입하거나 전환했을 때 검색어가 없으면 전체 가게를 바로 조회합니다.
  useEffect(() => {
    if (searchType === STORE_SEARCH_TYPES.KEYWORD && !searchQuery.trim()) {
      handleSearch(true);
    }
  }, [searchType]);

  useEffect(() => {
    if (!showLabels || availableLabels.length > 0) return;
    setIsFetchingEnums(true);
    enumApi.getEnum().then(response => {
      if (response.ok && response.data?.StoreLabel) setAvailableLabels(response.data.StoreLabel);
    }).finally(() => setIsFetchingEnums(false));
  }, [showLabels, availableLabels.length]);

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
    handleSearch(true);
  }, [searchType, handleSearch]);

  // 가게 타입 필터가 변경되면 검색 재실행
  useEffect(() => {
    if (searchType) {
      resetSearch();
      handleSearch(true);
    }
  }, [selectedStoreTypes]);


  const renderStoreCard = (store: SearchedStore, index: number) => (
    <StoreCard
      key={store.storeId}
      store={store}
      onClick={handleStoreClick}
      isDeleted={store.isDeleted}
      index={index}
      selected={selection.isSelected(store.storeId)}
      onSelect={selection.toggle}
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

  const submitLabels = async (event: FormEvent) => {
    event.preventDefault();
    setIsBulkSubmitting(true);
    try {
      const response = await storeApi.updateStoreLabelsBulk(selectedIds, labels);
      if (response.ok) {
        toast.success('선택한 가게의 라벨 변경 요청이 완료되었습니다.');
        setShowLabels(false); selection.clear(); handleSearch(true);
      }
    } finally { setIsBulkSubmitting(false); }
  };

  const addLabel = (value: string) => {
    const label = value.trim();
    if (!label) return toast.warning('라벨을 입력해주세요.');
    if (labels.includes(label)) return toast.warning('이미 추가된 라벨입니다.');
    setLabels(prev => [...prev, label]);
  };

  return (
    <div>
      <PageHeader description="가게 이름·ID로 검색하거나 최신 등록순으로 조회합니다."/>

      <FilterCard>
        <div className="row g-3">
          <div className="col-12">
            <span className="form-label d-block">검색 조건</span>
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

          <div className="col-12">
            <span className="form-label d-block">정렬 조건</span>
            <div className="filter-chips">
              <span className="filter-chip filter-chip--active" aria-label="최신 등록순 정렬">
                <i className="bi bi-clock-history me-1"/>
                최신 등록순
              </span>
            </div>
            <p className="form-field__hint mb-0">현재 API에서 제공하는 최신 등록순으로 조회합니다.</p>
          </div>

          <div className="col-12 col-md">
            <label className="form-label" htmlFor="store-search-query">
              {searchType === STORE_SEARCH_TYPES.STORE_ID ? '가게 ID' : '가게 이름'}
            </label>
            <input
              id="store-search-query"
              type="text"
              className="form-control"
              placeholder={
                searchType === STORE_SEARCH_TYPES.STORE_ID
                  ? '가게 ID를 쉼표로 구분해 입력하세요 (최대 5개)'
                  : '가게 이름을 입력하세요 (비워두면 전체 조회)'
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
            />
          </div>

          <div className="col-12 col-md-auto d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              onClick={handleSearchSubmit}
              disabled={isSearching}
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
        loadingMessage="검색 중입니다"
        title="가게 검색 결과"
        toolbar={
          <BulkSelectionToolbar
            id="store-bulk-select"
            unit="개"
            selectedCount={selection.selectedCount}
            selectableCount={selection.selectableCount}
            isAllSelected={selection.isAllSelected}
            isPartiallySelected={selection.isPartiallySelected}
            onToggleAll={selection.toggleAll}
            onClear={selection.clear}
            onSelectRange={selection.selectRange}
            max={MAX_BULK_SELECTION}
          />
        }
      />
      {selectedIds.length > 0 && <div className="position-sticky bottom-0 alert alert-primary shadow bulk-action-bar mt-3">
        <strong>{selectedIds.length}개 가게 선택됨</strong><div className="bulk-action-bar__actions">
        <button className="btn btn-sm btn-primary" onClick={() => { setLabels([]); setCustomLabelInput(''); setShowLabels(true); }}>라벨 일괄 변경</button>
        <button className="btn btn-sm btn-primary" onClick={() => setShowMarker(true)}>마커 일괄 생성</button>
        <button className="btn btn-sm btn-outline-secondary" onClick={selection.clear}>선택 해제</button></div>
      </div>}

      <Modal show={showLabels} onHide={() => setShowLabels(false)} centered className="app-modal"><form onSubmit={submitLabels}>
        <Modal.Header closeButton><Modal.Title>가게 라벨 일괄 변경</Modal.Title></Modal.Header>
        <Modal.Body><div className="alert alert-info py-2">선택한 {selectedIds.length}개 활성 가게에 동일한 라벨을 적용합니다.</div>
          <div className="form-field"><span className="form-field__label"><i className="bi bi-tags"/>선택된 라벨</span>
            {labels.length > 0 ? <div className="form-chips">{labels.map(label => <span key={label} className="form-chip form-chip--selected"><i className="bi bi-tag-fill"/><span>{label}</span><button type="button" className="form-chip__remove" onClick={() => setLabels(prev => prev.filter(value => value !== label))} aria-label={`${label} 라벨 삭제`}><i className="bi bi-x-lg"/></button></span>)}</div> : <p className="form-field__hint">선택된 라벨이 없습니다. 이 상태로 저장하면 모든 라벨을 제거합니다.</p>}
          </div>
          <div className="form-params"><p className="form-params__head">라벨 추가하기</p>
            <div className="form-field"><label className="form-field__label" htmlFor="bulk-label-select"><i className="bi bi-list-ul"/>목록에서 선택</label>
              <select id="bulk-label-select" className="form-select form-select-sm" value="" disabled={isFetchingEnums || isBulkSubmitting} onChange={e => e.target.value && addLabel(e.target.value)}><option value="">{isFetchingEnums ? '목록 불러오는 중...' : '라벨을 선택하세요...'}</option>{availableLabels.map(option => <option key={option.key} value={option.key} disabled={labels.includes(option.key)}>{option.description} ({option.key}){labels.includes(option.key) ? ' ✓ 이미 추가됨' : ''}</option>)}</select>
            </div>
            <div className="form-field"><label className="form-field__label" htmlFor="bulk-custom-label"><i className="bi bi-pencil"/>직접 입력</label><div className="form-inline-search"><input id="bulk-custom-label" className="form-control" value={customLabelInput} onChange={e => setCustomLabelInput(e.target.value)} placeholder="커스텀 라벨 입력 (예: MY_CUSTOM_LABEL)" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel(customLabelInput); setCustomLabelInput(''); } }}/><button type="button" className="btn btn-primary" disabled={!customLabelInput.trim()} onClick={() => { addLabel(customLabelInput); setCustomLabelInput(''); }}><i className="bi bi-plus-lg me-1"/>추가</button></div><p className="form-field__hint"><i className="bi bi-info-circle me-1"/>Enum에 없는 새로운 라벨을 직접 입력할 수 있습니다</p></div>
          </div></Modal.Body>
        <Modal.Footer><button type="button" className="btn btn-outline-secondary" onClick={() => setShowLabels(false)}>취소</button><button className="btn btn-primary" disabled={isBulkSubmitting}>{isBulkSubmitting ? '처리 중...' : `${selectedIds.length}개 적용`}</button></Modal.Footer>
      </form></Modal>
      <BulkMarkerFormModal show={showMarker} mode="create" targetIds={selectedIds} onHide={() => setShowMarker(false)}
                            onSuccess={() => { selection.clear(); handleSearch(true); }}/>

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
