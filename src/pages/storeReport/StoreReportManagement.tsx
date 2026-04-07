import { useEffect, useState, useCallback, useRef } from 'react';
import storeReportApi from '../../api/storeReportApi';
import { AllStoreReport } from '../../types/report';
import { getReportReasonBadgeClass } from '../../types/report';
import { getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon } from '../../types/store';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import EmptyState from '../../components/common/EmptyState';
import UserDetailModal from '../user/UserDetailModal';
import StoreDetailModal from '../store/StoreDetailModal';

const StoreReportManagement = () => {
  const [reports, setReports] = useState<AllStoreReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const fetchReports = useCallback(async (reset = false) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await storeReportApi.getAllStoreReports(reset ? null : cursorRef.current, 20);
      if (!response?.ok) return;

      const { contents = [], cursor: newCursor } = response.data || { contents: [], cursor: { hasMore: false, nextCursor: null } };

      if (reset) {
        setReports(contents);
        cursorRef.current = null;
      } else {
        setReports(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      cursorRef.current = newCursor.nextCursor || null;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(true);
  }, [fetchReports]);

  const { scrollContainerRef, loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchReports(false),
    threshold: 0.1
  });

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStoreStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; icon: string; text: string }> = {
      ACTIVE: { bg: 'bg-success', icon: 'bi-check-circle-fill', text: '활성' },
      DELETED: { bg: 'bg-danger', icon: 'bi-trash-fill', text: '삭제됨' },
      INACTIVE: { bg: 'bg-secondary', icon: 'bi-pause-circle-fill', text: '비활성' },
    };
    const config = statusConfig[status] || { bg: 'bg-secondary', icon: 'bi-question-circle-fill', text: status };
    return (
      <span className={`badge rounded-pill ${config.bg} text-white px-2 py-1`} style={{ fontSize: '0.7rem' }}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const handleReporterClick = (reporter: AllStoreReport['reporter']) => {
    if (!reporter) return;
    setSelectedUser(reporter);
  };

  const handleStoreClick = (store: AllStoreReport['store']) => {
    if (!store) return;
    setSelectedStore(store);
  };

  const SkeletonCard = () => (
    <div className="col-12 col-lg-6">
      <div className="card border-0 shadow-sm" style={{ background: '#f8f9fa' }}>
        <div className="card-body p-3">
          <div className="d-flex gap-2 mb-2">
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{ width: '80px', height: '22px' }}></div>
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{ width: '100px', height: '22px' }}></div>
          </div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ width: '50%', height: '18px' }}></div>
          <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '100%', height: '40px' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-flag-fill text-danger me-2"></i>
          전체 가게 신고 이력
        </h4>
        <button
          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
          onClick={() => fetchReports(true)}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          새로고침
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      >
        {reports.length === 0 && !isLoading ? (
          <EmptyState
            icon="bi-flag"
            title="신고 이력이 없습니다"
            description="등록된 가게 신고 이력이 없습니다."
          />
        ) : (
          <div className="row g-3">
            {isLoading && reports.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : reports.map((report) => (
                <div key={report.reportId} className="col-12 col-lg-6">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f2 100%)' }}
                  >
                    <div className="card-body p-3">
                      {/* 신고 사유 + 가게 상태 */}
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <span className={`badge ${getReportReasonBadgeClass(report.reason.type)} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
                          <i className="bi bi-flag me-1"></i>
                          {report.reason.description}
                        </span>
                        {report.store?.status && getStoreStatusBadge(report.store.status)}
                        {report.store?.storeType && (
                          <span className={`badge ${getStoreTypeBadgeClass(report.store.storeType as any)} text-white rounded-pill px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                            <i className={`bi ${getStoreTypeIcon(report.store.storeType as any)} me-1`}></i>
                            {getStoreTypeDisplayName(report.store.storeType as any)}
                          </span>
                        )}
                      </div>

                      {/* 가게 정보 */}
                      <div className="mb-2">
                        <span className="text-muted small me-1">가게:</span>
                        {report.store ? (
                          <span
                            className="fw-semibold text-primary"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleStoreClick(report.store)}
                          >
                            <i className="bi bi-shop me-1"></i>
                            {report.store.name}
                            <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.7rem' }}></i>
                          </span>
                        ) : (
                          <span className="text-muted small">정보 없음 (storeId: {report.storeId})</span>
                        )}
                      </div>

                      {/* 카테고리 */}
                      {report.store?.categories && report.store.categories.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {report.store.categories.slice(0, 3).map((cat: any) => (
                            <span key={cat.categoryId} className="badge bg-light text-dark border rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                              {cat.name}
                            </span>
                          ))}
                          {report.store.categories.length > 3 && (
                            <span className="badge bg-light text-muted border rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                              +{report.store.categories.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <hr className="my-2" />

                      {/* 신고자 + 일시 */}
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted small me-1">신고자:</span>
                          {report.reporter ? (
                            <span
                              className="text-primary small fw-semibold"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleReporterClick(report.reporter)}
                            >
                              {report.reporter.name}
                              <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.65rem' }}></i>
                            </span>
                          ) : (
                            <span className="text-muted small">알 수 없음</span>
                          )}
                        </div>
                        <span className="text-muted small">
                          <i className="bi bi-clock me-1"></i>
                          {formatDateTime(report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {hasMore && reports.length > 0 && (
          <div ref={loadMoreRef} className="text-center py-3">
            {isLoading && (
              <div className="spinner-border spinner-border-sm text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          show={!!selectedUser}
          user={selectedUser}
          onHide={() => setSelectedUser(null)}
          onStoreClick={(store: any) => {
            setSelectedUser(null);
            setSelectedStore(store);
          }}
        />
      )}

      {selectedStore && (
        <StoreDetailModal
          show={!!selectedStore}
          store={selectedStore}
          onHide={() => setSelectedStore(null)}
          onAuthorClick={(user: any) => {
            setSelectedStore(null);
            setSelectedUser(user);
          }}
          onStoreDeleted={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
};

export default StoreReportManagement;
