import React from 'react';

import StoreCardHeader from '@/components/StoreCardHeader';
import {SimpleStore} from '@/types/store';
import {StorePost} from '@/types/storePost';
import {formatDateTimeKoNoSec as formatDateTime} from '@/utils/dateUtils';
import {
  getPostImageSections,
  getStickerEmoji,
  getTotalStickerCount,
  isPostEdited
} from '@/utils/display/storePostDisplay';

interface StorePostItemProps {
  post: StorePost;
  /** 카드 클릭 콜백. 전달하면 카드가 클릭 가능해집니다. */
  onClick?: ((post: StorePost) => void) | null;
  /** 가게명 클릭 콜백. 전체 가게 조회 응답(store 포함)에서만 사용됩니다. */
  onStoreClick?: (store: SimpleStore) => void;
}

const StorePostItem: React.FC<StorePostItemProps> = ({post, onClick, onStoreClick}) => {
  const imageSections = getPostImageSections(post);
  const totalStickers = getTotalStickerCount(post);
  const ownerBadge = post.isOwner && (
    <span className="badge bg-success-subtle text-success-emphasis">
      <i className="bi bi-person-badge me-1"/>
      사장님
    </span>
  );
  const postedAt = (
    <span className="item-card__desc mt-0 flex-shrink-0">
      <i className="bi bi-clock me-1"/>
      {formatDateTime(post.createdAt)}
      {isPostEdited(post) && ' · 수정됨'}
    </span>
  );

  return (
    <div
      className={`item-card mb-3 ${onClick ? 'item-card--clickable' : ''}`}
      onClick={() => onClick?.(post)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick(post);
        }
      }}
    >
      <div className="item-card__body">
        {post.store ? (
          <div className="mb-3">
            <StoreCardHeader store={post.store} onStoreClick={onStoreClick} aside={postedAt} badges={ownerBadge}/>
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
            <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
              <h3 className="item-card__name">가게 소식</h3>
              {ownerBadge}
            </div>
            {postedAt}
          </div>
        )}

        {post.body && <p className="store-post__body mb-0">{post.body}</p>}

        {imageSections.length > 0 && (
          <div className="row g-2 mt-2">
            {imageSections.map((section, index) => (
              <div key={index} className={imageSections.length === 1 ? 'col-12' : 'col-6'}>
                <div className="store-post__image" style={{aspectRatio: section.ratio || 1}}>
                  <img src={section.url} alt={`소식 이미지 ${index + 1}`} loading="lazy"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {post.stickers && post.stickers.length > 0 && (
          <div className="store-post__stickers">
            {post.stickers.map((sticker, index) => (
              <span
                key={index}
                className={`store-post__sticker${sticker.reactedByMe ? ' store-post__sticker--reacted' : ''}`}
              >
                <span aria-hidden="true">{sticker.emoji || getStickerEmoji(sticker.stickerId)}</span>
                {sticker.count}
              </span>
            ))}
            <span className="item-card__desc mt-0 ms-auto">반응 {totalStickers}개</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePostItem;
