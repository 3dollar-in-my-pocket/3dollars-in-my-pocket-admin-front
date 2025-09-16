import {useCallback, useRef, useState} from 'react';
import StoreDetailModal from './StoreDetailModal';
import {
  formatRating,
  getActivitiesStatusBadgeClass,
  getActivitiesStatusDisplayName,
  getCategoryIcon,
  getStoreStatusBadgeClass,
  getStoreStatusDisplayName,
  STORE_SEARCH_TYPES,
  validateStoreSearch
} from '../../types/store';
import storeApi from '../../api/storeApi';
import {toast} from 'react-toastify';

const StoreSearch = () => {
  const [searchType, setSearchType] = useState(STORE_SEARCH_TYPES.KEYWORD);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const scrollContainerRef = useRef(null);


  // Infinite scroll handler
  const handleScroll = useCallback((e) => {
    const {scrollTop, scrollHeight, clientHeight} = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading]);

  const handleSearch = async (reset = true) => {
    if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
      const validationError = validateStoreSearch(searchType, searchQuery);
      if (validationError) {
        toast(validationError);
        return;
      }
    }

    setIsSearching(true);
    setIsLoading(true);

    try {
      let response;

      if (searchType === STORE_SEARCH_TYPES.KEYWORD) {
        response = await storeApi.searchStores(
          searchQuery,
          reset ? null : nextCursor,
          20
        );
      } else {
        response = await storeApi.getStores(
          reset ? null : nextCursor,
          20
        );
      }

      if (!response.ok) {
        return;
      }

      const {contents, cursor} = response.data;

      if (reset) {
        setStoreList(contents || []);
      } else {
        setStoreList(prev => [...prev, ...(contents || [])]);
      }
      setHasMore(cursor?.hasMore || false);
      setNextCursor(cursor?.nextCursor || null);
    } catch (error) {
      toast.error('가게 정보를 불러오는 중 오류가 발생했습니다.');
      if (reset) {
        setStoreList([]);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      handleSearch(false);
    }
  };

  const handleStoreClick = (store) => {
    setSelectedStore(store);
  };

  const handleCloseModal = () => {
    setSelectedStore(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(true);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getCategoryBadges = (categories) => {
    if (!categories || categories.length === 0) return null;

    return categories.slice(0, 3).map((category, index) => (
      <span key={category.categoryId || index}
            className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill me-1 mb-1">
        <i className={`bi ${getCategoryIcon(category.categoryId)} me-1`}></i>
        {category.name}
      </span>
    ));
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2 className="fw-bold">🏪 가게 검색</h2>
      </div>

      {/* 검색 영역 */}
      <div className="card border-0 shadow-lg mb-5">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-lg-2 col-md-3">
              <label className="form-label fw-bold text-dark mb-3">
                <i className="bi bi-funnel-fill me-2 text-primary"></i>
                검색 방식
              </label>
              <select
                className="form-select form-select-lg border-0 shadow-sm"
                style={{backgroundColor: '#f8f9fa', borderRadius: '12px'}}
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value={STORE_SEARCH_TYPES.KEYWORD}>키워드 검색</option>
                <option value={STORE_SEARCH_TYPES.RECENT}>최신순 조회</option>
              </select>
            </div>

            <div className="col-lg-7 col-md-6">
              <label className="form-label fw-bold text-dark mb-3">
                <i className="bi bi-search me-2 text-success"></i>
                {searchType === STORE_SEARCH_TYPES.KEYWORD ? '검색어' : '조회'}
              </label>
              {searchType === STORE_SEARCH_TYPES.KEYWORD ? (
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px'}}
                  placeholder="🔍 가게 이름을 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              ) : (
                <div className="form-control form-control-lg border-0 shadow-sm d-flex align-items-center"
                     style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px', color: '#6c757d'}}>
                  최신순으로 가게를 조회합니다
                </div>
              )}
            </div>

            <div className="col-lg-3 col-md-3 d-flex align-items-end">
              <button
                className="btn btn-lg w-100 border-0 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 20px'
                }}
                onClick={() => handleSearch(true)}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {searchType === STORE_SEARCH_TYPES.KEYWORD ? '검색 중...' : '조회 중...'}
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    {searchType === STORE_SEARCH_TYPES.KEYWORD ? '검색하기' : '조회하기'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-white border-0 p-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary rounded-circle p-2">
              <i className="bi bi-list-ul text-white"></i>
            </div>
            <h4 className="mb-0 fw-bold text-dark">검색 결과</h4>
          </div>
        </div>
        <div
          className="card-body p-0"
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{maxHeight: '80vh', overflowY: 'auto'}}
        >
          {storeList.length === 0 && !isLoading ? (
            <div className="text-center py-5 text-muted">
              <div className="mb-4">
                <div className="bg-light rounded-circle mx-auto" style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-shop fs-1 text-secondary"></i>
                </div>
              </div>
              <h5 className="text-dark mb-2">검색 결과가 없습니다</h5>
              <p className="text-muted">다른 검색어로 시도해보세요.</p>
            </div>
          ) : storeList.length > 0 ? (
            <div className="row g-3 p-3">
              {storeList.map((store, index) => {
                const borderColor = getStoreStatusBadgeClass(store.status).includes('success') ? '#198754' :
                  getStoreStatusBadgeClass(store.status).includes('warning') ? '#ffc107' :
                    getStoreStatusBadgeClass(store.status).includes('danger') ? '#dc3545' : '#6c757d';

                return (
                  <div key={store.storeId} className="col-lg-4 col-md-6 col-12">
                    <div
                      className="card border-0 shadow-sm h-100"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderTop: `4px solid ${borderColor}`,
                        borderRadius: '12px'
                      }}
                      onClick={() => handleStoreClick(store)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div className="card-body p-3">
                        <div className="text-center mb-3">
                          <div className="rounded-circle p-2 shadow-sm mx-auto mb-2" style={{
                            background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}10 100%)`,
                            border: `2px solid ${borderColor}40`,
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="bi bi-shop fs-6" style={{color: borderColor}}></i>
                          </div>
                        </div>
                        <div>
                          <div className="text-center mb-2">
                            <h6 className="mb-1 fw-bold text-dark" title={store.name} style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>{store.name}</h6>
                            <span
                              className={`badge rounded-pill ${getStoreStatusBadgeClass(store.status)} bg-opacity-10 text-dark border px-2 py-1 small`}>
                              <i className="bi bi-circle-fill me-1" style={{fontSize: '0.4rem'}}></i>
                              {getStoreStatusDisplayName(store.status)}
                            </span>
                          </div>

                          <div className="d-flex justify-content-center gap-1 mb-2 flex-wrap">
                            <span
                              className={`badge rounded-pill ${getActivitiesStatusBadgeClass(store.activitiesStatus)} bg-opacity-10 text-dark border px-2 py-1`}
                              style={{fontSize: '0.7rem'}}>
                              <i className="bi bi-activity me-1"></i>
                              {getActivitiesStatusDisplayName(store.activitiesStatus)}
                            </span>
                            <span
                              className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-pill px-2 py-1"
                              style={{fontSize: '0.7rem'}}>
                              <i className="bi bi-star-fill me-1"></i>
                              {formatRating(store.rating)}
                            </span>
                          </div>

                          <div className="mb-2 text-center">
                            <div className="text-muted small mb-1" title={store.address?.fullAddress} style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <i className="bi bi-geo-alt me-1"></i>
                              {store.address?.fullAddress || '주소 정보 없음'}
                            </div>
                            <div className="text-muted small">
                              <i className="bi bi-calendar3 me-1"></i>
                              {formatDateTime(store.createdAt)}
                            </div>
                          </div>

                          {/* 카테고리 미리보기 */}
                          <div className="d-flex justify-content-center flex-wrap gap-1 mb-3">
                            {store.categories?.slice(0, 2).map((category, idx) => (
                              <span key={idx} className="badge rounded-pill px-2 py-1" style={{
                                background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                                color: '#667eea',
                                border: '1px solid #667eea40',
                                fontSize: '0.65rem'
                              }}>
                                <i className={`bi ${getCategoryIcon(category.categoryId)} me-1`}></i>
                                {category?.name}
                              </span>
                            ))}
                            {store.categories && store.categories.length > 2 && (
                              <span className="badge bg-light text-muted border rounded-pill px-2 py-1"
                                    style={{fontSize: '0.65rem'}}>
                                +{store.categories.length - 2}
                              </span>
                            )}
                          </div>

                          <div className="text-center">
                            <button
                              className="btn btn-sm rounded-pill px-3 py-2 shadow-sm"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '0.8rem'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStoreClick(store);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                            >
                              <i className="bi bi-eye me-1"></i>
                              상세보기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* 더 불러올 데이터가 있을 때 로딩 인디케이터 */}
          {hasMore && storeList.length > 0 && isLoading && (
            <div className="text-center p-3 bg-light">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="small text-muted mt-2 mb-0">더 많은 결과를 불러오는 중...</p>
            </div>
          )}

          {/* 로딩 인디케이터 */}
          {isLoading && storeList.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-3">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <h5 className="text-dark mb-1">{searchType === STORE_SEARCH_TYPES.KEYWORD ? '검색 중입니다' : '조회 중입니다'}</h5>
              <p className="text-muted">잠시만 기다려주세요...</p>
            </div>
          )}
        </div>
      </div>

      {/* 가게 상세 모달 */}
      <StoreDetailModal
        show={!!selectedStore}
        onHide={handleCloseModal}
        store={selectedStore}
      />
    </div>
  );
};

export default StoreSearch;
