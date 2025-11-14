import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import storeMessageApi from '../../api/storeMessageApi';
import { StoreMessage } from '../../types/storeMessage';
import { getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon } from '../../types/store';
import StoreDetailModal from '../store/StoreDetailModal';

const StoreMessageManagement = () => {
  const [messages, setMessages] = useState<StoreMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<StoreMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 초기 데이터 로드
  useEffect(() => {
    fetchMessages(true);
  }, []);

  // Intersection Observer 설정
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading) {
          fetchMessages(false);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading]);

  const fetchMessages = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await storeMessageApi.getAllStoreMessages(reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('메시지 목록을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const { contents = [], cursor: newCursor = {} } = response.data || {};

      if (reset) {
        setMessages(contents);
      } else {
        setMessages(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
    } catch (error) {
      console.error('메시지 목록 조회 오류:', error);
      toast.error('메시지 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchMessages(false);
    }
  }, [hasMore, isLoading, fetchMessages]);

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

  const getStoreTypeBadge = (storeType: string) => {
    if (!storeType) return null;
    return (
      <span className={`badge ${getStoreTypeBadgeClass(storeType as any)} text-white rounded-pill px-2 py-1 small`}>
        <i className={`bi ${getStoreTypeIcon(storeType as any)} me-1`}></i>
        {getStoreTypeDisplayName(storeType as any)}
      </span>
    );
  };

  const handleMessageClick = (message: StoreMessage) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const handleStoreClick = (store: any) => {
    if (store?.storeId) {
      setSelectedStore(store);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3 py-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold">
          <i className="bi bi-chat-left-text text-primary me-2"></i>
          가게 메시지 발송 이력
        </h2>
        <button
          className="btn btn-outline-primary btn-sm rounded-pill px-3"
          onClick={() => fetchMessages(true)}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          새로고침
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-3 mb-md-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-info-circle text-muted"></i>
            <small className="text-muted">
              전체 가게에서 발송한 모든 메시지를 조회합니다. 스크롤하여 더 많은 메시지를 자동으로 불러옵니다.
            </small>
          </div>
          {messages.length > 0 && (
            <div className="mt-2">
              <span className="badge bg-primary rounded-pill">
                현재 {messages.length.toLocaleString()}개 조회됨
              </span>
              {hasMore && (
                <span className="badge bg-secondary rounded-pill ms-2">
                  더 많은 메시지 있음
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="message-container"
        style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
      >
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div
              className="bg-light rounded-circle mx-auto mb-4"
              style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="bi bi-chat-left-text fs-1 text-secondary"></i>
            </div>
            <h5 className="text-dark mb-2">등록된 메시지가 없습니다</h5>
            <p className="text-muted">아직 등록된 메시지가 없습니다.</p>
          </div>
        ) : (
          <div className="row g-3">
            {messages.map((message) => (
              <div key={message.messageId} className="col-12 col-lg-6">
                {/* iOS 푸시 알림 스타일 */}
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px'
                  }}
                  onClick={() => handleMessageClick(message)}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                  }}
                >
                  <div className="card-body p-3 p-md-4">
                    {/* 시간 */}
                    <div className="d-flex align-items-center justify-content-end mb-3">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {formatDateTime(message.createdAt).split(' ').slice(1).join(' ')}
                      </div>
                    </div>

                    {/* 알림 제목 */}
                    <div className="mb-2">
                      <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                        {message.store?.name || '가게'}의 메시지가 도착했어요 📩
                      </h6>
                    </div>

                    {/* 알림 내용 */}
                    {message.body && (
                      <p
                        className="text-dark mb-0"
                        style={{
                          fontSize: '0.9rem',
                          lineHeight: '1.5',
                          opacity: 0.85,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message.body}
                      </p>
                    )}

                    {/* 가게 타입 배지 - 하단 */}
                    {message.store?.storeType && (
                      <div className="mt-3 pt-2 border-top">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge ${getStoreTypeBadgeClass(message.store.storeType as any)} text-white rounded-pill px-2 py-1`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            <i className={`bi ${getStoreTypeIcon(message.store.storeType as any)} me-1`}></i>
                            {getStoreTypeDisplayName(message.store.storeType as any)}
                          </span>
                          <div
                            className="text-success"
                            style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStoreClick(message.store);
                            }}
                          >
                            <i className="bi bi-shop me-1"></i>
                            가게 정보 보기
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Intersection Observer 타겟 */}
        {hasMore && messages.length > 0 && (
          <div ref={loadMoreRef} className="text-center mt-4 mb-4">
            {isLoading ? (
              <div className="py-3">
                <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">메시지를 불러오는 중...</p>
              </div>
            ) : (
              <button
                className="btn btn-outline-primary rounded-pill px-4 py-2"
                onClick={handleLoadMore}
              >
                <i className="bi bi-arrow-down-circle me-2"></i>
                더 많은 메시지 보기
              </button>
            )}
          </div>
        )}

        {/* 초기 로딩 인디케이터 */}
        {isLoading && messages.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p className="text-muted">메시지를 불러오는 중...</p>
          </div>
        )}
      </div>

      {/* 메시지 상세 모달 */}
      {showModal && selectedMessage && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-chat-left-text text-primary me-2"></i>
                  메시지 상세 정보
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게 이름</label>
                    <p className="form-control-plaintext">{selectedMessage.store?.name || '정보 없음'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게 타입</label>
                    <div>
                      {selectedMessage.store?.storeType ? (
                        getStoreTypeBadge(selectedMessage.store.storeType)
                      ) : (
                        <span className="text-muted">정보 없음</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">등록일</label>
                    <p className="form-control-plaintext">{formatDateTime(selectedMessage.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">수정일</label>
                    <p className="form-control-plaintext">{formatDateTime(selectedMessage.updatedAt)}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">메시지 내용</label>
                    <div className="border rounded p-3 bg-light">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedMessage.body || '내용이 없습니다.'}
                      </p>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">가게 정보</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedMessage.store ? (
                        <>
                          {selectedMessage.store.storeType && getStoreTypeBadge(selectedMessage.store.storeType)}
                          <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                            <i className="bi bi-shop me-1"></i>
                            {selectedMessage.store.name}
                          </span>
                          {selectedMessage.store.storeId && (
                            <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-3 py-2">
                              <i className="bi bi-hash me-1"></i>
                              {selectedMessage.store.storeId}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">정보 없음</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-lg me-2"></i>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 가게 상세 모달 */}
      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={() => {}}
        onStoreDeleted={() => {}}
      />
    </div>
  );
};

export default StoreMessageManagement;
