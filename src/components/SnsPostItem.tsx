import {ReactNode} from 'react';
import {Badge} from 'react-bootstrap';
import {SNS_PLATFORM_LABELS} from '@/constants/snsPost';
import SnsPostEmbed from '@/components/SnsPostEmbed';
import StoreCardHeader from '@/components/StoreCardHeader';
import {SimpleStore} from '@/types/store';
import {StorePost} from '@/types/storePost';
import {getSnsPostLink} from '@/utils/display/storePostDisplay';
import {getSnsPostPlatform} from '@/utils/validation/snsPostLinkValidation';
import './SnsPostItem.css';

interface Props {
  post: StorePost;
  /** 우측 액션 영역 (예: 삭제 버튼) */
  actions?: ReactNode;
  /** 가게명 클릭 콜백. 전체 가게 조회 응답(store 포함)에서만 사용됩니다. */
  onStoreClick?: (store: SimpleStore) => void;
  /** 카드 클릭 콜백. 전달하면 카드가 클릭 가능해집니다. */
  onClick?: (post: StorePost) => void;
}

/** SNS 포스트 카드. 전체 가게 조회 응답이면 리뷰 카드와 같은 가게 정보 헤더를 표시한다. */
const SnsPostItem = ({post, actions, onStoreClick, onClick}: Props) => {
  const {platform, url} = getSnsPostLink(post);
  const postUrl = url && getSnsPostPlatform(url) ? url : null;
  const platformBadge = (
    <Badge bg="light" text="dark" className="border">{platform ? SNS_PLATFORM_LABELS[platform] : 'SNS'}</Badge>
  );
  const postedAt = (
    <span className="item-card__desc mt-0 flex-shrink-0">
      <i className="bi bi-clock me-1"/>
      <time dateTime={post.createdAt}>{post.createdAt.replace('T', ' ')}</time>
    </span>
  );
  return (
    <div
      className={`item-card sns-post-item mb-3 ${onClick ? 'item-card--clickable' : ''}`}
      onClick={() => onClick?.(post)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick(post);
        }
      }}
    >
      <div className="item-card__body">
        {post.store && (
          <div className="mb-3">
            <StoreCardHeader store={post.store} onStoreClick={onStoreClick} aside={postedAt} badges={platformBadge}/>
          </div>
        )}
        <div className="sns-post-item__heading">
          <div className="flex-grow-1 min-w-0">
            {!post.store && <div className="mb-1">{platformBadge}</div>}
            {postUrl ? (
              <a href={postUrl} target="_blank" rel="noopener noreferrer" className="d-block text-break"
                onClick={event => event.stopPropagation()}>
                {postUrl}<i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true"/>
              </a>
            ) : <span className="d-block text-muted">링크 정보 없음</span>}
            {!post.store && (
              <div className="small text-muted mt-1">
                등록 시각: <time dateTime={post.createdAt}>{post.createdAt.replace('T', ' ')}</time>
              </div>
            )}
          </div>
          {actions && <div className="sns-post-item__actions">{actions}</div>}
        </div>
        {postUrl && <SnsPostEmbed url={postUrl}/>}
      </div>
    </div>
  );
};

export default SnsPostItem;
