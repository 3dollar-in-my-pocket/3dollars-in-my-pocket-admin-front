import React from 'react';

const StorePostItem = ({ post }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStickerEmoji = (stickerId) => {
    switch (stickerId) {
      case 'LIKE':
        return '👍';
      case 'LOVE':
        return '❤️';
      case 'LAUGH':
        return '😂';
      case 'WOW':
        return '😮';
      case 'SAD':
        return '😢';
      case 'ANGRY':
        return '😡';
      default:
        return '👍';
    }
  };

  const renderImages = () => {
    const imageSections = post.sections?.filter(section => section.sectionType === 'IMAGE') || [];

    if (imageSections.length === 0) return null;

    return (
      <div className="mb-3">
        <div className="row g-2">
          {imageSections.map((section, index) => (
            <div key={index} className={`${imageSections.length === 1 ? 'col-12' : 'col-6'}`}>
              <div
                className="position-relative"
                style={{
                  aspectRatio: section.ratio || 1,
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={section.url}
                  alt={`소식 이미지 ${index + 1}`}
                  className="img-fluid w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div
                  className="d-none position-absolute top-0 start-0 w-100 h-100 bg-light align-items-center justify-content-center"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="text-center">
                    <i className="bi bi-image text-muted fs-1 mb-2"></i>
                    <p className="text-muted small mb-0">이미지를 불러올 수 없습니다</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStickers = () => {
    if (!post.stickers || post.stickers.length === 0) return null;

    return (
      <div className="d-flex gap-2 flex-wrap">
        {post.stickers.map((sticker, index) => (
          <div
            key={index}
            className={`d-flex align-items-center gap-1 px-2 py-1 rounded-pill border ${
              sticker.reactedByMe ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light border-secondary'
            }`}
            style={{ fontSize: '0.875rem' }}
          >
            <span>{sticker.emoji || getStickerEmoji(sticker.stickerId)}</span>
            <span className={`small ${sticker.reactedByMe ? 'text-primary fw-semibold' : 'text-muted'}`}>
              {sticker.count}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-start gap-3 mb-3">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
            <i className="bi bi-shop text-primary"></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <h6 className="mb-0 fw-bold text-dark">가게 소식</h6>
              {post.isOwner && (
                <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-person-badge me-1"></i>
                  사장님
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <i className="bi bi-clock"></i>
              <span>{formatDateTime(post.createdAt)}</span>
              {post.updatedAt !== post.createdAt && (
                <>
                  <span>•</span>
                  <span>수정됨</span>
                </>
              )}
            </div>
          </div>
        </div>

        {post.body && (
          <div className="mb-3">
            <p className="text-dark mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {post.body}
            </p>
          </div>
        )}

        {renderImages()}

        {post.stickers && post.stickers.length > 0 && (
          <div className="pt-3 border-top">
            {renderStickers()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePostItem;