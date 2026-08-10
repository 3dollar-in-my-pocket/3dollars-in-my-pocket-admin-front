import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import storeReportApi from "@/api/storeReportApi";

import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";
import {StoreReport, StoreReportReason} from "@/types/report";
import {ActivityAuthor} from "@/types/domain";
import {formatDateTimeShortKo as formatDateTime} from "@/utils/dateUtils";

interface StoreReportHistoryProps {
  storeId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 신고자 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
}

const StoreReportHistory = ({storeId, isActive, onAuthorClick}: StoreReportHistoryProps) => {
  const [selectedReport, setSelectedReport] = useState<StoreReport | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchReports = useCallback(
    (cursor: string | null) => storeReportApi.getStoreReports(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: reports,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreReport>({
    fetcher: fetchReports,
    enabled: Boolean(storeId && isActive),
    deps: [storeId],
    errorMessage: '신고 이력을 불러오는데 실패했습니다.'
  });

  const getReportTypeBadge = (reason?: StoreReportReason) => {
    const reasonText = reason.description

    return (
      <span className="badge bg-danger-subtle text-danger-emphasis">
        <i className="bi bi-flag me-1"/>
        {reasonText}
      </span>
    );
  };

  const handleReportClick = (report: StoreReport) => {
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
    <>
      <HistoryPanel
        title="신고 이력"
        icon="bi-shield-exclamation"
        count={reports.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="신고 이력이 없습니다"
        emptyDescription="아직 이 가게에 대한 신고가 없습니다."
      >
        {reports.map((report, index) => (
          <div
            key={report.reportId || index}
            className="item-card item-card--clickable mb-3"
            role="button"
            tabIndex={0}
            onClick={() => handleReportClick(report)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleReportClick(report);
              }
            }}
          >
            <div className="item-card__body">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
                  <span className="item-card__desc mt-0">신고자</span>
                  {report.reporter && onAuthorClick ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAuthorClick(report.reporter);
                      }}
                    >
                      {report.reporter.name}
                      <i className="bi bi-box-arrow-up-right ms-1"/>
                    </button>
                  ) : (
                    <h3 className="item-card__name">{report.reporter?.name || '익명 신고자'}</h3>
                  )}
                  {getReportTypeBadge(report.reason)}
                  {report.store?.storeType && <StoreTypeBadge storeType={report.store.storeType}/>}
                </div>
                <span className="item-card__desc mt-0 flex-shrink-0">
                  <i className="bi bi-clock me-1"/>
                  {formatDateTime(report.createdAt)}
                </span>
              </div>

              <div className="d-flex justify-content-end mt-2">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReportClick(report);
                  }}
                >
                  <i className="bi bi-eye me-1"/>
                  상세보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </HistoryPanel>

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
                        <StoreTypeBadge storeType={selectedReport.store.storeType}/>
                      ) : (
                        <span className="text-muted">정보 없음</span>
                      )}
                      {selectedReport.store?.name && (
                        <span className="badge bg-light text-dark border">
                          <i className="bi bi-shop me-1"/>
                          {selectedReport.store.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">신고 사유</label>
                    <div className="detail-value-strong detail-value-strong--text">
                      {selectedReport.reason?.description || '사유가 제공되지 않았습니다.'}
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
    </>
  );
};

export default StoreReportHistory;
