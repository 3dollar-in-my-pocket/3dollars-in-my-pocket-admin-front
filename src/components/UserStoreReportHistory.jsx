import { useState, useEffect, useCallback } from 'react';
import userApi from '../api/userApi';
import { toast } from 'react-toastify';

const UserStoreReportHistory = ({ userId, isActive }) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    if (!address) return '주소 없음';
    return address.fullAddress || '주소 정보 없음';
  };

  const getReasonBadge = (reason) => {
    if (!reason) return null;

    const reasonTypes = {
      'NOSTORE': { text: '없어진 가게', color: 'danger' },
      'WRONGINFO': { text: '잘못된 정보', color: 'warning' },
      'INAPPROPRIATE': { text: '부적절한 내용', color: 'secondary' }
    };

    const reasonInfo = reasonTypes[reason.type] || { text: reason.description || '기타', color: 'info' };

    return (
      <span className={`badge bg-${reasonInfo.color} bg-opacity-10 text-${reasonInfo.color} border border-${reasonInfo.color} rounded-pill px-2 py-1`} style={{ fontSize: '0.7rem' }}>
        {reasonInfo.text}
      </span>
    );
  };

  const fetchReports = useCallback(async (isLoadMore = false) => {
    if (!userId || !isActive) return;

    if (isLoadMore && !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await userApi.getUserStoreReports(
        userId,
        isLoadMore ? cursor : null,
        20
      );

      if (!response.ok) {
        if (response.status >= 400) {
          const errorMessage = response.status === 404
            ? '신고 이력 정보를 찾을 수 없습니다.'
            : response.status === 403
            ? '신고 이력 정보에 대한 접근 권한이 없습니다.'
            : `서버 오류가 발생했습니다. (${response.status})`;

          toast.error(errorMessage);
          setError(errorMessage);
          return;
        }
      }

      const data = response.data;

      if (isLoadMore) {
        setReports(prev => [...prev, ...(data.contents || [])]);
      } else {
        setReports(data.contents || []);
        setTotalCount(data.cursor?.totalCount || 0);
      }

      setCursor(data.cursor?.nextCursor || null);
      setHasMore(data.cursor?.hasMore || false);
    } catch (error) {
      console.error('신고 이력 조회 실패:', error);
      const errorMessage = error.response?.status
        ? `서버 오류가 발생했습니다. (${error.response.status})`
        : '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isActive]);

  useEffect(() => {
    if (isActive && reports.length === 0 && !isLoading) {
      fetchReports();
    }
  }, [isActive, fetchReports]);

  const handleLoadMore = () => {
    fetchReports(true);
  };

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
          </div>
        </div>
        <h5 className="text-dark mb-2">오류가 발생했습니다</h5>
        <p className="text-muted mb-3">{error}</p>
        <button
          className="btn btn-outline-primary rounded-pill px-4"
          onClick={() => {
            setReports([]);
            setCursor(null);
            setError(null);
            fetchReports();
          }}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          다시 시도
        </button>
      </div>
    );
  }

  if (isLoading && reports.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="spinner-border text-danger" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <h5 className="text-dark mb-1">가게 신고 이력을 불러오는 중...</h5>
        <p className="text-muted">잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="bg-light rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <i className="bi bi-shield-exclamation fs-1 text-secondary"></i>
        </div>
        <h5 className="text-dark mb-2">신고한 가게가 없습니다</h5>
        <p className="text-muted">아직 신고한 가게가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      <div className="d-flex justify-content-between align-items-center mb-3 pt-3">
        <div className="d-flex align-items-center gap-2">
          <h6 className="mb-0 fw-bold text-dark">가게 신고 이력</h6>
          <span className="badge bg-danger ms-2 px-2 py-1 rounded-pill">
            총 {totalCount}건
          </span>
        </div>
      </div>

      <div className="list-group list-group-flush">
        {reports.map((report, index) => (
          <div key={report.reportId || index} className="list-group-item border-0 px-0 py-3">
            <div className="card border-0 shadow-sm" style={{
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
              borderRadius: '16px'
            }}>
              <div className="card-body p-4">
                <div className="d-flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-shield-exclamation text-danger"></i>
                    </div>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold text-dark mb-1">
                          {report.store?.name || '가게 정보 없음'}
                        </h6>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {getReasonBadge(report.reason)}
                        </div>
                      </div>
                      <span className="badge bg-light text-muted rounded-pill px-2 py-1 small">
                        #{report.reportId}
                      </span>
                    </div>

                    {report.store && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="text-muted small">
                            <i className="bi bi-geo-alt me-1"></i>
                            주소:
                          </span>
                          <span className="text-dark small">
                            {formatAddress(report.store.address)}
                          </span>
                        </div>

                        {report.store.categories && report.store.categories.length > 0 && (
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="text-muted small">
                              <i className="bi bi-tags me-1"></i>
                              분류:
                            </span>
                            <div className="d-flex gap-1">
                              {report.store.categories.slice(0, 3).map((category, catIndex) => (
                                <span key={catIndex} className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                  {category.name}
                                </span>
                              ))}
                              {report.store.categories.length > 3 && (
                                <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                  +{report.store.categories.length - 3}개
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3 text-muted small">
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          신고일: {formatDateTime(report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-3">
          <button
            className="btn btn-outline-primary rounded-pill px-4"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </span>
                불러오는 중...
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg me-2"></i>
                더 보기
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserStoreReportHistory;