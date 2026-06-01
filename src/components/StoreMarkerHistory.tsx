import React, {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeMarkerApi from '../api/storeMarkerApi';
import uploadApi from '../api/uploadApi';
import {StoreMarker, StoreMarkerRequest} from '../types/storeMarker';
import {formatDateTime} from '../utils/dateUtils';

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

const getMarkerImageUrl = (image: any): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || image.imageUrl || image.fileUrl || image.path || '';
};

const getMarkerImageWidth = (image: any, fallback = 0): number => {
  if (!image || typeof image === 'string') return fallback;
  return Number(image.width || image.imageWidth || fallback);
};

const getMarkerImageHeight = (image: any, fallback = 0): number => {
  if (!image || typeof image === 'string') return fallback;
  return Number(image.height || image.imageHeight || fallback);
};

const getSelectedMarkerImage = (marker: any): any => {
  return marker?.selectedMarkerImage || marker?.selectedImage || marker?.selectedMarker || marker?.selectedMarkerImageUrl;
};

const getUnselectedMarkerImage = (marker: any): any => {
  return marker?.unselectedMarkerImage || marker?.unselectedImage || marker?.unselectedMarker || marker?.unselectedMarkerImageUrl;
};

const getMarkerStartDateTime = (marker: any): string => {
  return marker?.period?.startDateTime
    || marker?.startDateTime
    || marker?.startAt
    || marker?.startedAt
    || marker?.startDate
    || marker?.activeStartDateTime
    || '';
};

const getMarkerEndDateTime = (marker: any): string => {
  return marker?.period?.endDateTime
    || marker?.endDateTime
    || marker?.endAt
    || marker?.endedAt
    || marker?.endDate
    || marker?.activeEndDateTime
    || '';
};

const toFormData = (marker: StoreMarker): MarkerFormData => ({
  groupId: marker.groupId || '',
  selectedUrl: getMarkerImageUrl(getSelectedMarkerImage(marker)),
  selectedWidth: String(getMarkerImageWidth(getSelectedMarkerImage(marker), 40)),
  selectedHeight: String(getMarkerImageHeight(getSelectedMarkerImage(marker), 40)),
  unselectedUrl: getMarkerImageUrl(getUnselectedMarkerImage(marker)),
  unselectedWidth: String(getMarkerImageWidth(getUnselectedMarkerImage(marker), 32)),
  unselectedHeight: String(getMarkerImageHeight(getUnselectedMarkerImage(marker), 32)),
  startDateTime: toDateTimeLocal(getMarkerStartDateTime(marker)),
  endDateTime: toDateTimeLocal(getMarkerEndDateTime(marker)),
});

const StoreMarkerHistory: React.FC<StoreMarkerHistoryProps> = ({storeId, isActive = true}) => {
  const [markers, setMarkers] = useState<StoreMarker[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMarkerId, setDeletingMarkerId] = useState<string | null>(null);
  const [editingMarker, setEditingMarker] = useState<StoreMarker | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState<MarkerFormData>(emptyForm);
  const [uploadingField, setUploadingField] = useState<MarkerImageUrlField | null>(null);
  const [filterStartDateTime, setFilterStartDateTime] = useState('');
  const [filterEndDateTime, setFilterEndDateTime] = useState('');

  const hasFilter = useMemo(
    () => Boolean(filterStartDateTime || filterEndDateTime),
    [filterStartDateTime, filterEndDateTime]
  );

  const fetchMarkers = useCallback(async (
    reset = false,
    filterOverride?: {filterStartDateTime: string; filterEndDateTime: string}
  ) => {
    if (!storeId || isLoading) return;

    const nextFilterStartDateTime = filterOverride?.filterStartDateTime ?? filterStartDateTime;
    const nextFilterEndDateTime = filterOverride?.filterEndDateTime ?? filterEndDateTime;

    setIsLoading(true);
    try {
      const response = await storeMarkerApi.getStoreMarkers(
        storeId,
        reset ? null : cursor,
        20,
        {
          filterStartDateTime: toApiDateTime(nextFilterStartDateTime),
          filterEndDateTime: toApiDateTime(nextFilterEndDateTime),
        }
      );

      const {contents = [], cursor: newCursor} = response.data || {};
      setMarkers(prev => reset ? contents : [...prev, ...contents]);
      setCursor(newCursor?.nextCursor || null);
      setHasMore(newCursor?.hasMore || false);
    } catch (error: any) {
      console.error('가게 마커 조회 실패:', error);
      toast.error(error?.message || '가게 마커 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, cursor, filterStartDateTime, filterEndDateTime, isLoading]);

  useEffect(() => {
    if (storeId && isActive) {
      fetchMarkers(true);
    }
    // 필터 변경은 조회 버튼으로만 반영한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, isActive]);

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
        toast.error(response?.data?.message || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
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
      if (editingMarker) {
        await storeMarkerApi.updateStoreMarker(storeId, String(editingMarker.markerId), request);
        toast.success('가게 마커가 수정되었습니다.');
      } else {
        await storeMarkerApi.createStoreMarker(storeId, request);
        toast.success('가게 마커가 생성되었습니다.');
      }

      setShowFormModal(false);
      setEditingMarker(null);
      setFormData(emptyForm);
      fetchMarkers(true);
    } catch (error: any) {
      console.error('가게 마커 저장 실패:', error);
      toast.error(error?.message || '가게 마커 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (marker: StoreMarker) => {
    const confirmed = window.confirm(`정말로 "${marker.groupId}" 마커를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) return;

    setDeletingMarkerId(String(marker.markerId));
    try {
      await storeMarkerApi.deleteStoreMarker(storeId, String(marker.markerId));
      toast.success('가게 마커가 삭제되었습니다.');
      fetchMarkers(true);
    } catch (error: any) {
      console.error('가게 마커 삭제 실패:', error);
      toast.error(error?.message || '가게 마커 삭제에 실패했습니다.');
    } finally {
      setDeletingMarkerId(null);
    }
  };

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    fetchMarkers(true);
  };

  const handleClearFilter = () => {
    setFilterStartDateTime('');
    setFilterEndDateTime('');
    fetchMarkers(true, {filterStartDateTime: '', filterEndDateTime: ''});
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
        <div>
          <h5 className="mb-1 fw-bold text-dark">가게 마커 목록</h5>
          <div className="text-muted small">현재 가게에 등록된 커스텀 핀 이미지 마커를 조회하고 관리합니다.</div>
        </div>
        <div className="d-flex gap-2 align-self-start">
          <button
            className="btn btn-primary btn-sm"
            onClick={openCreateModal}
            disabled={isSubmitting || Boolean(deletingMarkerId)}
          >
            <i className="bi bi-plus-lg me-1"></i>
            신규 생성
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => fetchMarkers(true)}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            새로고침
          </button>
        </div>
      </div>

      <form className="card border-0 shadow-sm mb-3" onSubmit={handleFilterSubmit}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-semibold">활성 기간 시작일 선택</label>
              <input
                type="datetime-local"
                className="form-control"
                value={filterStartDateTime}
                onChange={(event) => setFilterStartDateTime(event.target.value)}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-semibold">활성 기간 종료일 선택</label>
              <input
                type="datetime-local"
                className="form-control"
                value={filterEndDateTime}
                onChange={(event) => setFilterEndDateTime(event.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-dark flex-fill" disabled={isLoading}>
                조회
              </button>
              {hasFilter && (
                <button type="button" className="btn btn-outline-secondary" onClick={handleClearFilter}>
                  초기화
                </button>
              )}
            </div>
          </div>
          <div className="text-muted small mt-2">
            시작일과 종료일은 선택 입력입니다. 입력한 기간 안에 활성화되는 마커만 조회합니다.
          </div>
        </div>
      </form>

      {markers.length === 0 && !isLoading ? (
        <div className="text-center py-5 bg-light rounded-3">
          <div className="bg-white rounded-circle mx-auto mb-3" style={{
            width: '72px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-geo-alt fs-1 text-secondary"></i>
          </div>
          <h6 className="text-dark mb-2">등록된 마커가 없습니다</h6>
          <p className="text-muted mb-3">이 가게에 등록된 커스텀 핀 이미지가 없거나 필터 조건에 맞는 마커가 없습니다.</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <i className="bi bi-plus-lg me-1"></i>
            신규 생성
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {markers.map(marker => (
            <div
              key={marker.markerId}
              className="card border-0 shadow-sm"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#ffffff'
              }}
            >
              <div className="card-body p-0">
                <div className="d-flex flex-column flex-xl-row">
                  <div className="flex-grow-1 p-3 p-md-4">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                      <span
                        className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle"
                        style={{width: '36px', height: '36px'}}
                      >
                        <i className="bi bi-geo-alt-fill"></i>
                      </span>
                      <div className="min-w-0">
                        <h6 className="fw-bold text-dark mb-1">{marker.groupId}</h6>
                        <div className="text-muted small">마커 ID {marker.markerId}</div>
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-6">
                        <div className="bg-light rounded-3 border p-3 h-100">
                          <div className="text-muted small mb-1">
                            <i className="bi bi-calendar-event me-1"></i>
                            시작일
                          </div>
                          <div className="fw-semibold text-dark">{formatDateTime(getMarkerStartDateTime(marker))}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light rounded-3 border p-3 h-100">
                          <div className="text-muted small mb-1">
                            <i className="bi bi-calendar-x me-1"></i>
                            종료일
                          </div>
                          <div className="fw-semibold text-dark">{formatDateTime(getMarkerEndDateTime(marker))}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="d-flex gap-3 align-items-center justify-content-center px-3 px-md-4 py-3 border-top border-xl-top-0 border-xl-start"
                    style={{background: '#f8fafc', minWidth: '240px'}}
                  >
                    <MarkerImagePreview title="선택" image={getSelectedMarkerImage(marker)}/>
                    <MarkerImagePreview title="미선택" image={getUnselectedMarkerImage(marker)}/>
                  </div>

                  <div className="d-flex flex-row flex-xl-column gap-2 justify-content-center p-3 p-md-4 border-top border-xl-top-0">
                    <button
                      className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center gap-1"
                      onClick={() => openEditModal(marker)}
                      disabled={isSubmitting || Boolean(deletingMarkerId)}
                      style={{minWidth: '76px'}}
                    >
                      <i className="bi bi-pencil-square"></i>
                      수정
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center gap-1"
                      onClick={() => handleDelete(marker)}
                      disabled={deletingMarkerId === String(marker.markerId) || isSubmitting}
                      style={{minWidth: '76px'}}
                    >
                      <i className={`bi ${deletingMarkerId === String(marker.markerId) ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                      {deletingMarkerId === String(marker.markerId) ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {hasMore && (
            <button
              className="btn btn-outline-primary rounded-pill align-self-center px-4"
              onClick={() => fetchMarkers(false)}
              disabled={isLoading}
            >
              더 많은 마커 보기
            </button>
          )}
        </div>
      )}

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
  <Modal show={show} onHide={onHide} size="lg" centered backdrop={(isSubmitting || uploadingField) ? 'static' : true}>
    <form onSubmit={onSubmit}>
      <Modal.Header closeButton={!isSubmitting && !uploadingField}>
        <Modal.Title className="fw-bold">
          <i className="bi bi-geo-alt-fill text-primary me-2"></i>
          {editingMarker ? '가게 마커 수정' : '가게 마커 신규 생성'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label fw-semibold">그룹 ID</label>
          <input
            className="form-control"
            value={formData.groupId}
            onChange={(event) => onChange('groupId', event.target.value)}
            placeholder="winter-marker"
            disabled={isSubmitting}
          />
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="border rounded-3 p-3 h-100">
              <div className="fw-semibold mb-2">선택 마커 이미지</div>
              <MarkerImageUrlInput
                field="selectedUrl"
                value={formData.selectedUrl}
                isDisabled={isSubmitting}
                isUploading={uploadingField === 'selectedUrl'}
                placeholder="https://example.com/selected-marker.png"
                onChange={onChange}
                onUploadImage={onUploadImage}
              />
              <MarkerFormImagePreview
                title="선택 마커 미리보기"
                url={formData.selectedUrl}
                width={formData.selectedWidth}
                height={formData.selectedHeight}
              />
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small">가로(px)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.selectedWidth}
                    onChange={(event) => onChange('selectedWidth', event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">세로(px)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.selectedHeight}
                    onChange={(event) => onChange('selectedHeight', event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 h-100">
              <div className="fw-semibold mb-2">미선택 마커 이미지</div>
              <MarkerImageUrlInput
                field="unselectedUrl"
                value={formData.unselectedUrl}
                isDisabled={isSubmitting}
                isUploading={uploadingField === 'unselectedUrl'}
                placeholder="https://example.com/unselected-marker.png"
                onChange={onChange}
                onUploadImage={onUploadImage}
              />
              <MarkerFormImagePreview
                title="미선택 마커 미리보기"
                url={formData.unselectedUrl}
                width={formData.unselectedWidth}
                height={formData.unselectedHeight}
              />
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small">가로(px)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.unselectedWidth}
                    onChange={(event) => onChange('unselectedWidth', event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">세로(px)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.unselectedHeight}
                    onChange={(event) => onChange('unselectedHeight', event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label className="form-label fw-semibold">시작일</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.startDateTime}
              onChange={(event) => onChange('startDateTime', event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">종료일</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.endDateTime}
              onChange={(event) => onChange('endDateTime', event.target.value)}
              disabled={isSubmitting}
            />
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
      <label className={`btn ${isUploading ? 'btn-secondary' : 'btn-outline-primary'} mb-0`}>
        <i className={`bi ${isUploading ? 'bi-hourglass-split' : 'bi-upload'} me-1`}></i>
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
    <div className="form-text">이미지를 업로드하거나 이미지 URL을 직접 입력할 수 있습니다.</div>
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

  return (
    <div className="bg-light rounded-3 border p-3 mb-3">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
        <span className="small fw-semibold text-dark">{title}</span>
        <span className="text-muted" style={{fontSize: '0.72rem'}}>
          {displayWidth} x {displayHeight}
        </span>
      </div>
      <div
        className="bg-white rounded-3 border d-flex align-items-center justify-content-center"
        style={{
          minHeight: '96px',
          overflow: 'hidden'
        }}
      >
        {url.trim() ? (
          <img
            key={url.trim()}
            src={url.trim()}
            alt={title}
            style={{
              width: `${Math.min(displayWidth, 96)}px`,
              height: `${Math.min(displayHeight, 96)}px`,
              objectFit: 'contain'
            }}
            onLoad={(event) => {
              event.currentTarget.style.display = 'block';
            }}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="text-center text-muted small py-3">
            <i className="bi bi-image d-block mb-1" style={{fontSize: '1.4rem'}}></i>
            이미지 URL 입력 또는 업로드 후 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
};

const MarkerImagePreview = ({title, image}: {title: string; image?: any}) => {
  const imageUrl = getMarkerImageUrl(image);
  const width = getMarkerImageWidth(image);
  const height = getMarkerImageHeight(image);

  return (
    <div
      className="bg-white border rounded-3 p-2 text-center shadow-sm"
      style={{width: '92px'}}
    >
      <div className="mb-2 d-flex align-items-center justify-content-center" style={{
        width: '100%',
        height: '58px',
        overflow: 'hidden'
      }}>
        {imageUrl ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`${title} 마커`}
            style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
              if (fallback) {
                fallback.classList.remove('d-none');
              }
            }}
          />
        ) : null}
        <div className={`text-muted small ${imageUrl ? 'd-none' : ''}`}>
          <i className="bi bi-image d-block"></i>
          없음
        </div>
      </div>
      <div className="small fw-bold text-dark">{title}</div>
      <div className="text-muted" style={{fontSize: '0.72rem'}}>
        {width || 0} x {height || 0}
      </div>
    </div>
  );
};

export default StoreMarkerHistory;
