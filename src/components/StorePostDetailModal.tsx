import {Modal} from 'react-bootstrap';
import DetailField from '@/components/common/DetailField';
import {StorePost} from '@/types/storePost';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {
  getPostImageSections,
  getStickerEmoji,
  getTotalStickerCount,
  isPostEdited
} from '@/utils/display/storePostDisplay';

interface StorePostDetailModalProps {
  show: boolean;
  onHide: () => void;
  post: StorePost | null;
}

/**
 * 가게 소식 상세 모달
 *
 * 소식 단건 조회 API가 없어 목록에서 받은 항목을 그대로 표시합니다.
 */
const StorePostDetailModal = ({show, onHide, post}: StorePostDetailModalProps) => {
  if (!post) return null;

  const imageSections = getPostImageSections(post);
  const totalStickers = getTotalStickerCount(post);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable className="app-modal">
      <Modal.Header closeButton>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className="bi bi-newspaper"/>
            가게 소식 상세
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">{post.postId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
          {post.isOwner && (
            <span className="badge bg-success-subtle text-success-emphasis">
              <i className="bi bi-person-badge me-1"/>
              사장님 작성
            </span>
          )}
          {isPostEdited(post) && (
            <span className="badge bg-light text-secondary">
              <i className="bi bi-pencil me-1"/>
              수정됨
            </span>
          )}
        </div>

        {/* 본문 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-card-text"/>
            소식 내용
          </h3>
          <div className="detail-value-strong detail-value-strong--text">
            {post.body || <span className="text-body-tertiary">내용 없음</span>}
          </div>
        </div>

        {/* 첨부 이미지 */}
        {imageSections.length > 0 && (
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-images"/>
              첨부 이미지 {imageSections.length}개
            </h3>
            <div className="row g-2">
              {imageSections.map((section, index) => (
                <div key={index} className="col-6 col-md-4">
                  <a
                    href={section.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="새 창에서 원본 보기"
                  >
                    <div className="store-post__image" style={{aspectRatio: section.ratio || 1}}>
                      <img src={section.url} alt={`소식 이미지 ${index + 1}`} loading="lazy"/>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 반응 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-emoji-smile"/>
            반응
            <span className="ms-auto fw-normal text-body-secondary">
              총 {totalStickers.toLocaleString()}개
            </span>
          </h3>
          {post.stickers && post.stickers.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {post.stickers.map((sticker, index) => (
                <span
                  key={index}
                  className={`store-post__sticker${sticker.reactedByMe ? ' store-post__sticker--reacted' : ''}`}
                  title={sticker.stickerId}
                >
                  <span aria-hidden="true">{sticker.emoji || getStickerEmoji(sticker.stickerId)}</span>
                  {sticker.count}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-body-tertiary small mb-0">아직 반응이 없습니다.</p>
          )}
        </div>

        {/* 등록 정보 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-clock-history"/>
            등록 정보
          </h3>
          <div className="row g-3">
            <DetailField label="등록일" className="col-12 col-md-6">
              {formatDateTime(post.createdAt)}
            </DetailField>
            <DetailField label="수정일" className="col-12 col-md-6">
              {formatDateTime(post.updatedAt)}
            </DetailField>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-outline-secondary" onClick={onHide}>
          닫기
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default StorePostDetailModal;
