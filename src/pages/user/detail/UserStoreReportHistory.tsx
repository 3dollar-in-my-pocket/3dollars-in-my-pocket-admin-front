import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback} from 'react';
import storeReportApi from "@/api/storeReportApi";
import {getReportReasonBadgeClass} from '@/utils/display/reportDisplay';

import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";

import {StoreReport, StoreReportReason} from "@/types/report";
import {SimpleStore} from "@/types/store";
import {Address} from "@/types/domain";
import {formatDateTimeKoNoSec as formatDateTime} from '@/utils/dateUtils';

interface UserStoreReportHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 가게 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: SimpleStore) => void) | null;
}

const UserStoreReportHistory = ({userId, isActive, onStoreClick}: UserStoreReportHistoryProps) => {
  const formatAddress = (address?: Address): string => {
    if (!address) return '주소 없음';
    return address.fullAddress || '주소 없음';
  };

  const getReasonBadge = (reason?: StoreReportReason) => {
    if (!reason) return null;

    const reasonText = reason.description
    // getReportReasonBadgeClass는 'bg-primary' 형태를 반환하므로 subtle 배지 클래스로 변환한다
    const color = getReportReasonBadgeClass(reason.type).replace('bg-', '')

    return (
      <span className={`badge bg-${color}-subtle text-${color}-emphasis`}>
        {reasonText}
      </span>
    );
  };


  const fetchUserReports = useCallback(
    (cursor: string | null) => storeReportApi.getUserStoreReports(userId, cursor, 20),
    [userId]
  );

  const {
    items: reports,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    refresh,
    loadMore: handleLoadMore
  } = useCursorPagination<StoreReport>({
    fetcher: fetchUserReports,
    enabled: Boolean(userId && isActive),
    deps: [userId],
    errorMessage: '신고 이력을 불러오는데 실패했습니다.'
  });

  return (
    <HistoryPanel
      title="가게 신고 이력"
      icon="bi-shield-exclamation"
      count={reports.length}
      totalCount={totalCount}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onRefresh={refresh}
      onLoadMore={handleLoadMore}
      emptyTitle="신고한 가게가 없습니다"
      emptyDescription="아직 신고한 가게가 없습니다."
    >
      {reports.map((report, index) => (
        <div key={report.reportId || index} className="item-card mb-3">
          <div className="item-card__body">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div className="min-w-0">
                {report.store && onStoreClick ? (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStoreClick(report.store);
                    }}
                  >
                    {report.store.name || '가게 정보 없음'}
                    <i className="bi bi-box-arrow-up-right ms-1"/>
                  </button>
                ) : (
                  <h3 className="item-card__name">{report.store?.name || '가게 정보 없음'}</h3>
                )}
                <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                  {getReasonBadge(report.reason)}
                  {report.store?.storeType && <StoreTypeBadge storeType={report.store.storeType}/>}
                </div>
              </div>
              <span className="badge bg-light text-dark border flex-shrink-0">
                #{report.reportId}
              </span>
            </div>

            {report.store && (
              <>
                <p className="item-card__desc">
                  <i className="bi bi-geo-alt me-1"/>
                  {formatAddress(report.store.address)}
                </p>

                {report.store.categories && report.store.categories.length > 0 && (
                  <div className="d-flex align-items-center flex-wrap gap-1 mt-2">
                    <span className="item-card__desc mt-0">
                      <i className="bi bi-tags me-1"/>
                      분류
                    </span>
                    {report.store.categories.slice(0, 3).map((category, catIndex) => (
                      <span key={catIndex} className="badge bg-secondary-subtle text-secondary-emphasis">
                        {category.name}
                      </span>
                    ))}
                    {report.store.categories.length > 3 && (
                      <span className="badge bg-secondary-subtle text-secondary-emphasis">
                        +{report.store.categories.length - 3}개
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            <p className="item-card__desc">
              <i className="bi bi-calendar3 me-1"/>
              신고일: {formatDateTime(report.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </HistoryPanel>
  );
};

export default UserStoreReportHistory;
