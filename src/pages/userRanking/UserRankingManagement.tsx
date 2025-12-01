import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import enumApi from '../../api/enumApi';
import userRankingApi from '../../api/userRankingApi';
import medalApi from '../../api/medalApi';
import { UserRankingItem, createUserRankingRequest } from '../../types/userRanking';
import UserRankingCard from '../../components/userRanking/UserRankingCard';
import UserDetailModal from '../user/UserDetailModal';
import StoreDetailModal from '../store/StoreDetailModal';
import MedalAssignModal from '../../components/userRanking/MedalAssignModal';
import Loading from '../../components/common/Loading';

const MAX_SELECTION = 500;

const UserRankingManagement = () => {
  const navigate = useNavigate();
  const [rankingTypes, setRankingTypes] = useState<any[]>([]);
  const [selectedRankingType, setSelectedRankingType] = useState<string>('');
  const [rankingList, setRankingList] = useState<UserRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [startRankInput, setStartRankInput] = useState<string>('1');
  const [endRankInput, setEndRankInput] = useState<string>('');
  const [showMedalModal, setShowMedalModal] = useState(false);
  const [isAssigningMedal, setIsAssigningMedal] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  useEffect(() => {
    loadEnums();
  }, []);

  useEffect(() => {
    if (selectedRankingType) {
      resetAndFetchRankings();
    }
  }, [selectedRankingType]);

  const loadEnums = async () => {
    try {
      const enumResponse = await enumApi.getEnum();
        const types = enumResponse.data['UserRankingType'] || [];
        console.log(types)
        setRankingTypes(types);
        if (types.length > 0) {
          setSelectedRankingType(types[0].key);
      }
    } catch (error) {
      console.error('Enum 조회 실패:', error);
      toast.error('랭킹 타입 목록을 불러오는데 실패했습니다.');
    }
  };

  const resetAndFetchRankings = () => {
    setRankingList([]);
    setCursor(null);
    setHasMore(false);
    setSelectedUserIds(new Set());
    fetchRankings(null, true);
  };

  const fetchRankings = async (nextCursor: string | null = null, isInitial: boolean = false) => {
    if (!selectedRankingType) return;

    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const request = createUserRankingRequest({
        userRankingType: selectedRankingType,
        cursor: nextCursor,
        size: pageSize
      });

      const response = await userRankingApi.getUserRankings(request);

      if (response.ok && response.data) {
        const newItems = response.data.contents || [];
        const cursorData = response.data.cursor || { hasMore: false, nextCursor: null };

        if (isInitial) {
          setRankingList(newItems);
        } else {
          setRankingList(prev => [...prev, ...newItems]);
        }

        setHasMore(cursorData.hasMore || false);
        setCursor(cursorData.nextCursor || null);
      } else {
        if (isInitial) {
          setRankingList([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('유저 랭킹 조회 실패:', error);
      toast.error('유저 랭킹을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8 && hasMore && cursor) {
      fetchRankings(cursor, false);
    }
  }, [hasMore, cursor, isLoadingMore]);

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

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        if (newSet.size >= MAX_SELECTION) {
          toast.warning(`최대 ${MAX_SELECTION}명까지만 선택할 수 있습니다.`);
          return prev;
        }
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedUserIds.size > 0) {
      setSelectedUserIds(new Set());
    } else {
      const idsToSelect = rankingList.slice(0, MAX_SELECTION).map(item => item.user.userId);
      setSelectedUserIds(new Set(idsToSelect));
      if (rankingList.length > MAX_SELECTION) {
        toast.info(`최대 ${MAX_SELECTION}명까지만 선택되었습니다.`);
      }
    }
  };

  const handleSelectByRank = () => {
    const startRank = parseInt(startRankInput, 10);
    const endRank = parseInt(endRankInput, 10);

    if (isNaN(startRank) || startRank <= 0) {
      toast.warning('시작 순위는 1 이상의 숫자를 입력해주세요.');
      return;
    }

    if (isNaN(endRank) || endRank <= 0) {
      toast.warning('종료 순위는 1 이상의 숫자를 입력해주세요.');
      return;
    }

    if (startRank > endRank) {
      toast.warning('시작 순위는 종료 순위보다 작거나 같아야 합니다.');
      return;
    }

    if (endRank > rankingList.length) {
      toast.warning(`현재 랭킹에는 ${rankingList.length}명만 있습니다.`);
      return;
    }

    const count = endRank - startRank + 1;
    if (count > MAX_SELECTION) {
      toast.warning(`최대 ${MAX_SELECTION}명까지만 선택할 수 있습니다.`);
      return;
    }

    // 배열 인덱스는 0부터 시작하므로 -1
    const idsToSelect = rankingList.slice(startRank - 1, endRank).map(item => item.user.userId);
    setSelectedUserIds(new Set(idsToSelect));

    toast.success(`${startRank}등부터 ${endRank}등까지 ${count}명이 선택되었습니다.`);
    setEndRankInput('');
  };

  const handleSendPush = () => {
    if (selectedUserIds.size === 0) {
      toast.warning('푸시를 발송할 유저를 선택해주세요.');
      return;
    }

    navigate('/manage/push-message', {
      state: {
        userIds: Array.from(selectedUserIds)
      }
    });
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
        setSelectedUserIds(new Set());
      } else {
        toast.error('메달 지급에 실패했습니다.');
      }
    } catch (error) {
      console.error('메달 지급 실패:', error);
      toast.error('메달 지급 중 오류가 발생했습니다.');
    } finally {
      setIsAssigningMedal(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h2 className="fw-bold">유저 랭킹 관리</h2>
        {selectedUserIds.size > 0 && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-warning d-flex align-items-center gap-2"
              onClick={handleOpenMedalModal}
              disabled={isAssigningMedal}
            >
              <i className="bi bi-award-fill"></i>
              메달 지급 ({selectedUserIds.size}명)
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleSendPush}
            >
              <i className="bi bi-send-fill"></i>
              푸시 발송 ({selectedUserIds.size}명)
            </button>
          </div>
        )}
      </div>

      {/* 랭킹 타입 선택 */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary mb-2">
                <i className="bi bi-funnel me-2"></i>랭킹 타입
              </label>
              <select
                className="form-select form-select-lg border-0 shadow-sm"
                style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
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
        </div>
      </div>

      {/* 랭킹 결과 */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              {rankingList.length > 0 && (
                <>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAll"
                      checked={selectedUserIds.size > 0 && selectedUserIds.size === Math.min(rankingList.length, MAX_SELECTION)}
                      onChange={handleToggleAll}
                    />
                    <label className="form-check-label" htmlFor="selectAll">
                      전체 선택
                    </label>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="시작"
                      value={startRankInput}
                      onChange={(e) => setStartRankInput(e.target.value)}
                      style={{ width: '70px' }}
                      min="1"
                    />
                    <span className="text-muted">~</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="종료"
                      value={endRankInput}
                      onChange={(e) => setEndRankInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSelectByRank();
                        }
                      }}
                      style={{ width: '70px' }}
                      min="1"
                    />
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleSelectByRank}
                    >
                      범위 선택
                    </button>
                  </div>
                </>
              )}
              <h5 className="fw-bold mb-0">
                <i className="bi bi-trophy me-2 text-warning"></i>
                {getSelectedRankingTypeName()} 랭킹
              </h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              {selectedUserIds.size > 0 && (
                <span className="badge bg-success rounded-pill px-3 py-2">
                  선택: {selectedUserIds.size}명
                </span>
              )}
              <span className="badge bg-primary rounded-pill px-3 py-2">
                총 {rankingList.length}명
              </span>
            </div>
          </div>
        </div>
        <div
          className="card-body p-4"
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {isLoading ? (
            <div className="text-center py-5">
              <Loading />
              <p className="text-muted mt-3">랭킹을 불러오는 중입니다</p>
            </div>
          ) : rankingList.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted mb-3"></i>
              <p className="text-muted fs-5">랭킹 데이터가 없습니다</p>
              <p className="text-muted small">다른 랭킹 타입을 선택해보세요</p>
            </div>
          ) : (
            <>
              <div className="row">
                {rankingList.map((item, index) => (
                  <UserRankingCard
                    key={`${item.user.userId}-${index}`}
                    rankingItem={item}
                    rank={index + 1}
                    onClick={handleUserClick}
                    isSelected={selectedUserIds.has(item.user.userId)}
                    onToggleSelect={handleToggleUser}
                  />
                ))}
              </div>
              {isLoadingMore && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                  </div>
                  <p className="text-muted mt-2 mb-0">더 불러오는 중...</p>
                </div>
              )}
              {!hasMore && rankingList.length > 0 && (
                <div className="text-center py-3">
                  <p className="text-muted mb-0">모든 랭킹을 불러왔습니다</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
        onAuthorClick={() => {}}
        onStoreDeleted={() => {}}
      />

      {/* 메달 지급 모달 */}
      <MedalAssignModal
        show={showMedalModal}
        onHide={() => setShowMedalModal(false)}
        selectedUserCount={selectedUserIds.size}
        onAssign={handleAssignMedal}
      />
    </div>
  );
};

export default UserRankingManagement;
