import {useEffect, useCallback, useState, useRef} from 'react';
import StoreDetailModal from './StoreDetailModal';
import UserDetailModal from '../user/UserDetailModal';
import useSearch from '../../hooks/useSearch';
import SearchResults from '../../components/common/SearchResults';
import StoreCard from '../../components/store/StoreCard';
import rankingApi, {RankingCriteria, Province, District} from '../../api/rankingApi';
import {toast} from 'react-toastify';

const RANKING_CRITERIA = {
  MOST_REVIEWS: 'MOST_REVIEWS' as RankingCriteria,
  MOST_VISITS: 'MOST_VISITS' as RankingCriteria
};

const PopularNeighborhoodStores = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCriteria, setSelectedCriteria] = useState<RankingCriteria>(RANKING_CRITERIA.MOST_REVIEWS);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const isInitialMount = useRef(true);

  const {
    results: storeList,
    selectedItem: selectedStore,
    isLoading,
    hasMore,
    scrollContainerRef,
    handleItemClick: handleStoreClick,
    handleCloseModal,
    handleScroll,
    resetSearch,
    setResults,
    handleSearch
  } = useSearch({
    validateSearch: () => {
      if (!selectedDistrict) {
        return '지역을 선택해주세요.';
      }
      return null;
    },
    searchFunction: async ({cursor}: any) => {
      const response = await rankingApi.getPopularNeighborhoodStores(
        selectedCriteria,
        selectedDistrict,
        cursor,
        20
      );

      if (!response.ok) {
        throw new Error('Ranking search failed');
      }

      const {contents, cursor: responseCursor} = response.data;

      const hasMore = Boolean(
        responseCursor?.nextCursor &&
        contents &&
        contents.length > 0 &&
        responseCursor.hasMore !== false
      );

      return {
        ok: true,
        data: {
          results: contents || [],
          hasMore,
          nextCursor: hasMore ? responseCursor.nextCursor : null
        }
      };
    },
    resetFunction: null,
    errorMessage: '동네 인기 가게 정보를 불러오는 중 오류가 발생했습니다.',
    autoSearchTypes: []
  });

  // 지역 목록 조회
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await rankingApi.getProvinces(true);
        if (response.ok) {
          setProvinces(response.data.contents || []);
          // 기본값으로 첫 번째 지역 선택
          if (response.data.contents && response.data.contents.length > 0) {
            const firstProvince = response.data.contents[0];
            setSelectedProvince(firstProvince.province);
            setAvailableDistricts(firstProvince.districts || []);
            if (firstProvince.districts && firstProvince.districts.length > 0) {
              setSelectedDistrict(firstProvince.districts[0].district);
            }
          }
        }
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // 도/시 변경 시 구/군 목록 업데이트
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.province === selectedProvince);
      if (province) {
        setAvailableDistricts(province.districts || []);
        if (province.districts && province.districts.length > 0) {
          setSelectedDistrict(province.districts[0].district);
        }
      }
    }
  }, [selectedProvince, provinces]);

  // 검색 조건 변경 시 검색 실행
  useEffect(() => {
    if (selectedDistrict && !isInitialMount.current) {
      resetSearch();
      handleSearch(true);
    }

    if (isInitialMount.current && selectedDistrict) {
      isInitialMount.current = false;
      resetSearch();
      handleSearch(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCriteria, selectedDistrict]);

  // 검색 실행 핸들러
  const handleSearchSubmit = useCallback(() => {
    if (!selectedDistrict) {
      toast.warn('지역을 선택해주세요.');
      return;
    }
    resetSearch();
    handleSearch(true);
  }, [selectedDistrict, resetSearch, handleSearch]);

  const renderStoreCard = (store: any) => (
    <StoreCard
      key={store.storeId}
      store={store}
      onClick={handleStoreClick}
      isDeleted={store.isDeleted}
    />
  );

  // 작성자 클릭 핸들러
  const handleAuthorClick = (writer: any) => {
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
  const handleStoreDeleted = useCallback((deletedStoreId: string) => {
    const updatedResults = storeList.map((store: any) =>
      store.storeId === deletedStoreId
        ? {...store, isDeleted: true}
        : store
    );
    setResults(updatedResults);
  }, [storeList, setResults]);

  return (
    <div className="container-fluid px-2 px-md-4 py-3 py-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold">동네 인기 가게</h2>
      </div>

      {/* 검색 폼 */}
      <div className="card border-0 shadow-sm mb-3 mb-md-4">
        <div className="card-body p-3 p-md-4">
          {/* 정렬 기준 선택 */}
          <div className="mb-3 mb-md-4">
            <label className="form-label fw-semibold text-muted mb-2 d-flex align-items-center">
              <i className="bi bi-funnel me-2"></i>
              정렬 기준
            </label>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn rounded-pill ${
                  selectedCriteria === RANKING_CRITERIA.MOST_REVIEWS
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => setSelectedCriteria(RANKING_CRITERIA.MOST_REVIEWS)}
                style={{
                  fontSize: '0.9rem',
                  padding: '8px 20px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="bi bi-chat-square-text me-2"></i>
                리뷰 많은 순
              </button>
              <button
                type="button"
                className={`btn rounded-pill ${
                  selectedCriteria === RANKING_CRITERIA.MOST_VISITS
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => setSelectedCriteria(RANKING_CRITERIA.MOST_VISITS)}
                style={{
                  fontSize: '0.9rem',
                  padding: '8px 20px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="bi bi-people me-2"></i>
                이번 주 많이 왔다 갔어요
              </button>
            </div>
          </div>

          {/* 지역 선택 */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="provinceSelect" className="form-label fw-semibold text-muted mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                도/시
              </label>
              <select
                id="provinceSelect"
                className="form-select form-select-lg border-0 shadow-sm"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '2px solid transparent',
                  fontSize: '15px'
                }}
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                disabled={isLoadingProvinces}
              >
                {provinces.map((province) => (
                  <option key={province.province} value={province.province}>
                    {province.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="districtSelect" className="form-label fw-semibold text-muted mb-2">
                <i className="bi bi-geo me-2"></i>
                구/군
              </label>
              <select
                id="districtSelect"
                className="form-select form-select-lg border-0 shadow-sm"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '2px solid transparent',
                  fontSize: '15px'
                }}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={isLoadingProvinces || availableDistricts.length === 0}
              >
                {availableDistricts.map((district) => (
                  <option key={district.district} value={district.district}>
                    {district.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 현재 검색 상태 표시 */}
          <div className="mt-3">
            <small className="text-muted d-flex align-items-center" style={{fontSize: '0.75rem'}}>
              <i className="bi bi-info-circle me-2"></i>
              <span className="d-none d-md-inline">
                {selectedCriteria === RANKING_CRITERIA.MOST_REVIEWS
                  ? '리뷰가 많은 가게 순으로 조회합니다'
                  : '이번 주 방문이 많은 가게 순으로 조회합니다'}
                {selectedDistrict && availableDistricts.length > 0 && (
                  <span className="ms-2 text-primary">
                    | 지역: {availableDistricts.find(d => d.district === selectedDistrict)?.description}
                  </span>
                )}
              </span>
              <span className="d-inline d-md-none">
                {selectedCriteria === RANKING_CRITERIA.MOST_REVIEWS ? '리뷰순' : '방문순'}
                {selectedDistrict && (
                  <span className="ms-1 text-primary">
                    | {availableDistricts.find(d => d.district === selectedDistrict)?.description}
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
        emptyMessage="해당 지역의 인기 가게가 없습니다"
        emptyDescription="다른 지역을 선택해보세요"
        loadingMessage="조회 중입니다"
        title="동네 인기 가게 목록"
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

export default PopularNeighborhoodStores;
