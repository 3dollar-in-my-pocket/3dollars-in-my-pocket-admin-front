import {Modal} from 'react-bootstrap';
import DetailField from '@/components/common/DetailField';
import SnsPostEmbed from '@/components/SnsPostEmbed';
import StoreInfoSection from '@/components/StoreInfoSection';
import {SNS_PLATFORM_LABELS} from '@/constants/snsPost';
import {SimpleStore} from '@/types/store';
import {StorePost} from '@/types/storePost';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {getSnsPostLink} from '@/utils/display/storePostDisplay';
import {getSnsPostPlatform} from '@/utils/validation/snsPostLinkValidation';

interface Props {
  show: boolean;
  onHide: () => void;
  post: StorePost | null;
  /** 가게명 클릭 콜백 (가게 상세 모달 열기). 전체 가게 조회 응답(store 포함)에서만 사용됩니다. */
  onStoreClick?: (store: SimpleStore) => void;
}

/**
 * SNS 포스트 상세 모달
 *
 * 단건 조회 API가 없어 목록에서 받은 항목을 그대로 표시합니다.
 */
const SnsPostDetailModal = ({show, onHide, post, onStoreClick}: Props) => {
  if (!post) return null;

  const {platform, url} = getSnsPostLink(post);
  const postUrl = url && getSnsPostPlatform(url) ? url : null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable className="app-modal">
      <Modal.Header closeButton>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className="bi bi-link-45deg"/>
            SNS 포스트 상세
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">{post.postId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        {post.store && (
          <StoreInfoSection
            store={post.store}
            onStoreClick={onStoreClick && ((store) => {
              onStoreClick(store);
              onHide();
            })}
          />
        )}

        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-link-45deg"/>
            포스트 정보
          </h3>
          <div className="row g-3">
            <DetailField label="플랫폼" className="col-12 col-md-3">
              {platform ? SNS_PLATFORM_LABELS[platform] : 'SNS'}
            </DetailField>
            <DetailField label="링크" className="col-12 col-md-9" placeholder="링크 정보 없음">
              {postUrl && (
                <a href={postUrl} target="_blank" rel="noopener noreferrer" className="text-break">
                  {postUrl}<i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true"/>
                </a>
              )}
            </DetailField>
            <DetailField label="등록일" className="col-12 col-md-6">
              {formatDateTime(post.createdAt)}
            </DetailField>
          </div>
          {postUrl && <SnsPostEmbed url={postUrl}/>}
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

export default SnsPostDetailModal;
