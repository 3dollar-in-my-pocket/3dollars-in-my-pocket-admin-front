import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import {Modal} from 'react-bootstrap';
import storeMessageApi from '@/api/storeMessageApi';
import {StoreMessage} from '@/types/storeMessage';

import StoreDetailModal from '@/pages/store/StoreDetailModal';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useCursorPagination from '@/hooks/useCursorPagination';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import DetailField from '@/components/common/DetailField';

import {formatDateTimeShortKo as formatDateTime} from '@/utils/dateUtils';

/** 카드에 한 번에 노출하는 카테고리 개수 */
const VISIBLE_CATEGORIES = 2;

const StoreMessageManagement = () => {
  const [selectedMessage, setSelectedMessage] = useState<StoreMessage | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const fetchMessages = useCallback(
    (cursor: string | null) => storeMessageApi.getAllStoreMessages(cursor, 20),
    []
  );

  const {
    items: messages,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreMessage>({
    fetcher: fetchMessages,
    errorMessage: '메시지를 불러오는데 실패했습니다.'
  });

  // Infinite Scroll 훅 사용
  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1
  });

  const handleStoreClick = (store: any) => {
    if (store?.storeId) {
      setSelectedStore(store);
    }
  };

  return (
    <div>
      <PageHeader
        description="전체 가게에서 발송한 메시지를 조회합니다. 스크롤하면 다음 메시지를 자동으로 불러옵니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
      />

      <SectionCard
        title="가게 메시지 발송 이력"
        icon="bi-chat-left-text-fill"
        aside={messages.length > 0 && (
          <span className="page-count">{messages.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}>
          {error ? (
            <ErrorState message={error} onRetry={refresh}/>
          ) : messages.length === 0 && !isLoading ? (
            <EmptyState
              icon="bi-chat-left-text"
              title="등록된 메시지가 없습니다"
              description="아직 발송된 가게 메시지가 없습니다."
            />
          ) : (
            <div className="row g-3">
              {messages.map((message) => (
                <div key={message.messageId} className="col-12 col-lg-6">
                  <div
                    className="item-card item-card--clickable h-100"
                    onClick={() => setSelectedMessage(message)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMessage(message);
                      }
                    }}
                  >
                    <div className="item-card__body">
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <div className="min-w-0">
                          <button
                            type="button"
                            className="btn btn-link p-0 text-start item-card__name text-decoration-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStoreClick(message.store);
                            }}
                          >
                            <i className="bi bi-shop me-1"/>
                            {message.store?.name || '가게 이름 없음'}
                            <i className="bi bi-box-arrow-up-right ms-1 small"/>
                          </button>
                          {message.store?.address?.fullAddress && (
                            <p className="item-card__desc mb-0">
                              <i className="bi bi-geo-alt me-1"/>
                              {message.store.address.fullAddress}
                            </p>
                          )}
                        </div>
                        <span className="small text-secondary flex-shrink-0">
                          {formatDateTime(message.createdAt)}
                        </span>
                      </div>

                      <div className="form-chips">
                        {message.store?.storeType && <StoreTypeBadge storeType={message.store.storeType}/>}
                        {message.store?.categories?.slice(0, VISIBLE_CATEGORIES).map((category: any, idx: number) => (
                          <span key={idx} className="form-chip">{category.name}</span>
                        ))}
                        {message.store?.categories?.length > VISIBLE_CATEGORIES && (
                          <span className="form-chip">
                            +{message.store.categories.length - VISIBLE_CATEGORIES}
                          </span>
                        )}
                      </div>

                      {message.body && (
                        <p className="item-card__desc mt-3 mb-0 text-clamp-3">{message.body}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading && messages.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">불러오는 중</span>
              </div>
              <p className="text-muted small mt-3 mb-0">메시지를 불러오는 중...</p>
            </div>
          )}

          {/* Intersection Observer 타겟 - 항상 렌더링 */}
          <div
            ref={loadMoreRef}
            className="text-center py-3"
            style={{display: hasMore && messages.length > 0 ? 'block' : 'none'}}
          >
            {isLoading && (
              <>
                <span className="spinner-border spinner-border-sm text-primary me-2" role="status"/>
                <span className="small text-muted">더 불러오는 중...</span>
              </>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 메시지 상세 모달 */}
      <Modal
        show={!!selectedMessage}
        onHide={() => setSelectedMessage(null)}
        centered
        size="lg"
        scrollable
        className="app-modal"
      >
        <Modal.Header closeButton>
          <div className="min-w-0">
            <Modal.Title as="h2">
              <i className="bi bi-chat-left-text"/>
              메시지 상세
            </Modal.Title>
            {selectedMessage && (
              <p className="app-modal__subtitle font-monospace">{selectedMessage.messageId}</p>
            )}
          </div>
        </Modal.Header>
        {selectedMessage && (
          <Modal.Body>
            {/* 메시지 본문이 핵심 정보이므로 먼저 보여준다 */}
            <div className="modal-section">
              <h3 className="modal-section__title">
                <i className="bi bi-chat-left-text"/>
                메시지 내용
              </h3>
              <div className="detail-value-strong detail-value-strong--text">
                {selectedMessage.body || <span className="text-body-tertiary">내용 없음</span>}
              </div>
            </div>

            <div className="modal-section">
              <h3 className="modal-section__title">
                <i className="bi bi-shop"/>
                가게 정보
              </h3>
              <div className="row g-3">
                <DetailField label="가게 이름" className="col-12 col-md-6" placeholder="삭제된 가게">
                  {selectedMessage.store ? (
                    <button
                      type="button"
                      className="btn btn-link p-0 align-baseline"
                      onClick={() => {
                        handleStoreClick(selectedMessage.store);
                        setSelectedMessage(null);
                      }}
                    >
                      {selectedMessage.store.name}
                      <i className="bi bi-box-arrow-up-right ms-1 small"/>
                    </button>
                  ) : null}
                </DetailField>
                <DetailField label="가게 ID" className="col-6 col-md-3" monospace>
                  {selectedMessage.store?.storeId}
                </DetailField>
                <DetailField label="가게 타입" className="col-6 col-md-3">
                  <StoreTypeBadge storeType={selectedMessage.store?.storeType}/>
                </DetailField>
              </div>
            </div>

            <div className="modal-section">
              <h3 className="modal-section__title">
                <i className="bi bi-clock-history"/>
                등록 정보
              </h3>
              <div className="row g-3">
                <DetailField label="등록일" className="col-12 col-md-6">
                  {formatDateTime(selectedMessage.createdAt)}
                </DetailField>
                <DetailField label="수정일" className="col-12 col-md-6">
                  {formatDateTime(selectedMessage.updatedAt)}
                </DetailField>
              </div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer>
          <button className="btn btn-outline-secondary" onClick={() => setSelectedMessage(null)}>
            닫기
          </button>
        </Modal.Footer>
      </Modal>

      {/* 가게 상세 모달 */}
      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={() => {
        }}
        onStoreDeleted={() => {
        }}
      />
    </div>
  );
};

export default StoreMessageManagement;
