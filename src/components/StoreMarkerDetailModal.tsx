import {Modal} from 'react-bootstrap';
import DetailField from '@/components/common/DetailField';
import {Image} from '@/types/domain';
import {StoreMarker} from '@/types/storeMarker';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {getAdStatus} from '@/utils/timeUtils';

interface StoreMarkerDetailModalProps {
  show: boolean;
  onHide: () => void;
  marker: StoreMarker | null;
  /** 가게 상세로 이동. 없으면 버튼을 숨깁니다. */
  onStoreClick?: ((storeId: number) => void) | null;
}

/**
 * 가게 지도 핀(마커) 상세 모달
 *
 * 마커 단건 조회 API가 없어 목록에서 받은 항목을 그대로 표시합니다.
 */
const StoreMarkerDetailModal = ({show, onHide, marker, onStoreClick}: StoreMarkerDetailModalProps) => {
  if (!marker) return null;

  const status = getAdStatus(marker.period?.startDateTime, marker.period?.endDateTime);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable className="app-modal">
      <Modal.Header closeButton>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className="bi bi-geo-alt-fill"/>
            지도 핀 상세
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">마커 {marker.markerId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
          <span className={`badge ${status.badgeClass}`}>{status.label}</span>
          {status.status !== 'ended' && (
            <span className="badge bg-light text-secondary">
              <i className="bi bi-clock me-1"/>
              {status.timeText}
            </span>
          )}
        </div>

        {/* 마커 이미지 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-pin-map"/>
            마커 이미지
          </h3>
          <div className="row g-3">
            <div className="col-6">
              <MarkerImageDetail title="선택 상태" image={marker.selectedMarkerImage}/>
            </div>
            <div className="col-6">
              <MarkerImageDetail title="미선택 상태" image={marker.unselectedMarkerImage}/>
            </div>
          </div>
          <p className="form-text mt-2 mb-0">
            체커보드 배경은 이미지의 투명 영역을 표시합니다.
          </p>
        </div>

        {/* 기본 정보 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-info-circle"/>
            기본 정보
          </h3>
          <div className="row g-3">
            <DetailField label="그룹 ID" className="col-12 col-md-6" monospace>
              {marker.groupId}
            </DetailField>
            <DetailField label="마커 ID" className="col-6 col-md-3" monospace>
              {marker.markerId}
            </DetailField>
            <DetailField label="가게 ID" className="col-6 col-md-3" monospace>
              {marker.storeId}
            </DetailField>
          </div>
        </div>

        {/* 활성 기간 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-calendar-range"/>
            활성 기간
          </h3>
          <div className="row g-3">
            <DetailField label="시작일시" className="col-12 col-md-6">
              {formatDateTime(marker.period?.startDateTime)}
            </DetailField>
            <DetailField label="종료일시" className="col-12 col-md-6">
              {formatDateTime(marker.period?.endDateTime)}
            </DetailField>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        {onStoreClick && marker.storeId && (
          <button
            className="btn btn-outline-primary me-auto"
            onClick={() => onStoreClick(marker.storeId)}
          >
            <i className="bi bi-shop me-1"/>
            가게 상세
          </button>
        )}
        <button className="btn btn-outline-secondary" onClick={onHide}>
          닫기
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const MarkerImageDetail = ({title, image}: { title: string; image?: Image }) => {
  const imageUrl = image?.imageUrl || '';

  return (
    <div className="marker-preview marker-preview--xl">
      <div className="marker-preview__frame marker-preview__frame--checker">
        {imageUrl ? (
          <img src={imageUrl} alt={`${title} 마커`}/>
        ) : (
          <i className="bi bi-image text-body-tertiary"/>
        )}
      </div>
      <span className="marker-preview__title">{title}</span>
      <span className="marker-preview__size">
        {image?.width || image?.height ? `${image?.width || 0} × ${image?.height || 0}` : '크기 정보 없음'}
      </span>
      {imageUrl && (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-link p-0"
        >
          원본 보기
          <i className="bi bi-box-arrow-up-right ms-1"/>
        </a>
      )}
    </div>
  );
};

export default StoreMarkerDetailModal;
