import {getVisitIconClass, getVisitTypeBatchClass, getVisitTypeDisplayName} from '../../../utils/display/visitDisplay';
import {useCallback, useRef} from 'react';
import visitApi from "../../../api/visitApi";
import {Visit, VisitType} from "../../../types/visit";
import {ActivityAuthor} from "../../../types/domain";
import useCursorPagination from "../../../hooks/useCursorPagination";
import {formatDateTimeShortKo} from "../../../utils/dateUtils";

interface StoreVisitHistoryProps {
  storeId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 방문자 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
}

const StoreVisitHistory = ({storeId, isActive, onAuthorClick}: StoreVisitHistoryProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchVisits = useCallback(
    (cursor: string | null) => visitApi.getStoreVisits(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: visits,
    isLoading,
    hasMore,
    totalCount,
    refresh,
    loadMore
  } = useCursorPagination<Visit>({
    fetcher: fetchVisits,
    enabled: Boolean(storeId && isActive),
    deps: [storeId]
  });

  const getVisitTypeBadge = (visitType?: VisitType) => {
    if (!visitType) return null;

    return (
      <span
        className={`badge ${getVisitTypeBatchClass(visitType.type)} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        <i className={`bi ${getVisitIconClass(visitType.type)} me-1`}></i>
        {visitType.description || getVisitTypeDisplayName(visitType.type)}
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
            onClick={refresh}
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
                                <i className="bi bi-person-fill text-warning" style={{fontSize: '0.8rem'}}></i>
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
                                <h6
                                  className={`fw-bold mb-0 ${visit.visitor && onAuthorClick ? 'text-primary' : 'text-dark'}`}>
                                  {visit.visitor?.name || '익명 사용자'}
                                </h6>
                                {visit.visitor && onAuthorClick && (
                                  <i className="bi bi-box-arrow-up-right text-primary" style={{fontSize: '0.7rem'}}></i>
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
                                방문일: {formatDateTimeShortKo(visit.visitDateTime)}
                              </span>
                            </div>
                          </div>
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
        {hasMore && visits.length > 0 && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-warning rounded-pill px-4 py-2"
              onClick={loadMore}
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
