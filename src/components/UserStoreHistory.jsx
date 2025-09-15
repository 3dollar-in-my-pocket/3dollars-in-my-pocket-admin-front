import { useState, useEffect, useRef, useCallback } from 'react';
import userApi from '../api/userApi';
import storeApi from '../api/storeApi';
import { toast } from 'react-toastify';

const UserStoreHistory = ({ userId, isActive }) => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStoreDetail, setSelectedStoreDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (userId && isActive) {
      fetchStores(true);
    }
  }, [userId, isActive]);

  const fetchStores = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await userApi.getUserStores(userId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('제보한 가게 이력을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const { contents = [], cursor: newCursor = {} } = response.data || {};

      if (reset) {
        setStores(contents);
      } else {
        setStores(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
      setTotalCount(newCursor.totalCount || 0);
    } catch (error) {
      toast.error('제보한 가게 이력을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchStores(false);
    }
  }, [hasMore, isLoading, fetchStores]);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading, handleLoadMore]);

  const handleStoreClick = async (store) => {
    setSelectedStore(store);
    setShowModal(true);
    setIsLoadingDetail(true);
    setSelectedStoreDetail(null);

    try {
      const response = await storeApi.getStoreDetail(store.storeId);
      if (response?.ok) {
        setSelectedStoreDetail(response.data);
      } else {
        toast.error('가게 상세 정보를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      toast.error('가게 상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStore(null);
    setSelectedStoreDetail(null);
  };

  const getSalesTypeBadge = (salesType) => {
    if (!salesType) return null;
    const badgeClass = salesType.type === 'ROAD' ? 'bg-success' :
                      salesType.type === 'STORE' ? 'bg-primary' : 'bg-secondary';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        {salesType.description || salesType.type}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const badgeClass = status === 'ACTIVE' ? 'bg-success' :
                      status === 'DELETED' ? 'bg-danger' :
                      status === 'AUTO_DELETED' ? 'bg-warning' : 'bg-secondary';
    const statusText = status === 'ACTIVE' ? '활성화 중' :
                      status === 'DELETED' ? '삭제됨' :
                      status === 'AUTO_DELETED' ? '자동 삭제됨' : '알 수 없음';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        {statusText}
      </span>
    );
  };

  const getActivitiesStatusBadge = (activitiesStatus) => {
    if (!activitiesStatus) return null;
    const badgeClass = activitiesStatus === 'RECENT_ACTIVITY' ? 'bg-info' :
                      activitiesStatus === 'NO_RECENT_ACTIVITY' ? 'bg-secondary' : 'bg-light';
    const statusText = activitiesStatus === 'RECENT_ACTIVITY' ? '최근 활동' :
                      activitiesStatus === 'NO_RECENT_ACTIVITY' ? '활동 없음' : '알 수 없음';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {statusText}
      </span>
    );
  };

  const getDayOfWeekInKorean = (dayOfWeek) => {
    const dayMap = {
      'MONDAY': '월요일',
      'TUESDAY': '화요일',
      'WEDNESDAY': '수요일',
      'THURSDAY': '목요일',
      'FRIDAY': '금요일',
      'SATURDAY': '토요일',
      'SUNDAY': '일요일'
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  const sortDaysByWeekOrder = (days) => {
    if (!days || !Array.isArray(days)) return [];
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  };

  const getPaymentMethodInKorean = (method) => {
    const methodMap = {
      'CASH': '현금',
      'ACCOUNT_TRANSFER': '계좌이체',
      'CARD': '카드'
    };
    return methodMap[method] || method;
  };

  return (
    <div>
      <div className="px-4 pt-4">
        <div className="d-flex align-items-center justify-content-between mb-4 p-4 rounded-4 shadow-sm"
             style={{
               background: 'linear-gradient(135deg, #e8f5e8 0%, #f8fffe 100%)',
               border: '1px solid rgba(40, 167, 69, 0.1)'
             }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success rounded-circle p-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
              <i className="bi bi-shop text-white fs-5"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">제보한 가게 목록</h6>
              <small className="text-muted">사용자가 등록한 가게 정보를 확인하세요</small>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-collection me-1"></i>
                총 {totalCount}개
              </span>
            </div>
          )}
        </div>
      </div>
      <div
        className="px-4"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ maxHeight: '500px', overflowY: 'auto' }}
      >
          {stores.length === 0 && !isLoading ? (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <i className="bi bi-shop fs-1 text-secondary"></i>
              </div>
              <h5 className="text-dark mb-2">제보한 가게가 없습니다</h5>
              <p className="text-muted">아직 제보한 가게가 없습니다.</p>
            </div>
          ) : (
            <div className="row g-3">
              {stores.map((store, index) => (
                <div key={store.storeId} className="col-12">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                    onClick={() => handleStoreClick(store)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      e.currentTarget.style.borderColor = '#28a745';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2 shadow-sm">
                              <i className="bi bi-shop text-success"></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 fw-bold text-dark">{store.name || '이름 없음'}</h6>
                              <div className="d-flex flex-wrap align-items-center gap-2">
                                {getSalesTypeBadge(store.salesType)}
                                {getStatusBadge(store.status)}
                                {getActivitiesStatusBadge(store.activitiesStatus)}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex align-items-start gap-2 mb-2">
                              <i className="bi bi-geo-alt text-muted mt-1"></i>
                              <span className="text-muted small">{store.address?.fullAddress || '주소 정보 없음'}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-star-fill text-warning"></i>
                              <span className="text-dark fw-medium small">
                                {store.rating ? store.rating.toFixed(1) : '0.0'}점
                              </span>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap gap-2">
                            {store.categories?.slice(0, 3).map((category, idx) => (
                              <span key={idx} className="badge rounded-pill px-3 py-1 small"
                                    style={{
                                      background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                                      color: 'white',
                                      border: 'none'
                                    }}>
                                {category?.name || '카테고리'}
                              </span>
                            ))}
                            {store.categories && store.categories.length > 3 && (
                              <span className="badge bg-light text-dark border rounded-pill px-3 py-1 small">
                                +{store.categories.length - 3}개 더
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ms-3">
                          <button
                            className="btn btn-sm rounded-pill px-3 py-2 shadow-sm"
                            style={{
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                              color: 'white',
                              border: 'none',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStoreClick(store);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <i className="bi bi-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}

        {isLoading && stores.length > 0 && (
          <div className="text-center p-3 bg-light">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small text-muted mt-2 mb-0">추가 데이터 로딩 중...</p>
          </div>
        )}

        {isLoading && stores.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-success" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">가게 정보를 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요...</p>
          </div>
        )}
      </div>

      {showModal && selectedStore && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
                <div className="w-100">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div>
                      <h4 className="mb-0 fw-bold">{selectedStore?.name || '가게 이름 없음'}</h4>
                      <p className="mb-0 opacity-90">{selectedStore?.salesType?.description || '판매방식'} 가게</p>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body p-4">
                {isLoadingDetail ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <div className="spinner-border text-success" style={{width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <h5 className="text-dark mb-1">상세 정보를 불러오는 중...</h5>
                    <p className="text-muted">잠시만 기다려주세요...</p>
                  </div>
                ) : selectedStoreDetail ? (
                  <div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-geo-alt text-primary"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">주소</label>
                            <p className="mb-0 text-dark">{selectedStoreDetail?.address?.fullAddress || '주소 정보 없음'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-star text-warning"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">평점</label>
                            <p className="mb-0 text-dark fw-bold">{selectedStoreDetail?.rating ? selectedStoreDetail.rating.toFixed(1) : '0.0'}점</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-success bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-shield-check text-success"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">가게 상태</label>
                            <div className="d-flex gap-2">
                              {getStatusBadge(selectedStoreDetail?.status)}
                              {getActivitiesStatusBadge(selectedStoreDetail?.activitiesStatus)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-success bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-calendar3 text-success"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">운영 요일</label>
                            <p className="mb-0 text-dark">{sortDaysByWeekOrder(selectedStoreDetail?.appearanceDays || []).map(day => getDayOfWeekInKorean(day)).join(', ') || '정보 없음'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-info bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-clock text-info"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">운영 시간</label>
                            <p className="mb-0 text-dark">{selectedStoreDetail?.openingHours?.startTime || '정보 없음'} - {selectedStoreDetail?.openingHours?.endTime || '정보 없음'}</p>
                            {selectedStoreDetail?.openingHours?.extra && (
                              <p className="mb-0 text-muted small">{selectedStoreDetail.openingHours.extra}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6 className="fw-bold text-dark mb-3">카테고리</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedStoreDetail?.categories?.map((category, idx) => (
                          <span key={idx} className="badge bg-primary bg-opacity-10 text-primary border rounded-pill px-3 py-2">
                            {category?.name || '카테고리'}
                          </span>
                        )) || <span className="text-muted">카테고리 정보 없음</span>}
                      </div>
                    </div>

                    {selectedStoreDetail?.menus && selectedStoreDetail.menus.length > 0 && (
                      <div className="mt-4">
                        <h6 className="fw-bold text-dark mb-3">메뉴</h6>
                        <div className="row g-3">
                          {selectedStoreDetail.menus.map((menu, idx) => (
                            <div key={idx} className="col-md-6">
                              <div className="card border-0 bg-light">
                                <div className="card-body p-3">
                                  <h6 className="mb-1 fw-bold">{menu?.name || '메뉴명 없음'}</h6>
                                  <p className="text-primary fw-bold mb-1">{menu?.price ? menu.price.toLocaleString() : '0'}원</p>
                                  <p className="text-muted small mb-0">{menu?.description || '설명 없음'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <h6 className="fw-bold text-dark mb-3">결제 방법</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedStoreDetail?.paymentMethods?.map((method, idx) => (
                          <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-3 py-2">
                            {getPaymentMethodInKorean(method)}
                          </span>
                        )) || <span className="text-muted">결제 방법 정보 없음</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="bg-danger bg-opacity-10 rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
                    </div>
                    <h5 className="text-dark mb-2">상세 정보를 불러올 수 없습니다</h5>
                    <p className="text-muted">가게 정보를 다시 확인해주세요.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 bg-light">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={handleCloseModal}>
                  <i className="bi bi-x-lg me-2"></i>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoreHistory;