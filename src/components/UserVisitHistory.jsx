import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import {getActivitiesStatusDisplayName, getStoreStatusBadgeClass, getStoreStatusDisplayName} from "../types/store";
import visitApi from "../api/visitApi";

const UserVisitHistory = ({userId, isActive}) => {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (userId && isActive) {
      fetchVisits(true);
    }
  }, [userId, isActive]);

  const fetchVisits = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await visitApi.getUserVisits(userId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('방문 이력을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const {contents = [], cursor: newCursor = {}} = response.data || {};

      if (reset) {
        setVisits(contents);
      } else {
        setVisits(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
      setTotalCount(newCursor.totalCount || 0);
    } catch (error) {
      toast.error('방문 이력을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchVisits(false);
    }
  }, [hasMore, isLoading, fetchVisits]);

  const handleScroll = useCallback((e) => {
    const {scrollTop, scrollHeight, clientHeight} = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading, handleLoadMore]);

  const handleVisitClick = (visit) => {
    setSelectedVisit(visit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVisit(null);
  };

  const getSalesTypeBadge = (salesType) => {
    if (!salesType) return null;
    const badgeClass = 'bg-info';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {salesType.description || salesType.type}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const badgeClass = getStoreStatusBadgeClass(status);
    const statusText = getStoreStatusDisplayName(status);
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {statusText}
      </span>
    );
  };

  const getActivitiesStatusBadge = (activitiesStatus) => {
    if (!activitiesStatus) return null;
    const badgeClass = getStoreStatusBadgeClass(activitiesStatus);
    const statusText = getActivitiesStatusDisplayName(activitiesStatus);
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {statusText}
      </span>
    );
  };

  const getVisitTypeBadge = (visitType) => {
    if (!visitType) return null;
    const badgeClass = visitType === 'EXISTS' ? 'bg-success' :
      visitType === 'NOT_EXISTS' ? 'bg-danger' : 'bg-secondary';
    const statusText = visitType === 'EXISTS' ? '방문 성공' :
      visitType === 'NOT_EXISTS' ? '방문 실패' : '알 수 없음';
    const iconClass = visitType === 'EXISTS' ? 'bi-check-circle' :
      visitType === 'NOT_EXISTS' ? 'bi-x-circle' : 'bi-question-circle';

    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        <i className={`bi ${iconClass} me-1`}></i>
        {statusText}
      </span>
    );
  };

  const formatVisitDateTime = (dateTimeString) => {
    if (!dateTimeString) return '방문 시간 없음';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="px-4 pt-4">
        <div className="d-flex align-items-center justify-content-between mb-4 p-4 rounded-4 shadow-sm"
             style={{
               background: 'linear-gradient(135deg, #fff3cd 0%, #f8fffe 100%)',
               border: '1px solid rgba(255, 193, 7, 0.2)'
             }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle p-3 shadow-sm"
                 style={{background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)'}}>
              <i className="bi bi-geo-alt text-white fs-5"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">방문 이력</h6>
              <small className="text-muted">사용자의 가게 방문 기록을 확인하세요</small>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning px-3 py-2 rounded-pill shadow-sm" style={{fontSize: '0.9rem'}}>
                <i className="bi bi-pin-map me-1"></i>
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
        style={{maxHeight: '500px', overflowY: 'auto'}}
      >
        {visits.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle mx-auto mb-4" style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-geo-alt fs-1 text-secondary"></i>
            </div>
            <h5 className="text-dark mb-2">방문 이력이 없습니다</h5>
            <p className="text-muted">아직 방문한 가게가 없습니다.</p>
          </div>
        ) : (
          <div>
            {visits.map((visit, index) => (
              <div key={visit.visitId || index}>
                <div
                  className="visit-item p-3 border-bottom bg-white"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: visit.type === 'EXISTS' ? '4px solid #28a745' : '4px solid #dc3545'
                  }}
                  onClick={() => handleVisitClick(visit)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="mb-0 fw-bold text-dark">{visit.store?.name || '가게 이름 없음'}</h6>
                        {getVisitTypeBadge(visit.type)}
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-calendar3 text-muted"></i>
                        <span className="text-dark fw-medium">{formatVisitDateTime(visit.visitAt)}</span>
                      </div>

                      <div className="text-muted small mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        {visit.store?.address?.fullAddress || '주소 정보 없음'}
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        {getSalesTypeBadge(visit.store?.salesType)}
                        {getStatusBadge(visit.store?.status)}
                        {getActivitiesStatusBadge(visit.store?.activitiesStatus)}
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-star text-warning"></i>
                        <span className="text-dark small fw-medium">
                          평점: {visit.store?.rating ? visit.store.rating.toFixed(1) : '0.0'}점
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-1">
                        {visit.store?.categories?.slice(0, 2).map((category, idx) => (
                          <span key={idx}
                                className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-2 py-1"
                                style={{fontSize: '0.7rem'}}>
                            {category?.name || '카테고리'}
                          </span>
                        ))}
                        {visit.store?.categories && visit.store.categories.length > 2 && (
                          <span className="badge bg-light text-muted border rounded-pill px-2 py-1"
                                style={{fontSize: '0.7rem'}}>
                            +{visit.store.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <button
                        className="btn btn-outline-warning btn-sm rounded-pill px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVisitClick(visit);
                        }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && visits.length > 0 && (
          <div className="text-center p-3 bg-light">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small text-muted mt-2 mb-0">추가 데이터 로딩 중...</p>
          </div>
        )}

        {isLoading && visits.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-warning" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">방문 이력을 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요...</p>
          </div>
        )}
      </div>

      {/* 방문 이력 상세 모달 */}
      {showModal && selectedVisit && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0"
                   style={{background: selectedVisit.type === 'EXISTS' ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'}}>
                <div className="w-100">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div>
                      <h4 className="mb-0 fw-bold">{selectedVisit?.store?.name || '가게 이름 없음'}</h4>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <i className="bi bi-calendar3 opacity-90"></i>
                        <span className="opacity-90">{formatVisitDateTime(selectedVisit.visitAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-geo-alt text-primary"></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">주소</label>
                        <p className="mb-0 text-dark">{selectedVisit?.store?.address?.fullAddress || '주소 정보 없음'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-star text-warning"></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">가게 평점</label>
                        <p
                          className="mb-0 text-dark fw-bold">{selectedVisit?.store?.rating ? selectedVisit.store.rating.toFixed(1) : '0.0'}점</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-calendar-check text-info"></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">방문 시간</label>
                        <p className="mb-0 text-dark fw-bold">{formatVisitDateTime(selectedVisit.visitAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div
                        className={`${selectedVisit.type === 'EXISTS' ? 'bg-success' : 'bg-danger'} bg-opacity-10 rounded-circle p-2`}>
                        <i
                          className={`bi ${selectedVisit.type === 'EXISTS' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'}`}></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">방문 결과</label>
                        <div>
                          {getVisitTypeBadge(selectedVisit.type)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-shield-check text-success"></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">가게 상태</label>
                        <div className="d-flex gap-2 flex-wrap">
                          {getSalesTypeBadge(selectedVisit?.store?.salesType)}
                          {getStatusBadge(selectedVisit?.store?.status)}
                          {getActivitiesStatusBadge(selectedVisit?.store?.activitiesStatus)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="fw-bold text-dark mb-3">가게 카테고리</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedVisit?.store?.categories?.map((category, idx) => (
                      <span key={idx}
                            className="badge bg-primary bg-opacity-10 text-primary border rounded-pill px-3 py-2">
                        {category?.name || '카테고리'}
                      </span>
                    )) || <span className="text-muted">카테고리 정보 없음</span>}
                  </div>
                </div>

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

export default UserVisitHistory;
