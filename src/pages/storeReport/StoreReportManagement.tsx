import {useCallback, useState} from 'react';
import storeReportApi from '@/api/storeReportApi';
import {StoreReport} from '@/types/report';
import {getReportReasonBadgeClass} from '@/utils/display/reportDisplay';
import {getStoreTypeBadgeClass, getStoreTypeDisplayName, getStoreTypeIcon} from '@/utils/display/storeDisplay';

import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useCursorPagination from '@/hooks/useCursorPagination';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import UserDetailModal from '@/pages/user/UserDetailModal';
import StoreDetailModal from '@/pages/store/StoreDetailModal';

import {formatDateTimeShortKo as formatDateTime} from '@/utils/dateUtils';

const StoreReportManagement = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const fetchReports = useCallback(
    (cursor: string | null) => storeReportApi.getAllStoreReports(cursor, 20),
    []
  );

  const {
    items: reports,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreReport>({
    fetcher: fetchReports,
    errorMessage: '가게 신고 이력을 불러오는데 실패했습니다.'
  });

  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1
  });

  const getStoreStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; icon: string; text: string }> = {
      ACTIVE: {bg: 'bg-success-subtle text-success-emphasis', icon: 'bi-check-circle-fill', text: '활성'},
      DELETED: {bg: 'bg-danger-subtle text-danger-emphasis', icon: 'bi-trash-fill', text: '삭제됨'},
      INACTIVE: {bg: 'bg-secondary-subtle text-secondary-emphasis', icon: 'bi-pause-circle-fill', text: '비활성'},
    };
    const config = statusConfig[status]
      || {bg: 'bg-secondary-subtle text-secondary-emphasis', icon: 'bi-question-circle-fill', text: status};
    return (
      <span className={`badge ${config.bg}`}>
        <i className={`bi ${config.icon} me-1`}/>
        {config.text}
      </span>
    );
  };

  const handleReporterClick = (reporter: StoreReport['reporter']) => {
    if (!reporter) return;
    setSelectedUser(reporter);
  };

  const handleStoreClick = (store: StoreReport['store']) => {
    if (!store) return;
    setSelectedStore(store);
  };

  const SkeletonCard = () => (
    <div className="col-12 col-lg-6">
      <div className="item-card h-100">
        <div className="item-card__body">
          <div className="d-flex gap-2 mb-2">
            <div className="skeleton-line" style={{width: '80px'}}/>
            <div className="skeleton-line" style={{width: '100px'}}/>
          </div>
          <div className="skeleton-line mb-2" style={{width: '50%'}}/>
          <div className="skeleton-line" style={{width: '100%', height: '40px'}}/>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        description="전체 가게에 접수된 신고 이력입니다. 가게명 또는 신고자를 눌러 상세 정보를 확인할 수 있습니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
      />

      <SectionCard
        title="가게 신고 이력"
        icon="bi-flag-fill"
        aside={reports.length > 0 && (
          <span className="page-count">{reports.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}>
          {error ? (
            <ErrorState message={error} onRetry={refresh}/>
          ) : reports.length === 0 && !isLoading ? (
            <EmptyState
              icon="bi-flag"
              title="신고 이력이 없습니다"
              description="등록된 가게 신고 이력이 없습니다."
            />
          ) : (
            <div className="row g-3">
              {isLoading && reports.length === 0
                ? Array.from({length: 6}).map((_, i) => <SkeletonCard key={i}/>)
                : reports.map((report) => (
                  <div key={report.reportId} className="col-12 col-lg-6">
                    <div className="item-card h-100">
                      <div className="item-card__body">
                        {/* 신고 사유 + 가게 상태 */}
                        <div className="d-flex align-items-center gap-1 mb-2 flex-wrap">
                          <span className={`badge ${getReportReasonBadgeClass(report.reason.type)}`}>
                            <i className="bi bi-flag me-1"/>
                            {report.reason.description}
                          </span>
                          {report.store?.status && getStoreStatusBadge(report.store.status)}
                          {report.store?.storeType && (
                            <span
                              className={`badge ${getStoreTypeBadgeClass(report.store.storeType as any)} text-white`}>
                              <i className={`bi ${getStoreTypeIcon(report.store.storeType as any)} me-1`}/>
                              {getStoreTypeDisplayName(report.store.storeType as any)}
                            </span>
                          )}
                        </div>

                        {/* 가게 정보 */}
                        {report.store ? (
                          <button
                            type="button"
                            className="btn btn-link p-0 text-start item-card__name text-decoration-none"
                            onClick={() => handleStoreClick(report.store)}
                          >
                            <i className="bi bi-shop me-1"/>
                            {report.store.name}
                            <i className="bi bi-box-arrow-up-right ms-1 small"/>
                          </button>
                        ) : (
                          <p className="item-card__desc mb-0">가게 정보 없음 (ID: {report.storeId})</p>
                        )}

                        {/* 카테고리 */}
                        {report.store?.categories && report.store.categories.length > 0 && (
                          <div className="form-chips">
                            {report.store.categories.slice(0, 3).map((cat: any) => (
                              <span key={cat.categoryId} className="form-chip">{cat.name}</span>
                            ))}
                            {report.store.categories.length > 3 && (
                              <span className="form-chip">+{report.store.categories.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* 신고자 + 일시 */}
                        <div className="d-flex justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
                          <div className="small text-secondary">
                            신고자:{' '}
                            {report.reporter ? (
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 align-baseline"
                                onClick={() => handleReporterClick(report.reporter)}
                              >
                                {report.reporter.name}
                                <i className="bi bi-box-arrow-up-right ms-1"/>
                              </button>
                            ) : (
                              <span>알 수 없음</span>
                            )}
                          </div>
                          <span className="small text-secondary">
                            <i className="bi bi-clock me-1"/>
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
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">불러오는 중</span>
                </div>
              )}
            </div>
          )}
        </div>
      </SectionCard>

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
