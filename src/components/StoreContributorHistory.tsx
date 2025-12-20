import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import storeApi from '../api/storeApi';
import {
  StoreChangeHistory,
  getChangeAttributeIcon,
  getChangeAttributeBadgeClass
} from '../types/store';
import {getWriterTypeBadgeClass} from '../types/common';

interface StoreContributorHistoryProps {
  storeId: string;
  isActive: boolean;
  onAuthorClick?: (author: any) => void;
}

const StoreContributorHistory = ({storeId, isActive, onAuthorClick}: StoreContributorHistoryProps) => {
  const [histories, setHistories] = useState<StoreChangeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storeId && isActive) {
      fetchChangeHistories(true);
    }
  }, [storeId, isActive]);

  const fetchChangeHistories = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await storeApi.getStoreChangeHistories(storeId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('변경 이력을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const {contents = [], cursor: newCursor = {}} = response.data || {};

      if (reset) {
        setHistories(contents);
      } else {
        setHistories(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
    } catch (error) {
      console.error('변경 이력 조회 실패:', error);
      toast.error('변경 이력을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchChangeHistories(false);
    }
  }, [hasMore, isLoading, fetchChangeHistories]);

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

  const handleAuthorClick = (actor: any) => {
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
    <div className="p-4" style={{maxHeight: '70vh', overflowY: 'auto'}} ref={scrollContainerRef}>
      {histories.length === 0 && !isLoading ? (
        <div className="text-center py-5">
          <div className="bg-light rounded-circle mx-auto mb-3"
               style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className="bi bi-people fs-1 text-secondary"></i>
          </div>
          <h5 className="text-dark mb-2">변경 이력이 없습니다</h5>
          <p className="text-muted mb-3">
            아직 등록된 변경 이력이 없습니다.
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {histories.map((history, index) => (
              <div key={index} className="col-12">
                <div className="card border-0 shadow-sm h-100"
                     style={{
                       borderRadius: '12px',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e: any) => {
                       e.currentTarget.style.transform = 'translateY(-2px)';
                       e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                     }}
                     onMouseLeave={(e: any) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                     }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3"
                           style={{minWidth: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <i className="bi bi-pencil-square text-primary fs-5"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <div
                            className={`d-inline-flex align-items-center gap-1 ${history.actor.writerType === 'USER' && onAuthorClick ? 'clickable-author' : ''}`}
                            style={{
                              cursor: history.actor.writerType === 'USER' && onAuthorClick ? 'pointer' : 'default',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAuthorClick(history.actor);
                            }}
                            onMouseEnter={(e: any) => {
                              if (history.actor.writerType === 'USER' && onAuthorClick) {
                                e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }
                            }}
                            onMouseLeave={(e: any) => {
                              if (history.actor.writerType === 'USER' && onAuthorClick) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            <span className={`badge rounded-pill px-3 py-2 ${getWriterTypeBadgeClass(history.actor.writerType)} bg-opacity-10 ${history.actor.writerType === 'USER' && onAuthorClick ? 'text-primary' : 'text-dark'} border`}>
                              <i className="bi bi-person-fill me-1"></i>
                              {history.actor.name}
                            </span>
                            {history.actor.writerType === 'USER' && onAuthorClick && (
                              <i className="bi bi-box-arrow-up-right text-primary" style={{fontSize: '0.7rem'}}></i>
                            )}
                          </div>
                          <span className="text-muted small">
                            <i className="bi bi-clock me-1"></i>
                            {formatDateTime(history.changedAt)}
                          </span>
                        </div>

                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {history.changeAttributes.map((attr, attrIndex) => (
                            <span
                              key={attrIndex}
                              className={`badge ${getChangeAttributeBadgeClass(attr.attributeType)} text-white`}
                              style={{fontSize: '0.85rem', padding: '6px 12px'}}
                            >
                              <i className={`bi ${getChangeAttributeIcon(attr.attributeType)} me-1`}></i>
                              {attr.description}
                            </span>
                          ))}
                        </div>

                        <div className="text-muted small mt-2">
                          <i className="bi bi-info-circle me-1"></i>
                          {history.changeAttributes.length}개 항목 수정
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-primary rounded-pill px-4 py-2"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-down-circle me-2"></i>
                    더 보기
                  </>
                )}
              </button>
            </div>
          )}

          {isLoading && histories.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">변경 이력을 불러오는 중...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreContributorHistory;
