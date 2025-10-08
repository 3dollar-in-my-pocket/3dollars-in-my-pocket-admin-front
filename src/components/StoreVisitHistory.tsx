import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import visitApi from "../api/visitApi";

const StoreVisitHistory = ({storeId, isActive, onAuthorClick}) => {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (storeId && isActive) {
      fetchVisits(true);
    }
  }, [storeId, isActive]);

  const fetchVisits = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await visitApi.getStoreVisits(storeId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('방문 목록을 불러오는 중 오류가 발생했습니다.');
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
      toast.error('방문 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchVisits(false);
    }
  }, [hasMore, isLoading, fetchVisits]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisitTypeBadge = (visitType) => {
    const typeMap = {
      'EXISTS': {text: '방문 성공', class: 'bg-success', icon: 'bi-check-circle'},
      'NOT_EXISTS': {text: '방문 실패', class: 'bg-danger', icon: 'bi-x-circle'},
      'UNKNOWN': {text: '확인 불가', class: 'bg-warning', icon: 'bi-question-circle'}
    };

    const visitTypeInfo = typeMap[visitType?.type] || {
      text: visitType?.description || '알 수 없음',
      class: 'bg-secondary',
      icon: 'bi-info-circle'
    };

    return (
      <span className={`badge ${visitTypeInfo.class} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        <i className={`bi ${visitTypeInfo.icon} me-1`}></i>
        {visitTypeInfo.text}
      </span>
    );
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          {totalCount > 0 && (
            <span className="badge bg-warning rounded-pill">
              총 {totalCount.toLocaleString()}개
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <button
            className="btn btn-outline-warning btn-sm rounded-pill px-3"
            onClick={() => fetchVisits(true)}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            새로고침
          </button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="visit-container"
        style={{maxHeight: '600px', overflowY: 'auto'}}
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
            <h5 className="text-dark mb-2">방문 기록이 없습니다</h5>
            <p className="text-muted">아직 이 가게에 방문한 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="row g-3">
            {visits.map((visit, index) => (
              <div key={visit.visitId || index} className="col-12">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fff8e1 100%)'
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                          <i className="bi bi-geo-alt text-warning fs-5"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <div className="bg-warning bg-opacity-10 rounded-circle p-1">
                                <i className="bi bi-person-fill text-warning" style={{ fontSize: '0.8rem' }}></i>
                              </div>
                              <div
                                className={`d-flex align-items-center gap-1 ${visit.visitor && onAuthorClick ? 'clickable-author' : ''}`}
                                style={{
                                  cursor: visit.visitor && onAuthorClick ? 'pointer' : 'default',
                                  padding: '3px 6px',
                                  borderRadius: '5px',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: 'transparent'
                                }}
                                onClick={(e) => {
                                  if (visit.visitor && onAuthorClick) {
                                    e.stopPropagation();
                                    onAuthorClick(visit.visitor);
                                  }
                                }}
                                onMouseEnter={(e: any) => {
                                  if (visit.visitor && onAuthorClick) {
                                    e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                  }
                                }}
                                onMouseLeave={(e: any) => {
                                  if (visit.visitor && onAuthorClick) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }
                                }}
                              >
                                <span className="text-muted small">방문자:</span>
                                <h6 className={`fw-bold mb-0 ${visit.visitor && onAuthorClick ? 'text-primary' : 'text-dark'}`}>
                                  {visit.visitor?.name || '익명 사용자'}
                                </h6>
                                {visit.visitor && onAuthorClick && (
                                  <i className="bi bi-box-arrow-up-right text-primary" style={{ fontSize: '0.7rem' }}></i>
                                )}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              {getVisitTypeBadge(visit.visitType)}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="mb-1">
                              <span className="text-muted small">
                                <i className="bi bi-calendar me-1"></i>
                                방문일: {formatDateTime(visit.visitDateTime)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {visit.device && (
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1">
                              <i className="bi bi-phone me-1"></i>
                              {visit.device.os || 'Unknown'} {visit.device.version && `v${visit.device.version}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && visits.length > 0 && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-warning rounded-pill px-4 py-2"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  로딩 중...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-down-circle me-2"></i>
                  더 많은 방문 기록 보기
                </>
              )}
            </button>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && visits.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-warning" style={{width: '2rem', height: '2rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p className="text-muted">방문 기록을 불러오는 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreVisitHistory;
