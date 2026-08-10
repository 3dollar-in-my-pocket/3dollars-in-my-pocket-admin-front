import {getVisitIconClass, getVisitTypeDisplayName} from '@/utils/display/visitDisplay';
import {useCallback} from 'react';
import visitApi from "@/api/visitApi";
import {Visit, VisitType} from "@/types/visit";
import {ActivityAuthor} from "@/types/domain";
import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";
import {formatDateTimeShortKo} from "@/utils/dateUtils";

interface StoreVisitHistoryProps {
  storeId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 방문자 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
}

const StoreVisitHistory = ({storeId, isActive, onAuthorClick}: StoreVisitHistoryProps) => {
  const fetchVisits = useCallback(
    (cursor: string | null) => visitApi.getStoreVisits(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: visits,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<Visit>({
    fetcher: fetchVisits,
    enabled: Boolean(storeId && isActive),
    deps: [storeId],
    errorMessage: '방문 기록을 불러오는데 실패했습니다.'
  });

  const getVisitTypeBadge = (visitType?: VisitType) => {
    if (!visitType) return null;

    return (
      <span className="badge bg-warning-subtle text-warning-emphasis">
        <i className={`bi ${getVisitIconClass(visitType.type)} me-1`}/>
        {visitType.description || getVisitTypeDisplayName(visitType.type)}
      </span>
    );
  };

  if (!isActive) {
    return null;
  }

  return (
    <HistoryPanel
      title="방문 기록"
      icon="bi-geo-alt"
      count={visits.length}
      totalCount={totalCount}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onRefresh={refresh}
      onLoadMore={loadMore}
      emptyTitle="방문 기록이 없습니다"
      emptyDescription="아직 이 가게에 방문한 기록이 없습니다."
    >
      {visits.map((visit, index) => (
        <div key={visit.visitId || index} className="item-card mb-3">
          <div className="item-card__body">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
                <span className="item-card__desc mt-0">방문자</span>
                {visit.visitor && onAuthorClick ? (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAuthorClick(visit.visitor);
                    }}
                  >
                    {visit.visitor.name}
                    <i className="bi bi-box-arrow-up-right ms-1"/>
                  </button>
                ) : (
                  <h3 className="item-card__name">{visit.visitor?.name || '익명 사용자'}</h3>
                )}
                {getVisitTypeBadge(visit.visitType)}
              </div>
              <span className="item-card__desc mt-0 flex-shrink-0">
                <i className="bi bi-calendar me-1"/>
                {formatDateTimeShortKo(visit.visitDateTime)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </HistoryPanel>
  );
};

export default StoreVisitHistory;
