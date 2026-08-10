import React, {FormEvent, useCallback, useMemo, useState} from 'react';
import {Image} from '@/types/domain';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeMarkerApi from '@/api/storeMarkerApi';
import uploadApi from '@/api/uploadApi';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import {StoreMarker, StoreMarkerRequest} from '@/types/storeMarker';
import {formatDateTime} from '@/utils/dateUtils';
import {getAdStatus} from '@/utils/timeUtils';

interface StoreMarkerHistoryProps {
  storeId: string;
  isActive?: boolean;
}

interface MarkerFormData {
  groupId: string;
  selectedUrl: string;
  selectedWidth: string;
  selectedHeight: string;
  unselectedUrl: string;
  unselectedWidth: string;
  unselectedHeight: string;
  startDateTime: string;
  endDateTime: string;
}

type MarkerImageUrlField = 'selectedUrl' | 'unselectedUrl';

const emptyForm: MarkerFormData = {
  groupId: '',
  selectedUrl: '',
  selectedWidth: '40',
  selectedHeight: '40',
  unselectedUrl: '',
  unselectedWidth: '32',
  unselectedHeight: '32',
  startDateTime: '',
  endDateTime: '',
};

const toDateTimeLocal = (value?: string): string => {
  if (!value) return '';
  return value.substring(0, 16);
};

const toApiDateTime = (value: string): string => {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
};

const getMarkerImageUrl = (image?: Image): string => {
  if (!image) return '';
  return image.imageUrl || '';
};

const getMarkerImageSize = (value: number | undefined, fallback = 0): number => {
  return Number(value || fallback);
};

const toFormData = (marker: StoreMarker): MarkerFormData => ({
  groupId: marker.groupId || '',
  selectedUrl: getMarkerImageUrl(marker.selectedMarkerImage),
  selectedWidth: String(getMarkerImageSize(marker.selectedMarkerImage?.width, 40)),
  selectedHeight: String(getMarkerImageSize(marker.selectedMarkerImage?.height, 40)),
  unselectedUrl: getMarkerImageUrl(marker.unselectedMarkerImage),
  unselectedWidth: String(getMarkerImageSize(marker.unselectedMarkerImage?.width, 32)),
  unselectedHeight: String(getMarkerImageSize(marker.unselectedMarkerImage?.height, 32)),
  startDateTime: toDateTimeLocal(marker.period?.startDateTime),
  endDateTime: toDateTimeLocal(marker.period?.endDateTime),
});

