import React from 'react';
import {getAdPositionSpec} from '@/constants/advertisementSpecs';
import './AdPreview.css';

interface AdPreviewProps {
  positionType: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  title?: string;
  subTitle?: string;
  extraContent?: string;
  titleFontColor?: string;
  subTitleFontColor?: string;
  extraContentFontColor?: string;
  backgroundColor?: string;
}

/**
 * 광고 미리보기 컴포넌트
 */
const AdPreview: React.FC<AdPreviewProps> = ({
                                               positionType,
                                               imageUrl,
                                               imageWidth,
                                               imageHeight,
                                               title,
                                               subTitle,
                                               extraContent,
                                               titleFontColor = '#000000',
                                               subTitleFontColor = '#969696',
                                               extraContentFontColor = '#000000',
                                               backgroundColor = '#FFFFFF'
                                             }) => {
  const spec = getAdPositionSpec(positionType);

  if (!spec) {
    return (
      <div className="ad-preview-error text-center text-muted p-4">
        <i className="bi bi-exclamation-circle fs-1 mb-2"></i>
        <div>구좌 정보를 찾을 수 없습니다</div>
      </div>
    );
  }

  const {previewConfig} = spec;

  // API 응답의 imageWidth, imageHeight 비율 기반으로 표시 크기 계산
  let displayWidth = previewConfig.imageWidth;
  let displayHeight = previewConfig.imageHeight;

  if (imageWidth && imageHeight) {
    const apiRatio = imageWidth / imageHeight;

    // 컨테이너 너비를 기준으로 최대 크기 계산 (여백 고려)
    const maxContainerWidth = previewConfig.containerWidth || 320;
    const maxImageWidth = Math.min(maxContainerWidth - 32, 300); // 여백 32px 고려
    const targetSize = maxImageWidth;

    if (apiRatio > 1) {
      // 가로가 더 긴 이미지
      displayWidth = Math.min(targetSize, maxContainerWidth - 32);
      displayHeight = displayWidth / apiRatio;
    } else {
      // 세로가 더 긴 이미지 또는 정사각형
      displayHeight = targetSize;
      displayWidth = targetSize * apiRatio;

      // 너비가 컨테이너를 초과하지 않도록 제한
      if (displayWidth > maxContainerWidth - 32) {
        displayWidth = maxContainerWidth - 32;
        displayHeight = displayWidth / apiRatio;
      }
    }
  }

  // 컨테이너 너비도 반응형으로 제한
  const maxContainerWidth = Math.min(previewConfig.containerWidth || 320, 360);
  const maxContainerHeight = previewConfig.containerHeight;

  // 가게 카드뷰 레이아웃
  if (previewConfig.layout === 'card') {
    return (
      <div className="d-flex justify-content-center">
        <div className="ad-preview-device-frame">
          <div
            className="ad-preview-card"
            style={{
              width: '100%',
              maxWidth: `${maxContainerWidth}px`,
              minHeight: `${maxContainerHeight}px`,
              backgroundColor: backgroundColor
            }}
          >
            {/* 상단 광고 배지 */}
            <div className="ad-preview-badge">
              <span className="badge bg-danger">광고</span>
            </div>

            {/* 이미지 영역 */}
            <div
              className="ad-preview-image-container"
              style={{
                width: '100%',
                maxWidth: `${displayWidth}px`,
                height: `${displayHeight}px`,
                margin: '0 auto'
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="광고 이미지"
                  className="ad-preview-image"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="ad-preview-error-message"><i class="bi bi-exclamation-triangle"></i><div>이미지 로드 실패</div></div>';
                  }}
                />
              ) : (
                <div className="ad-preview-placeholder">
                  <i className="bi bi-image"></i>
                  <div>이미지 없음</div>
                </div>
              )}
            </div>

            {/* 텍스트 영역 */}
            <div className="ad-preview-text-area">
              <div
                className="ad-preview-title"
                style={{color: titleFontColor}}
              >
                {title || '광고 제목을 입력하세요'}
              </div>
              <div
                className="ad-preview-subtitle"
                style={{color: subTitleFontColor}}
              >
                {subTitle || '광고 부제목을 입력하세요'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 가게 리스트뷰 레이아웃
  if (previewConfig.layout === 'list') {
    return (
      <div className="d-flex justify-content-center">
        <div className="ad-preview-device-frame">
          <div
            className="ad-preview-list"
            style={{
              width: '100%',
              maxWidth: `${maxContainerWidth}px`,
              minHeight: `${maxContainerHeight}px`,
              backgroundColor: backgroundColor
            }}
          >
            {/* 이미지 영역 */}
            <div
              className="ad-preview-list-image"
              style={{
                width: `${Math.min(displayWidth, 100)}px`,
                height: `${Math.min(displayHeight, 100)}px`,
                flexShrink: 0
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="광고 이미지"
                  className="ad-preview-image"
                />
              ) : (
                <div className="ad-preview-placeholder">
                  <i className="bi bi-image"></i>
                </div>
              )}
            </div>

            {/* 텍스트 영역 */}
            <div className="ad-preview-list-text">
              {/* 광고 배지 */}
              <div className="ad-preview-badge-small">
                <span className="badge bg-danger">광고</span>
              </div>

              <div
                className="ad-preview-list-title"
                style={{color: titleFontColor}}
              >
                {title || '광고 제목'}
              </div>
              <div
                className="ad-preview-list-subtitle"
                style={{color: subTitleFontColor}}
              >
                {subTitle || '광고 부제목'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 카테고리 아이콘 레이아웃
  if (previewConfig.layout === 'category-icon') {
    const iconSize = Math.min(displayWidth, 80); // 아이콘 최대 크기 제한
    return (
      <div className="d-flex justify-content-center">
        <div className="ad-preview-device-frame">
          <div
            className="ad-preview-category-icon"
            style={{
              width: '100%',
              maxWidth: `${Math.min(maxContainerWidth, 100)}px`
            }}
          >
            {/* 아이콘 이미지 */}
            <div
              className="ad-preview-icon-image"
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="카테고리 아이콘"
                  className="ad-preview-image"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="ad-preview-error-message"><i class="bi bi-exclamation-triangle"></i></div>';
                  }}
                />
              ) : (
                <div className="ad-preview-placeholder">
                  <i className="bi bi-image"></i>
                </div>
              )}
            </div>
            {/* 타이틀 */}
            <div
              className="ad-preview-icon-title"
              style={{color: titleFontColor}}
            >
              {title || '광고광고광고'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 카테고리 배너 레이아웃
  if (previewConfig.layout === 'category-banner') {
    const bannerImageWidth = Math.min(displayWidth, 280); // 배너 이미지 최대 크기 증가
    const bannerImageHeight = Math.min(displayHeight, 280);
    return (
      <div className="d-flex justify-content-center">
        <div className="ad-preview-device-frame">
          <div
            className="ad-preview-banner"
            style={{
              width: '100%',
              maxWidth: `${maxContainerWidth}px`,
              minHeight: `${maxContainerHeight}px`,
              backgroundColor: backgroundColor || '#000000'
            }}
          >
            {/* 이미지 영역 (상단) */}
            <div
              className="ad-preview-banner-image"
              style={{
                width: `${bannerImageWidth}px`,
                height: `${bannerImageHeight}px`,
                margin: '0 auto'
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="배너 이미지"
                  className="ad-preview-image"
                  style={{objectFit: 'contain'}}
                />
              ) : (
                <div className="ad-preview-placeholder">
                  <i className="bi bi-image"></i>
                </div>
              )}
            </div>

            {/* 텍스트 영역 (하단) */}
            <div className="ad-preview-banner-text">
              <div
                className="ad-preview-banner-title"
                style={{color: titleFontColor}}
              >
                {title || '📢 광고문의 📢'}
              </div>
              <div
                className="ad-preview-banner-subtitle"
                style={{color: subTitleFontColor}}
              >
                {subTitle || '여기에 광고를 하고 싶으시다면? 여기에 광고를 하고 싶으시다면?'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 이미지만 있는 레이아웃 (SPLASH, LOADING, STORE_MARKER)
  if (previewConfig.layout === 'image-only' || previewConfig.layout === 'splash') {
    return (
      <div className="d-flex justify-content-center">
        <div className="ad-preview-device-frame">
          <div
            className="ad-preview-image-only"
            style={{
              width: '100%',
              maxWidth: `${displayWidth}px`,
              height: 'auto',
              minHeight: `${displayHeight}px`
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="광고 이미지"
                className="ad-preview-image"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="ad-preview-error-message"><i class="bi bi-exclamation-triangle"></i><div>이미지 로드 실패</div></div>';
                }}
              />
            ) : (
              <div className="ad-preview-placeholder">
                <i className="bi bi-image"></i>
                <div>이미지를 업로드하세요</div>
              </div>
            )}

            {/* 광고 배지 (좌상단) */}
            {previewConfig.layout === 'splash' && (
              <div className="ad-preview-badge">
                <span className="badge bg-danger">광고</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 마커 팝업 레이아웃 (STORE_MARKER_POPUP)
  if (previewConfig.layout === 'marker-popup') {
    return (
      <div className="d-flex justify-content-center">
        <div className="ad-preview-device-frame">
          <div
            className="ad-preview-popup"
            style={{
              width: '100%',
              maxWidth: `${maxContainerWidth}px`,
              backgroundColor: backgroundColor
            }}
          >
            {/* 이미지 영역 */}
            <div
              className="ad-preview-image-container"
              style={{
                width: '100%',
                maxWidth: `${displayWidth}px`,
                height: `${displayHeight}px`,
                margin: '0 auto'
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="팝업 이미지"
                  className="ad-preview-image"
                />
              ) : (
                <div className="ad-preview-placeholder">
                  <i className="bi bi-image"></i>
                  <div>이미지 없음</div>
                </div>
              )}
            </div>

            {/* 텍스트 영역 */}
            <div className="ad-preview-popup-text">
              <div
                className="ad-preview-popup-title"
                style={{color: titleFontColor}}
              >
                {title || '광고 제목을 입력하세요'}
              </div>
              <div
                className="ad-preview-popup-subtitle"
                style={{color: subTitleFontColor}}
              >
                {subTitle || '광고 부제목을 입력하세요'}
              </div>

              {/* 버튼 */}
              <div className="ad-preview-popup-button-wrapper">
                <div
                  className="ad-preview-popup-button"
                  style={{
                    color: extraContentFontColor,
                    borderColor: extraContentFontColor
                  }}
                >
                  {extraContent || '자세히 보기 >'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 투표 카드 레이아웃 (POLL_CARD)
  if (previewConfig.layout === 'poll-card') {
    return (
      <div className="d-flex justify-content-center">
        <div className="ad-preview-device-frame">
          <div
            className="ad-preview-poll-card"
            style={{
              width: '100%',
              maxWidth: `${maxContainerWidth}px`,
              backgroundColor: backgroundColor
            }}
          >
            {/* 이미지 영역 */}
            <div
              className="ad-preview-image-container"
              style={{
                width: '100%',
                maxWidth: `${displayWidth}px`,
                height: `${displayHeight}px`,
                margin: '0 auto'
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="투표 카드 이미지"
                  className="ad-preview-image"
                />
              ) : (
                <div className="ad-preview-placeholder">
                  <i className="bi bi-image"></i>
                  <div>이미지 없음</div>
                </div>
              )}
            </div>

            {/* 텍스트 영역 */}
            <div className="ad-preview-poll-text">
              <div
                className="ad-preview-poll-title"
                style={{color: titleFontColor}}
              >
                {title || '투표 광고 제목을 입력하세요'}
              </div>
              <div
                className="ad-preview-poll-subtitle"
                style={{color: subTitleFontColor}}
              >
                {subTitle || '투표 광고 부제목을 입력하세요'}
              </div>

              {/* 버튼 */}
              <div className="ad-preview-poll-button-wrapper">
                <div
                  className="ad-preview-poll-button"
                  style={{
                    color: extraContentFontColor,
                    borderColor: extraContentFontColor
                  }}
                >
                  {extraContent || '자세히 보기 >'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdPreview;
