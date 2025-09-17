import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import storeReportApi from "../api/storeReportApi";
import {getReportReasonBadgeClass} from "../types/report";
import {getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon} from "../types/store";

const StoreReportHistory = ({storeId, isActive}) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (storeId && isActive) {
      fetchReports(true);
    }
  }, [storeId, isActive]);

  const fetchReports = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await storeReportApi.getStoreReports(storeId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('신고 이력을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const {contents = [], cursor: newCursor = {}} = response.data || {};

      if (reset) {
        setReports(contents);
      } else {
        setReports(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
      setTotalCount(newCursor.totalCount || 0);
    } catch (error) {
      toast.error('신고 이력을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchReports(false);
    }
  }, [hasMore, isLoading, fetchReports]);

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

  const getReportTypeBadge = (reason) => {
    const reasonText = reason.description
    const reportBadgeClass = getReportReasonBadgeClass(reason.type)

    return (
      <span className={`badge ${reportBadgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        <i className="bi bi-flag me-1"></i>
        {reasonText}
      </span>
    );
  };

  const getStoreTypeBadge = (storeType) => {
    if (!storeType) return null;
    return (
      <span className={`badge ${getStoreTypeBadgeClass(storeType)} text-white rounded-pill px-2 py-1 small`}>
        <i className={`bi ${getStoreTypeIcon(storeType)} me-1`}></i>
        {getStoreTypeDisplayName(storeType)}
      </span>
    );
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    setShowModal(false);
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          {totalCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              총 {totalCount.toLocaleString()}개
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <button
            className="btn btn-outline-danger btn-sm rounded-pill px-3"
            onClick={() => fetchReports(true)}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            새로고침
          </button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="report-container"
        style={{maxHeight: '600px', overflowY: 'auto'}}
      >
        {reports.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle mx-auto mb-4" style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-shield-exclamation fs-1 text-secondary"></i>
            </div>
            <h5 className="text-dark mb-2">신고 이력이 없습니다</h5>
            <p className="text-muted">아직 이 가게에 대한 신고가 없습니다.</p>
          </div>
        ) : (
          <div className="row g-3">
            {reports.map((report, index) => (
              <div key={report.reportId || index} className="col-12">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f2 100%)'
                  }}
                  onClick={() => handleReportClick(report)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                          <i className="bi bi-exclamation-triangle text-danger fs-5"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold text-dark mb-2">
                              {report.reporter?.name || '익명 신고자'}
                            </h6>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              {getReportTypeBadge(report.reason)}
                              {report.store?.storeType && getStoreTypeBadge(report.store.storeType)}
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              {formatDateTime(report.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            {report.priority && (
                              <span className={`badge rounded-pill px-2 py-1 ${
                                report.priority === 'HIGH' ? 'bg-danger bg-opacity-10 text-danger border border-danger' :
                                  report.priority === 'MEDIUM' ? 'bg-warning bg-opacity-10 text-warning border border-warning' :
                                    'bg-secondary bg-opacity-10 text-secondary border border-secondary'
                              }`}>
                                <i className={`bi ${
                                  report.priority === 'HIGH' ? 'bi-exclamation-triangle' :
                                    report.priority === 'MEDIUM' ? 'bi-exclamation-circle' :
                                      'bi-info-circle'
                                } me-1`}></i>
                                {report.priority === 'HIGH' ? '높음' : report.priority === 'MEDIUM' ? '보통' : '낮음'}
                              </span>
                            )}
                          </div>
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReportClick(report);
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
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && reports.length > 0 && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-danger rounded-pill px-4 py-2"
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
                  더 많은 신고 보기
                </>
              )}
            </button>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && reports.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-danger" style={{width: '2rem', height: '2rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p className="text-muted">신고 이력을 불러오는 중...</p>
          </div>
        )}
      </div>

      {/* 신고 상세 모달 */}
      {showModal && selectedReport && (
        <div
          className="modal fade show"
          style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-shield-exclamation text-danger me-2"></i>
                  신고 상세 정보
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">신고자명</label>
                    <p className="form-control-plaintext">{selectedReport.reporter?.name || '익명'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">신고 사유</label>
                    <p className="form-control-plaintext">{selectedReport.reason?.description || '알 수 없음'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">신고 일시</label>
                    <p className="form-control-plaintext">{formatDateTime(selectedReport.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게 타입</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedReport.store?.storeType ? (
                        getStoreTypeBadge(selectedReport.store.storeType)
                      ) : (
                        <span className="text-muted">정보 없음</span>
                      )}
                      {selectedReport.store?.name && (
                        <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                          <i className="bi bi-shop me-1"></i>
                          {selectedReport.store.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">신고 사유</label>
                    <div className="border rounded p-3 bg-light">
                      <p className="mb-0">{selectedReport.reason?.description || '사유가 제공되지 않았습니다.'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
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

export default StoreReportHistory;
