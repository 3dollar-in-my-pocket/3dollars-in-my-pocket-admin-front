import React from 'react';
import { getAdPositionSpec } from '../../constants/advertisementSpecs';

interface AdPreviewProps {
  positionType: string;
  imageUrl?: string;
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
      <div className="text-center text-muted p-4">
        <i className="bi bi-exclamation-circle fs-1 mb-2"></i>
        <div>구좌 정보를 찾을 수 없습니다</div>
      </div>
    );
  }

  const { previewConfig } = spec;

  // 가게 카드뷰 레이아웃
  if (previewConfig.layout === 'card') {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="position-relative rounded shadow-sm overflow-hidden"
          style={{
            width: `${previewConfig.containerWidth}px`,
            height: `${previewConfig.containerHeight}px`,
            backgroundColor: backgroundColor
          }}
        >
          {/* 상단 광고 배지 */}
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-danger" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
              광고
            </span>
          </div>

          {/* 이미지 영역 */}
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: `${previewConfig.imageWidth}px`,
              height: `${previewConfig.imageHeight}px`,
              margin: '0 auto',
              backgroundColor: '#f8f9fa'
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="광고 이미지"
                className="img-fluid"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div className="text-center text-muted">
                <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                <div style={{ fontSize: '0.6rem' }}>이미지 없음</div>
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="p-3">
            <div
              className="fw-bold mb-1"
              style={{
                fontSize: '0.85rem',
                color: titleFontColor,
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {title || '광고 제목을 입력하세요'}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: subTitleFontColor,
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {subTitle || '광고 부제목을 입력하세요'}
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
        <div
          className="d-flex align-items-center rounded shadow-sm overflow-hidden p-2"
          style={{
            width: `${previewConfig.containerWidth}px`,
            height: `${previewConfig.containerHeight}px`,
            backgroundColor: backgroundColor
          }}
        >
          {/* 이미지 영역 */}
          <div
            className="flex-shrink-0 rounded overflow-hidden d-flex align-items-center justify-content-center"
            style={{
              width: `${previewConfig.imageWidth}px`,
              height: `${previewConfig.imageHeight}px`,
              backgroundColor: '#f8f9fa'
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="광고 이미지"
                className="img-fluid"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div className="text-center text-muted">
                <i className="bi bi-image" style={{ fontSize: '1.5rem' }}></i>
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="flex-grow-1 ms-2 position-relative">
            {/* 광고 배지 */}
            <div className="position-absolute top-0 end-0">
              <span className="badge bg-danger" style={{ fontSize: '0.5rem', padding: '1px 4px' }}>
                광고
              </span>
            </div>

            <div
              className="fw-bold mb-1"
              style={{
                fontSize: '0.75rem',
                color: titleFontColor,
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                paddingRight: '30px'
              }}
            >
              {title || '광고 제목'}
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: subTitleFontColor,
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {subTitle || '광고 부제목'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 카테고리 아이콘 레이아웃
  if (previewConfig.layout === 'category-icon') {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="text-center"
          style={{
            width: `${previewConfig.containerWidth}px`
          }}
        >
          {/* 아이콘 이미지 */}
          <div
            className="rounded d-flex align-items-center justify-content-center mx-auto mb-2"
            style={{
              width: `${previewConfig.imageWidth}px`,
              height: `${previewConfig.imageHeight}px`,
              backgroundColor: '#f8f9fa',
              overflow: 'hidden'
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="카테고리 아이콘"
                className="img-fluid"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div className="text-center text-muted">
                <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
              </div>
            )}
          </div>
          {/* 타이틀 */}
          <div
            className="fw-normal text-center"
            style={{
              fontSize: '0.7rem',
              color: titleFontColor,
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {title || '광고광고광고'}
          </div>
        </div>
      </div>
    );
  }

  // 카테고리 배너 레이아웃
  if (previewConfig.layout === 'category-banner') {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="d-flex align-items-center rounded shadow-sm overflow-hidden p-3"
          style={{
            width: `${previewConfig.containerWidth}px`,
            height: `${previewConfig.containerHeight}px`,
            backgroundColor: backgroundColor || '#000000'
          }}
        >
          {/* 텍스트 영역 (좌측) */}
          <div className="flex-grow-1 me-3">
            <div
              className="fw-bold mb-2"
              style={{
                fontSize: '1.2rem',
                color: titleFontColor,
                lineHeight: '1.3'
              }}
            >
              {title || '📢 광고문의 📢'}
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                color: subTitleFontColor,
                lineHeight: '1.4'
              }}
            >
              {subTitle || '여기에 광고를 하고 싶으시다면? 여기에 광고를 하고 싶으시다면?'}
            </div>
          </div>

          {/* 이미지 영역 (우측) */}
          <div
            className="flex-shrink-0 rounded overflow-hidden d-flex align-items-center justify-content-center"
            style={{
              width: `${previewConfig.imageWidth}px`,
              height: `${previewConfig.imageHeight}px`,
              backgroundColor: '#f8f9fa'
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="배너 이미지"
                className="img-fluid"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div className="text-center text-muted">
                <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 이미지만 있는 레이아웃 (SPLASH, LOADING, STORE_MARKER)
  if (previewConfig.layout === 'image-only' || previewConfig.layout === 'splash') {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="position-relative rounded shadow-sm overflow-hidden d-flex align-items-center justify-content-center"
          style={{
            width: `${previewConfig.containerWidth}px`,
            height: `${previewConfig.containerHeight}px`,
            backgroundColor: '#f8f9fa'
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="광고 이미지"
              className="img-fluid"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: previewConfig.layout === 'splash' ? 'cover' : 'contain'
              }}
            />
          ) : (
            <div className="text-center text-muted">
              <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
              <div style={{ fontSize: '0.8rem' }}>이미지를 업로드하세요</div>
            </div>
          )}

          {/* 광고 배지 (좌상단) */}
          {previewConfig.layout === 'splash' && (
            <div className="position-absolute top-0 start-0 m-3">
              <span className="badge bg-danger" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                광고
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 마커 팝업 레이아웃 (STORE_MARKER_POPUP)
  if (previewConfig.layout === 'marker-popup') {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="rounded shadow-sm overflow-hidden"
          style={{
            width: `${previewConfig.containerWidth}px`,
            backgroundColor: backgroundColor
          }}
        >
          {/* 이미지 영역 */}
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '100%',
              height: `${previewConfig.imageHeight}px`,
              backgroundColor: '#f8f9fa'
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="팝업 이미지"
                className="img-fluid"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div className="text-center text-muted">
                <i className="bi bi-image" style={{ fontSize: '2.5rem' }}></i>
                <div style={{ fontSize: '0.7rem' }}>이미지 없음</div>
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="p-3">
            <div
              className="fw-bold mb-2"
              style={{
                fontSize: '0.9rem',
                color: titleFontColor,
                lineHeight: '1.3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {title || '광고 제목을 입력하세요'}
            </div>
            <div
              className="mb-3"
              style={{
                fontSize: '0.75rem',
                color: subTitleFontColor,
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {subTitle || '광고 부제목을 입력하세요'}
            </div>

            {/* 버튼 */}
            <div className="d-flex justify-content-end">
              <div
                className="px-3 py-2 rounded"
                style={{
                  fontSize: '0.75rem',
                  color: extraContentFontColor,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${extraContentFontColor}`,
                  fontWeight: '500'
                }}
              >
                {extraContent || '자세히 보기 >'}
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
        <div
          className="rounded shadow-sm overflow-hidden"
          style={{
            width: `${previewConfig.containerWidth}px`,
            backgroundColor: backgroundColor
          }}
        >
          {/* 이미지 영역 */}
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '100%',
              height: `${previewConfig.imageHeight}px`,
              backgroundColor: '#f8f9fa'
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="투표 카드 이미지"
                className="img-fluid"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div className="text-center text-muted">
                <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                <div style={{ fontSize: '0.8rem' }}>이미지 없음</div>
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="p-3">
            <div
              className="fw-bold mb-2"
              style={{
                fontSize: '1rem',
                color: titleFontColor,
                lineHeight: '1.3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {title || '투표 광고 제목을 입력하세요'}
            </div>
            <div
              className="mb-3"
              style={{
                fontSize: '0.85rem',
                color: subTitleFontColor,
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {subTitle || '투표 광고 부제목을 입력하세요'}
            </div>

            {/* 버튼 */}
            <div className="d-grid">
              <div
                className="text-center px-3 py-2 rounded"
                style={{
                  fontSize: '0.85rem',
                  color: extraContentFontColor,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  border: `2px solid ${extraContentFontColor}`,
                  fontWeight: '600'
                }}
              >
                {extraContent || '자세히 보기 >'}
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
