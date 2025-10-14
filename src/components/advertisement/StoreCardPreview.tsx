import React from 'react';
import './StoreCardPreview.css';

interface StoreCardPreviewProps {
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  storeName?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  backgroundColor?: string;
}

/**
 * 가게 카드 미리보기 컴포넌트
 * 광고 상세 미리보기와는 다른 비율의 가게 카드 형태
 */
const StoreCardPreview: React.FC<StoreCardPreviewProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  storeName,
  category,
  rating = 0,
  reviewCount = 0,
  backgroundColor = '#FFFFFF'
}) => {
  // 가게 카드 이미지 비율 계산 (1:1 정사각형 기본)
  let displayWidth = 160;
  let displayHeight = 160;

  if (imageWidth && imageHeight) {
    const apiRatio = imageWidth / imageHeight;

    // 정사각형 비율 유지 (가게 카드는 보통 정사각형)
    const targetSize = 160;
    displayWidth = targetSize;
    displayHeight = targetSize;

    // 만약 이미지가 정사각형이 아니라면 비율에 맞춰 조정
    if (Math.abs(apiRatio - 1) > 0.1) {
      if (apiRatio > 1) {
        // 가로가 더 긴 경우
        displayWidth = targetSize;
        displayHeight = targetSize / apiRatio;
      } else {
        // 세로가 더 긴 경우
        displayHeight = targetSize;
        displayWidth = targetSize * apiRatio;
      }
    }
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="store-card-preview-device-frame">
        <div
          className="store-card-preview-card"
          style={{
            backgroundColor: backgroundColor
          }}
        >
          {/* 이미지 영역 */}
          <div
            className="store-card-preview-image-container"
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="가게 이미지"
                className="store-card-preview-image"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="store-card-preview-error-message"><i class="bi bi-exclamation-triangle"></i><div>이미지 로드 실패</div></div>';
                }}
              />
            ) : (
              <div className="store-card-preview-placeholder">
                <i className="bi bi-shop"></i>
                <div>가게 이미지</div>
              </div>
            )}
          </div>

          {/* 가게 정보 영역 */}
          <div className="store-card-preview-info">
            {/* 카테고리 */}
            {category && (
              <div className="store-card-preview-category">
                {category}
              </div>
            )}

            {/* 가게 이름 */}
            <div className="store-card-preview-name">
              {storeName || '가게 이름을 입력하세요'}
            </div>

            {/* 평점 및 리뷰 */}
            <div className="store-card-preview-rating">
              <span className="store-card-preview-star">
                <i className="bi bi-star-fill"></i>
              </span>
              <span className="store-card-preview-rating-value">
                {rating.toFixed(1)}
              </span>
              <span className="store-card-preview-review-count">
                ({reviewCount})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCardPreview;
