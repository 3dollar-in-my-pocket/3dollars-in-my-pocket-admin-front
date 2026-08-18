import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import enumApi from '@/api/enumApi';
import userRankingApi from '@/api/userRankingApi';
import medalApi from '@/api/medalApi';
import useCursorPagination from '@/hooks/useCursorPagination';
import {createUserRankingRequest, UserRankingItem} from '@/types/userRanking';
import UserRankingCard from '@/components/userRanking/UserRankingCard';
import UserDetailModal from '@/pages/user/UserDetailModal';
import StoreDetailModal from '@/pages/store/StoreDetailModal';
import MedalAssignModal from '@/components/userRanking/MedalAssignModal';
import PushSendModal from '@/components/push/PushSendModal';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';
import BulkSelectionToolbar from '@/components/common/BulkSelectionToolbar';
import useBulkSelection from '@/hooks/useBulkSelection';

const MAX_SELECTION = 500;

const UserRankingManagement = () => {
  const [rankingTypes, setRankingTypes] = useState<any[]>([]);
  const [selectedRankingType, setSelectedRankingType] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showMedalModal, setShowMedalModal] = useState(false);
  const [isAssigningMedal, setIsAssigningMedal] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  useEffect(() => {
    loadEnums();
  }, []);

  const loadEnums = async () => {
    const enumResponse = await enumApi.getEnum();
    const types = enumResponse.data['UserRankingType'] || [];
    setRankingTypes(types);
    if (types.length > 0) {
      setSelectedRankingType(types[0].key);
    }
  };

  const fetchRankingPage = useCallback(async (cursor: string | null) => {
    const request = createUserRankingRequest({
      userRankingType: selectedRankingType,
      cursor,
      size: pageSize
    });

    const response = await userRankingApi.getUserRankings(request);

    if (!response?.ok || !response.data) return response;

    // 탈퇴 유저(userId가 null인 경우) 필터링
    const {contents = [], cursor: newCursor} = response.data as any;
    return {
      ...response,
      data: {
        ...response.data,
        contents: contents.filter((item: UserRankingItem) => item.user?.userId != null),
        cursor: newCursor
      }
    };
  }, [selectedRankingType]);

  const {
    items: rankingList,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore
  } = useCursorPagination<UserRankingItem>({
    fetcher: fetchRankingPage,
    enabled: Boolean(selectedRankingType),
    deps: [selectedRankingType],
    errorMessage: '랭킹 목록을 불러오지 못했습니다.'
  });

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore || !hasMore) return;

    const {scrollTop, scrollHeight, clientHeight} = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const handleUserClick = (rankingItem: UserRankingItem) => {
    const user = {
      userId: String(rankingItem.user.userId),
      nickname: rankingItem.user.name,
      socialType: rankingItem.user.socialType,
      createdAt: rankingItem.user.createdAt
    };
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleStoreClick = (store: any) => {
    if (store && store.storeId) {
      setSelectedStore(store);
    }
  };

  const handleCloseStoreModal = () => {
    setSelectedStore(null);
  };

  const getSelectedRankingTypeName = () => {
    const type = rankingTypes.find(t => t.key === selectedRankingType);
    return type ? type.description : '전체';
  };

  const selection = useBulkSelection<UserRankingItem, number>({
    items: rankingList,
    getKey: item => item.user.userId,
    max: MAX_SELECTION,
    // 랭킹 타입이 바뀌면 이전 선택을 초기화한다.
    resetDeps: [selectedRankingType]
  });
  const selectedUserIds = selection.selectedKeys;

  const handleSendPush = () => {
    if (selectedUserIds.size === 0) {
      toast.warning('푸시를 발송할 유저를 선택해주세요.');
      return;
    }
    setShowPushModal(true);
  };

  const handleOpenMedalModal = () => {
    if (selectedUserIds.size === 0) {
      toast.warning('메달을 지급할 유저를 선택해주세요.');
      return;
    }
    setShowMedalModal(true);
  };

  const handleAssignMedal = async (medalId: number) => {
    if (isAssigningMedal) return;

    setIsAssigningMedal(true);
    try {
      const response = await medalApi.assignMedalToUsers(medalId, Array.from(selectedUserIds));

      if (response.ok) {
        toast.success(`${selectedUserIds.size}명에게 메달이 지급되었습니다.`);
        setShowMedalModal(false);
        selection.clear();
      }
    } finally {
      setIsAssigningMedal(false);
    }
  };

  return (
    <div>
      <PageHeader
        description="랭킹 타입별 상위 유저를 조회하고, 선택한 유저에게 메달을 지급하거나 푸시를 발송합니다."
        actions={selectedUserIds.size > 0 && (
          <>
            <button
              className="btn btn-outline-primary"
              onClick={handleOpenMedalModal}
              disabled={isAssigningMedal}
            >
              <i className="bi bi-award-fill me-1"/>
              메달 지급 ({selectedUserIds.size}명)
            </button>
            <button className="btn btn-primary" onClick={handleSendPush}>
              <i className="bi bi-send-fill me-1"/>
              푸시 발송 ({selectedUserIds.size}명)
            </button>
          </>
        )}
      />

      <FilterCard
        aside={selectedUserIds.size > 0 && (
          <button className="form-subhead__clear" onClick={selection.clear}>
            선택 {selectedUserIds.size}명 해제
          </button>
        )}
      >
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label" htmlFor="ranking-type">랭킹 타입</label>
            <select
              id="ranking-type"
              className="form-select"
              value={selectedRankingType}
              onChange={(e) => setSelectedRankingType(e.target.value)}
            >
              {rankingTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.description}
                </option>
              ))}
            </select>
          </div>

        </div>
      </FilterCard>

      <SectionCard
        title={`${getSelectedRankingTypeName()} 랭킹`}
        icon="bi-trophy-fill"
        aside={
          <>
            {selectedUserIds.size > 0 && (
              <span className="page-count">선택 {selectedUserIds.size}명</span>
            )}
            {rankingList.length > 0 && (
              <span className="page-count">{rankingList.length.toLocaleString()}{hasMore ? '+' : ''}명</span>
            )}
          </>
        }
      >
        {rankingList.length > 0 && (
          <BulkSelectionToolbar
            id="user-ranking-bulk-select"
            unit="명"
            selectedCount={selection.selectedCount}
            selectableCount={selection.selectableCount}
            isAllSelected={selection.isAllSelected}
            isPartiallySelected={selection.isPartiallySelected}
            onToggleAll={selection.toggleAll}
            onClear={selection.clear}
            max={MAX_SELECTION}
          />
        )}

        <div ref={scrollContainerRef} onScroll={handleScroll} style={{maxHeight: '70vh', overflowY: 'auto'}}>
          {isLoading && rankingList.length === 0 ? (
            <Loading/>
          ) : rankingList.length === 0 ? (
            <EmptyState
              icon="bi-trophy"
              title="랭킹 데이터가 없습니다"
              description="다른 랭킹 타입을 선택해보세요."
            />
          ) : (
            <>
              <div className="row g-3">
                {rankingList.map((item, index) => (
                  <UserRankingCard
                    key={`${item.user.userId}-${index}`}
                    rankingItem={item}
                    rank={index + 1}
                    onClick={handleUserClick}
                    isSelected={selection.isSelected(item.user.userId)}
                    onToggleSelect={selection.toggle}
                  />
                ))}
              </div>

              {isLoadingMore && (
                <div className="text-center py-3">
                  <span className="spinner-border spinner-border-sm text-primary me-2" role="status"/>
                  <span className="small text-muted">더 불러오는 중...</span>
                </div>
              )}

              {!hasMore && (
                <p className="text-center text-secondary small py-3 mb-0">
                  <i className="bi bi-check-circle me-1"/>
                  모든 랭킹을 불러왔습니다.
                </p>
              )}
            </>
          )}
        </div>
      </SectionCard>

      {/* 유저 상세 모달 */}
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

      {/* 메달 지급 모달 */}
      <MedalAssignModal
        show={showMedalModal}
        onHide={() => setShowMedalModal(false)}
        selectedUserCount={selectedUserIds.size}
        onAssign={handleAssignMedal}
      />

      {/* 푸시 발송 모달 */}
      <PushSendModal
        show={showPushModal}
        onHide={() => setShowPushModal(false)}
        initialUserIds={Array.from(selectedUserIds)}
      />
    </div>
  );
};

export default UserRankingManagement;
