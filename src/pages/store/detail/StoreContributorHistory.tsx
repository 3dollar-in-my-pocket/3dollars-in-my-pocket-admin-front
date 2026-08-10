import {useCallback} from 'react';
import storeApi from '@/api/storeApi';
import {ActivityAuthor, Writer} from '@/types/domain';
import {StoreChangeHistory} from '@/types/storeChangeHistory';
import {getChangeAttributeIcon} from '@/utils/display/storeDisplay';

import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import {formatDateTimeShortKo as formatDateTime} from '@/utils/dateUtils';

interface StoreContributorHistoryProps {
  storeId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 기여자 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
}

const StoreContributorHistory = ({storeId, isActive, onAuthorClick}: StoreContributorHistoryProps) => {
  const fetchChangeHistories = useCallback(
    (cursor: string | null) => storeApi.getStoreChangeHistories(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: histories,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreChangeHistory>({
    fetcher: fetchChangeHistories,
    enabled: Boolean(storeId && isActive),
    deps: [storeId],
    errorMessage: '변경 이력을 불러오는데 실패했습니다.'
  });

  const handleAuthorClick = (actor: Writer) => {
    if (onAuthorClick && actor.writerType === 'USER') {
      onAuthorClick({
        userId: actor.writerId,
        name: actor.name,
        writerType: actor.writerType
      });
    }
  };

  if (!isActive) return null;

  return (
    <HistoryPanel
      title="변경 이력"
      icon="bi-people"
      count={histories.length}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onRefresh={refresh}
      onLoadMore={loadMore}
      emptyTitle="변경 이력이 없습니다"
      emptyDescription="아직 등록된 변경 이력이 없습니다."
    >
      {histories.map((history, index) => {
        const isClickableActor = Boolean(history.actor.writerType === 'USER' && onAuthorClick);

        return (
          <div key={index} className="item-card mb-3">
            <div className="item-card__body">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
                  <span className="item-card__desc mt-0">
                    <i className="bi bi-pencil-square me-1"/>
                    수정자
                  </span>
                  {isClickableActor ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAuthorClick(history.actor);
                      }}
                    >
                      {history.actor.name}
                      <i className="bi bi-box-arrow-up-right ms-1"/>
                    </button>
                  ) : (
                    <h3 className="item-card__name">{history.actor.name}</h3>
                  )}
                </div>
                <span className="item-card__desc mt-0 flex-shrink-0">
                  <i className="bi bi-clock me-1"/>
                  {formatDateTime(history.changedAt)}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-1 mt-2">
                {history.changeAttributes.map((attr, attrIndex) => (
                  <span key={attrIndex} className="badge bg-primary-subtle text-primary-emphasis">
                    <i className={`bi ${getChangeAttributeIcon(attr.type)} me-1`}/>
                    {attr.description}
                  </span>
                ))}
              </div>

              <p className="item-card__desc">
                <i className="bi bi-info-circle me-1"/>
                {history.changeAttributes.length}개 항목 수정
              </p>
            </div>
          </div>
        );
      })}
    </HistoryPanel>
  );
};

export default StoreContributorHistory;
