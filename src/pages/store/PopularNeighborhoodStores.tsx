import {useCallback, useEffect, useRef, useState} from 'react';
import StoreDetailModal from './StoreDetailModal';
import UserDetailModal from '@/pages/user/UserDetailModal';
import useSearch from '@/hooks/useSearch';
import SearchResults from '@/components/common/SearchResults';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import StoreCard from '@/components/store/StoreCard';
import rankingApi, {District, Province, RankingCriteria} from '@/api/rankingApi';
import {toast} from 'react-toastify';

const RANKING_CRITERIA = {
  MOST_REVIEWS: 'MOST_REVIEWS' as RankingCriteria,
  MOST_VISITS: 'MOST_VISITS' as RankingCriteria
};

const CRITERIA_OPTIONS = [
  {value: RANKING_CRITERIA.MOST_REVIEWS, label: '리뷰 많은 순', icon: 'bi-chat-square-text'},
  {value: RANKING_CRITERIA.MOST_VISITS, label: '이번 주 방문 많은 순', icon: 'bi-people'}
];

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
  const handleStoreDeleted = useCallback((deletedStoreId: number) => {
    const updatedResults = storeList.map((store: any) =>
      store.storeId === deletedStoreId
        ? {...store, isDeleted: true}
        : store
    );
    setResults(updatedResults);
  }, [storeList, setResults]);

  return (
    <div>
      <PageHeader description="지역별로 리뷰·방문이 많은 인기 가게를 조회합니다."/>

      <FilterCard>
        <div className="row g-3">
          <div className="col-12">
            <span className="form-label d-block">정렬 기준</span>
            <div className="filter-chips">
              {CRITERIA_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-chip ${selectedCriteria === option.value ? 'filter-chip--active' : ''}`}
                  onClick={() => setSelectedCriteria(option.value)}
                >
                  <i className={`bi ${option.icon} me-1`}/>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="provinceSelect" className="form-label">도/시</label>
            <select
              id="provinceSelect"
              className="form-select"
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
            <label htmlFor="districtSelect" className="form-label">구/군</label>
            <select
              id="districtSelect"
              className="form-select"
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
      </FilterCard>

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
