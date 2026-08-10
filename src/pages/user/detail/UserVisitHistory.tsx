import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";
import {getActivitiesStatusBadgeClass, getActivitiesStatusDisplayName} from '@/utils/display/storeDisplay';
import {getVisitIconClass, getVisitTypeBatchClass, getVisitTypeDisplayName} from '@/utils/display/visitDisplay';

import {Visit, VisitType} from "@/types/visit";
import {ActivitiesStatus, SimpleStore} from "@/types/store";
import visitApi from "@/api/visitApi";

interface UserVisitHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 가게 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: SimpleStore) => void) | null;
}

const UserVisitHistory = ({userId, isActive, onStoreClick}: UserVisitHistoryProps) => {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUserVisits = useCallback(
    (cursor: string | null) => visitApi.getUserVisits(userId, cursor, 20),
    [userId]
  );

  const {
    items: visits,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    refresh,
    loadMore
  } = useCursorPagination<Visit>({
    fetcher: fetchUserVisits,
    enabled: Boolean(userId && isActive),
    deps: [userId]
  });

  const handleVisitClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVisit(null);
  };

  const getActivitiesStatusBadge = (activitiesStatus?: ActivitiesStatus) => {
    if (!activitiesStatus) return null;
    // getActivitiesStatusBadgeClass는 'bg-primary' 형태를 반환하므로 subtle 배지 클래스로 변환한다
    const color = getActivitiesStatusBadgeClass(activitiesStatus).replace('bg-', '');
    const statusText = getActivitiesStatusDisplayName(activitiesStatus);
    return (
      <span className={`badge bg-${color}-subtle text-${color}-emphasis`}>
        {statusText}
      </span>
    );
  };

  const getVisitTypeBadge = (visitType?: VisitType) => {
    if (!visitType) return null;
    // getVisitTypeBatchClass는 'bg-success' 형태를 반환하므로 subtle 배지 클래스로 변환한다
    const color = getVisitTypeBatchClass(visitType.type).replace('bg-', '');
    const statusText = visitType.description || getVisitTypeDisplayName(visitType.type);
    const iconClass = getVisitIconClass(visitType.type);

    return (
      <span className={`badge bg-${color}-subtle text-${color}-emphasis`}>
        <i className={`bi ${iconClass} me-1`}/>
        {statusText}
      </span>
    );
  };

  const formatVisitDateTime = (dateTimeString?: string): string => {
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
    <>
      <HistoryPanel
        title="방문 이력"
        icon="bi-geo-alt"
        count={visits.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="방문 이력이 없습니다"
        emptyDescription="아직 방문한 가게가 없습니다."
      >
        {visits.map((visit, index) => (
          <div
            key={visit.visitId || index}
            className="item-card item-card--clickable mb-3"
            role="button"
            tabIndex={0}
            onClick={() => handleVisitClick(visit)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleVisitClick(visit);
              }
            }}
          >
            <div className="item-card__body">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="min-w-0">
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {visit.store && onStoreClick ? (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStoreClick(visit.store);
                        }}
                      >
                        {visit.store.name || '가게 이름 없음'}
                        <i className="bi bi-box-arrow-up-right ms-1"/>
                      </button>
                    ) : (
                      <h3 className="item-card__name">{visit.store?.name || '가게 이름 없음'}</h3>
                    )}
                    {getVisitTypeBadge(visit.visitType)}
                  </div>
                  <p className="item-card__desc">
                    <i className="bi bi-calendar3 me-1"/>
                    {formatVisitDateTime(visit.visitDateTime)}
                  </p>
                  <p className="item-card__desc">
                    <i className="bi bi-geo-alt me-1"/>
                    {visit.store?.address?.fullAddress || '주소 정보 없음'}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-outline-warning flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisitClick(visit);
                  }}
                >
                  <i className="bi bi-eye me-1"/>
                  상세보기
                </button>
              </div>

              <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                <StoreStatusBadge status={visit.store?.status}/>
                {getActivitiesStatusBadge(visit.store?.activitiesStatus)}
                {visit.store?.storeType && <StoreTypeBadge storeType={visit.store.storeType}/>}
                <span className="rating-badge">
                  <i className="bi bi-star-fill"/>
                  평점: {visit.store?.rating ? visit.store.rating.toFixed(1) : '0.0'}점
                </span>
                {visit.store?.categories?.slice(0, 2).map((category, idx) => (
                  <span key={idx} className="badge bg-secondary-subtle text-secondary-emphasis">
                    {category?.name || '카테고리'}
                  </span>
                ))}
                {visit.store?.categories && visit.store.categories.length > 2 && (
                  <span className="badge bg-secondary-subtle text-secondary-emphasis">
                    +{visit.store.categories.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </HistoryPanel>

      {/* 방문 이력 상세 모달 */}
      {showModal && selectedVisit && (
        <div
          className="modal fade show"
          style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-geo-alt text-warning me-2"/>
                  방문 이력 상세
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}/>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게명</label>
                    <p className="form-control-plaintext">{selectedVisit.store?.name || '가게 이름 없음'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">방문 시간</label>
                    <p className="form-control-plaintext">{formatVisitDateTime(selectedVisit.visitDateTime)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">주소</label>
                    <p className="form-control-plaintext">
                      {selectedVisit.store?.address?.fullAddress || '주소 정보 없음'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게 평균 평점</label>
                    <div>
                      <span className="rating-badge">
                        <i className="bi bi-star-fill"/>
                        {selectedVisit.store?.rating ? selectedVisit.store.rating.toFixed(1) : '0.0'}점
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">방문 결과</label>
                    <div>
                      {getVisitTypeBadge(selectedVisit.visitType)}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게 상태</label>
                    <div className="d-flex gap-2 flex-wrap">
                      <StoreStatusBadge status={selectedVisit.store?.status}/>
                      {getActivitiesStatusBadge(selectedVisit.store?.activitiesStatus)}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">가게 카테고리</label>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedVisit.store?.categories?.map((category, idx) => (
                        <span key={idx} className="badge bg-primary-subtle text-primary-emphasis">
                          {category?.name || '카테고리'}
                        </span>
                      )) || <span className="text-muted">카테고리 정보 없음</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  <i className="bi bi-x-lg me-2"/>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserVisitHistory;