const StoreMarkerHistory: React.FC<StoreMarkerHistoryProps> = ({storeId, isActive = true}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMarkerId, setDeletingMarkerId] = useState<string | null>(null);
  const [editingMarker, setEditingMarker] = useState<StoreMarker | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState<MarkerFormData>(emptyForm);
  const [uploadingField, setUploadingField] = useState<MarkerImageUrlField | null>(null);
  // 입력 중인 필터 값. 조회 버튼을 눌러야 appliedFilter에 반영된다.
  const [filterStartDateTime, setFilterStartDateTime] = useState('');
  const [filterEndDateTime, setFilterEndDateTime] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({startDateTime: '', endDateTime: ''});

  const hasFilter = useMemo(
    () => Boolean(filterStartDateTime || filterEndDateTime),
    [filterStartDateTime, filterEndDateTime]
  );

  const fetchMarkers = useCallback(
    (cursor: string | null) => storeMarkerApi.getStoreMarkers(storeId, cursor, 20, {
      filterStartDateTime: toApiDateTime(appliedFilter.startDateTime),
      filterEndDateTime: toApiDateTime(appliedFilter.endDateTime),
    }),
    [storeId, appliedFilter]
  );

  const {
    items: markers,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreMarker>({
    fetcher: fetchMarkers,
    enabled: Boolean(storeId) && isActive,
    deps: [storeId, appliedFilter],
    errorMessage: '가게 마커 목록을 불러오지 못했습니다.'
  });

  const handleChange = (field: keyof MarkerFormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleImageUpload = async (field: MarkerImageUrlField, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setUploadingField(field);
    try {
      const response = await uploadApi.uploadImage('ADVERTISEMENT_IMAGE', file);

      if (response?.ok && response.data) {
        handleChange(field, response.data);
        toast.success('이미지가 업로드되었습니다.');
      } else {
        toast.error(response?.message || '이미지 업로드에 실패했습니다.');
      }
    } finally {
      setUploadingField(null);
    }
  };

  const buildRequest = (): StoreMarkerRequest | null => {
    const selectedWidth = Number(formData.selectedWidth);
    const selectedHeight = Number(formData.selectedHeight);
    const unselectedWidth = Number(formData.unselectedWidth);
    const unselectedHeight = Number(formData.unselectedHeight);

    if (!formData.groupId.trim()) {
      toast.warn('마커 그룹 ID를 입력해주세요.');
      return null;
    }

    if (!formData.selectedUrl.trim() || !formData.unselectedUrl.trim()) {
      toast.warn('선택/미선택 마커 이미지 URL을 모두 입력해주세요.');
      return null;
    }

    if ([selectedWidth, selectedHeight, unselectedWidth, unselectedHeight].some(value => !Number.isFinite(value) || value <= 0)) {
      toast.warn('이미지 크기는 1 이상의 숫자로 입력해주세요.');
      return null;
    }

    if (!formData.startDateTime || !formData.endDateTime) {
      toast.warn('마커 노출 시작일과 종료일을 입력해주세요.');
      return null;
    }

    if (new Date(formData.startDateTime).getTime() > new Date(formData.endDateTime).getTime()) {
      toast.warn('종료일은 시작일 이후여야 합니다.');
      return null;
    }

    return {
      groupId: formData.groupId.trim(),
      selectedMarkerImage: {
        url: formData.selectedUrl.trim(),
        width: selectedWidth,
        height: selectedHeight,
      },
      unselectedMarkerImage: {
        url: formData.unselectedUrl.trim(),
        width: unselectedWidth,
        height: unselectedHeight,
      },
      startDateTime: toApiDateTime(formData.startDateTime),
      endDateTime: toApiDateTime(formData.endDateTime),
    };
  };

  const closeFormModal = () => {
    if (isSubmitting || uploadingField) return;
    setShowFormModal(false);
    setEditingMarker(null);
    setFormData(emptyForm);
  };

  const openCreateModal = () => {
    setEditingMarker(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  const openEditModal = (marker: StoreMarker) => {
    setEditingMarker(marker);
    setFormData(toFormData(marker));
    setShowFormModal(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const request = buildRequest();
    if (!request) return;

    setIsSubmitting(true);
    try {
      const response = editingMarker
        ? await storeMarkerApi.updateStoreMarker(storeId, String(editingMarker.markerId), request)
        : await storeMarkerApi.createStoreMarker(storeId, request);

      if (!response?.ok) {
        toast.error(response?.message || '가게 마커 저장에 실패했습니다.');
        return;
      }

      toast.success(editingMarker ? '가게 마커가 수정되었습니다.' : '가게 마커가 생성되었습니다.');
      setShowFormModal(false);
      setEditingMarker(null);
      setFormData(emptyForm);
      refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (marker: StoreMarker) => {
    const confirmed = window.confirm(`정말로 "${marker.groupId}" 마커를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) return;

    setDeletingMarkerId(String(marker.markerId));
    try {
      const response = await storeMarkerApi.deleteStoreMarker(storeId, String(marker.markerId));
      if (!response?.ok) {
        toast.error(response?.message || '가게 마커 삭제에 실패했습니다.');
        return;
      }
      toast.success('가게 마커가 삭제되었습니다.');
      refresh();
    } finally {
      setDeletingMarkerId(null);
    }
  };

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    setAppliedFilter({startDateTime: filterStartDateTime, endDateTime: filterEndDateTime});
  };

  const handleClearFilter = () => {
    setFilterStartDateTime('');
    setFilterEndDateTime('');
    setAppliedFilter({startDateTime: '', endDateTime: ''});
  };

  if (!isActive) {
    return null;
  }

  return (
    <>
      {/* 활성 기간 필터. 조회 조건을 먼저 확인할 수 있도록 목록 위에 둔다. */}
      <form className="px-3 px-md-4 pt-3" onSubmit={handleFilterSubmit}>
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-5">
            <label className="form-label" htmlFor="store-marker-filter-start">활성 기간 시작일</label>
            <input
              id="store-marker-filter-start"
              type="datetime-local"
              className="form-control"
              value={filterStartDateTime}
              onChange={(event) => setFilterStartDateTime(event.target.value)}
            />
          </div>
          <div className="col-12 col-md-5">
            <label className="form-label" htmlFor="store-marker-filter-end">활성 기간 종료일</label>
            <input
              id="store-marker-filter-end"
              type="datetime-local"
              className="form-control"
              value={filterEndDateTime}
              onChange={(event) => setFilterEndDateTime(event.target.value)}
            />
          </div>
          <div className="col-12 col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-fill" disabled={isLoading}>
              <i className="bi bi-search me-1"/>
              조회
            </button>
            {hasFilter && (
              <button type="button" className="btn btn-outline-secondary" onClick={handleClearFilter}>
                초기화
              </button>
            )}
          </div>
          <div className="col-12">
            <p className="form-text mt-0 mb-0">
              시작일과 종료일은 선택 입력입니다. 입력한 기간 안에 활성화되는 마커만 조회합니다.
            </p>
          </div>
        </div>
      </form>

      <HistoryPanel
        title="가게 지도 핀"
        icon="bi-geo-alt-fill"
        count={markers.length}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="등록된 마커가 없습니다"
        emptyDescription="이 가게에 등록된 커스텀 핀 이미지가 없거나 필터 조건에 맞는 마커가 없습니다."
        aside={
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={openCreateModal}
            disabled={isSubmitting || Boolean(deletingMarkerId)}
          >
            <i className="bi bi-plus-lg me-1"/>
            신규 생성
          </button>
        }
      >
        <div className="row g-3">
          {markers.map(marker => (
            <div key={marker.markerId} className="col-12 col-xl-6">
              <MarkerCard
                marker={marker}
                isBusy={isSubmitting || Boolean(deletingMarkerId)}
                isSubmitting={isSubmitting}
                isDeleting={deletingMarkerId === String(marker.markerId)}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      </HistoryPanel>

      <MarkerFormModal
        show={showFormModal}
        editingMarker={editingMarker}
        formData={formData}
        isSubmitting={isSubmitting}
        uploadingField={uploadingField}
        onHide={closeFormModal}
        onChange={handleChange}
        onUploadImage={handleImageUpload}
        onSubmit={handleSubmit}
      />
    </>
  );
};

interface MarkerCardProps {
  marker: StoreMarker;
  /** 저장/삭제 진행 중이면 수정 버튼을 비활성화 */
  isBusy: boolean;
  /** 폼 저장이 진행 중인지 */
  isSubmitting: boolean;
  /** 이 마커의 삭제가 진행 중인지 */
  isDeleting: boolean;
  onEdit: (marker: StoreMarker) => void;
  onDelete: (marker: StoreMarker) => void;
}

/**
 * 가게 지도 핀 카드
 *
 * 마커 이미지가 핵심 정보이므로 크게 배치하고,
 * 활성 기간은 상태 배지로 한눈에 구분한다.
 */
const MarkerCard = ({marker, isBusy, isSubmitting, isDeleting, onEdit, onDelete}: MarkerCardProps) => {
  const status = getAdStatus(marker.period?.startDateTime, marker.period?.endDateTime);

  return (
    <div className="item-card marker-card h-100">
      <div className="item-card__body">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`badge ${status.badgeClass}`}>{status.label}</span>
              {status.status !== 'ended' && (
                <span className="marker-card__countdown">{status.timeText}</span>
              )}
            </div>
            <h3 className="item-card__name text-truncate">{marker.groupId}</h3>
            <p className="item-card__desc mb-0 font-monospace">마커 {marker.markerId}</p>
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(marker)}
              disabled={isBusy}
            >
              <i className="bi bi-pencil-square me-1"/>
              수정
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(marker)}
              disabled={isDeleting || isSubmitting}
            >
              <i className={`bi ${isDeleting ? 'bi-hourglass-split' : 'bi-trash'} me-1`}/>
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>

        <div className="marker-card__previews">
          <MarkerImagePreview title="선택" image={marker.selectedMarkerImage}/>
          <MarkerImagePreview title="미선택" image={marker.unselectedMarkerImage}/>
        </div>

        <div className="form-summary mt-3">
          <div className="form-summary__row">
            <span className="form-summary__label">시작일</span>
            <span className="form-summary__value">{formatDateTime(marker.period?.startDateTime)}</span>
          </div>
          <div className="form-summary__row">
            <span className="form-summary__label">종료일</span>
            <span className="form-summary__value">{formatDateTime(marker.period?.endDateTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MarkerFormModalProps {
  show: boolean;
  editingMarker: StoreMarker | null;
  formData: MarkerFormData;
  isSubmitting: boolean;
  uploadingField: MarkerImageUrlField | null;
  onHide: () => void;
  onChange: (field: keyof MarkerFormData, value: string) => void;
  onUploadImage: (field: MarkerImageUrlField, file: File) => void;
  onSubmit: (event: FormEvent) => void;
}

const MarkerFormModal: React.FC<MarkerFormModalProps> = ({
                                                           show,
                                                           editingMarker,
                                                           formData,
                                                           isSubmitting,
                                                           uploadingField,
                                                           onHide,
                                                           onChange,
                                                           onUploadImage,
                                                           onSubmit,
                                                         }) => (
  <Modal
    show={show}
    onHide={onHide}
    size="lg"
    centered
    scrollable
    className="app-modal"
    backdrop={(isSubmitting || uploadingField) ? 'static' : true}
  >
    <form onSubmit={onSubmit}>
      <Modal.Header closeButton={!isSubmitting && !uploadingField}>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className="bi bi-geo-alt-fill"/>
            {editingMarker ? '가게 마커 수정' : '가게 마커 신규 생성'}
          </Modal.Title>
          {editingMarker && (
            <p className="app-modal__subtitle font-monospace">마커 {editingMarker.markerId}</p>
          )}
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* 기본 정보 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-info-circle"/>
            기본 정보
          </h3>
          <label className="form-label" htmlFor="marker-form-group-id">그룹 ID</label>
          <input
            id="marker-form-group-id"
            className="form-control"
            value={formData.groupId}
            onChange={(event) => onChange('groupId', event.target.value)}
            placeholder="winter-marker"
            disabled={isSubmitting}
          />
        </div>

        {/* 마커 이미지 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-pin-map"/>
            마커 이미지
          </h3>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <MarkerImageFields
                title="선택 마커 이미지"
                urlField="selectedUrl"
                widthField="selectedWidth"
                heightField="selectedHeight"
                formData={formData}
                isSubmitting={isSubmitting}
                uploadingField={uploadingField}
                placeholder="https://example.com/selected-marker.png"
                onChange={onChange}
                onUploadImage={onUploadImage}
              />
            </div>
            <div className="col-12 col-md-6">
              <MarkerImageFields
                title="미선택 마커 이미지"
                urlField="unselectedUrl"
                widthField="unselectedWidth"
                heightField="unselectedHeight"
                formData={formData}
                isSubmitting={isSubmitting}
                uploadingField={uploadingField}
                placeholder="https://example.com/unselected-marker.png"
                onChange={onChange}
                onUploadImage={onUploadImage}
              />
            </div>
          </div>
          <p className="form-text mt-2 mb-0">체커보드 배경은 이미지의 투명 영역을 표시합니다.</p>
        </div>

        {/* 활성 기간 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-calendar-range"/>
            활성 기간
          </h3>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="marker-form-start">시작일</label>
              <input
                id="marker-form-start"
                type="datetime-local"
                className="form-control"
                value={formData.startDateTime}
                onChange={(event) => onChange('startDateTime', event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="marker-form-end">종료일</label>
              <input
                id="marker-form-end"
                type="datetime-local"
                className="form-control"
                value={formData.endDateTime}
                onChange={(event) => onChange('endDateTime', event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onHide}
          disabled={isSubmitting || Boolean(uploadingField)}
        >
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || Boolean(uploadingField)}>
          {isSubmitting ? '저장 중...' : uploadingField ? '업로드 중...' : editingMarker ? '수정' : '등록'}
        </button>
      </Modal.Footer>
    </form>
  </Modal>
);

interface MarkerImageFieldsProps {
  title: string;
  urlField: MarkerImageUrlField;
  widthField: keyof MarkerFormData;
  heightField: keyof MarkerFormData;
  formData: MarkerFormData;
  isSubmitting: boolean;
  uploadingField: MarkerImageUrlField | null;
  placeholder: string;
  onChange: (field: keyof MarkerFormData, value: string) => void;
  onUploadImage: (field: MarkerImageUrlField, file: File) => void;
}

/** 마커 이미지 한 벌 (URL 입력 + 미리보기 + 크기) */
const MarkerImageFields: React.FC<MarkerImageFieldsProps> = ({
                                                              title,
                                                              urlField,
                                                              widthField,
                                                              heightField,
                                                              formData,
                                                              isSubmitting,
                                                              uploadingField,
                                                              placeholder,
                                                              onChange,
                                                              onUploadImage,
                                                            }) => (
  <div className="h-100">
    <label className="form-label">{title}</label>
    <MarkerImageUrlInput
      field={urlField}
      value={formData[urlField]}
      isDisabled={isSubmitting}
      isUploading={uploadingField === urlField}
      placeholder={placeholder}
      onChange={onChange}
      onUploadImage={onUploadImage}
    />
    <MarkerFormImagePreview
      title={title}
      url={formData[urlField]}
      width={formData[widthField]}
      height={formData[heightField]}
    />
    <div className="row g-2 mt-2">
      <div className="col-6">
        <label className="form-label" htmlFor={`marker-form-${widthField}`}>가로(px)</label>
        <input
          id={`marker-form-${widthField}`}
          type="number"
          min="1"
          className="form-control"
          value={formData[widthField]}
          onChange={(event) => onChange(widthField, event.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="col-6">
        <label className="form-label" htmlFor={`marker-form-${heightField}`}>세로(px)</label>
        <input
          id={`marker-form-${heightField}`}
          type="number"
          min="1"
          className="form-control"
          value={formData[heightField]}
          onChange={(event) => onChange(heightField, event.target.value)}
          disabled={isSubmitting}
        />
      </div>
    </div>
  </div>
);

interface MarkerImageUrlInputProps {
  field: MarkerImageUrlField;
  value: string;
  isDisabled: boolean;
  isUploading: boolean;
  placeholder: string;
  onChange: (field: keyof MarkerFormData, value: string) => void;
  onUploadImage: (field: MarkerImageUrlField, file: File) => void;
}

const MarkerImageUrlInput: React.FC<MarkerImageUrlInputProps> = ({
                                                                   field,
                                                                   value,
                                                                   isDisabled,
                                                                   isUploading,
                                                                   placeholder,
                                                                   onChange,
                                                                   onUploadImage,
                                                                 }) => (
  <div className="mb-2">
    <div className="input-group">
      <input
        className="form-control"
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={placeholder}
        disabled={isDisabled || isUploading}
      />
      <label className={`btn ${isUploading ? 'btn-outline-secondary' : 'btn-outline-primary'} mb-0`}>
        <i className={`bi ${isUploading ? 'bi-hourglass-split' : 'bi-upload'} me-1`}/>
        {isUploading ? '업로드 중' : '업로드'}
        <input
          type="file"
          accept="image/*"
          className="d-none"
          disabled={isDisabled || isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUploadImage(field, file);
            }
            event.target.value = '';
          }}
        />
      </label>
    </div>
    <p className="form-text mb-0">이미지를 업로드하거나 이미지 URL을 직접 입력할 수 있습니다.</p>
  </div>
);

const MarkerFormImagePreview = ({
                                  title,
                                  url,
                                  width,
                                  height,
                                }: {
  title: string;
  url: string;
  width: string;
  height: string;
}) => {
  const parsedWidth = Number(width);
  const parsedHeight = Number(height);
  const displayWidth = Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : 40;
  const displayHeight = Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : 40;
  const trimmedUrl = url.trim();

  return (
    <div className="marker-preview marker-preview--lg">
      {/* 밝은/어두운 마커 모두 보이도록 체커보드 배경 위에 올린다 */}
      <div className="marker-preview__frame marker-preview__frame--checker">
        {trimmedUrl ? (
          <img
            key={trimmedUrl}
            src={trimmedUrl}
            alt={`${title} 미리보기`}
            style={{
              width: `${Math.min(displayWidth, 96)}px`,
              height: `${Math.min(displayHeight, 96)}px`
            }}
            onLoad={(event) => {
              event.currentTarget.style.display = 'block';
            }}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <i className="bi bi-image text-body-tertiary"/>
        )}
      </div>
      <span className="marker-preview__title">미리보기</span>
      <span className="marker-preview__size">{displayWidth} × {displayHeight}</span>
    </div>
  );
};

const MarkerImagePreview = ({title, image}: { title: string; image?: Image }) => {
  const imageUrl = getMarkerImageUrl(image);
  const width = getMarkerImageSize(image?.width);
  const height = getMarkerImageSize(image?.height);

  return (
    <div className="marker-preview marker-preview--lg">
      {/* 밝은/어두운 마커 모두 보이도록 체커보드 배경 위에 올린다 */}
      <div className="marker-preview__frame marker-preview__frame--checker">
        {imageUrl ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`${title} 마커`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <i className="bi bi-image text-body-tertiary"/>
        )}
      </div>
      <span className="marker-preview__title">{title}</span>
      <span className="marker-preview__size">
        {width || height ? `${width || 0} × ${height || 0}` : '크기 정보 없음'}
      </span>
    </div>
  );
};

export default StoreMarkerHistory;
