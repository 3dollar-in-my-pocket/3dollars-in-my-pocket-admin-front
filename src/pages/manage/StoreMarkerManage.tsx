import {FormEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import storeMarkerApi from '../../api/storeMarkerApi';
import EmptyState from '../../components/common/EmptyState';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import StoreDetailModal from '../store/StoreDetailModal';
import {StoreMarker} from '../../types/storeMarker';
import {formatDateTime} from '../../utils/dateUtils';
import {toast} from 'react-toastify';

const toApiDateTime = (value: string): string => {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
};

const getMarkerImageUrl = (image: any): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.imageUrl || image.url || image.fileUrl || image.path || '';
};

const getMarkerImageWidth = (image: any): number => {
  if (!image || typeof image === 'string') return 0;
  return Number(image.width || image.imageWidth || 0);
};

const getMarkerImageHeight = (image: any): number => {
  if (!image || typeof image === 'string') return 0;
  return Number(image.height || image.imageHeight || 0);
};

const getMarkerStartDateTime = (marker: any): string => {
  return marker?.period?.startDateTime || marker?.startDateTime || '';
};

const getMarkerEndDateTime = (marker: any): string => {
  return marker?.period?.endDateTime || marker?.endDateTime || '';
};

const StoreMarkerManage = () => {
  const [markers, setMarkers] = useState<StoreMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filterStartDateTime, setFilterStartDateTime] = useState('');
  const [filterEndDateTime, setFilterEndDateTime] = useState('');
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const hasFilter = useMemo(
    () => Boolean(filterStartDateTime || filterEndDateTime),
    [filterStartDateTime, filterEndDateTime]
  );

  const fetchMarkers = useCallback(async (
    reset = false,
    filterOverride?: {filterStartDateTime: string; filterEndDateTime: string}
  ) => {
    if (isLoadingRef.current) return;

    const nextFilterStartDateTime = filterOverride?.filterStartDateTime ?? filterStartDateTime;
    const nextFilterEndDateTime = filterOverride?.filterEndDateTime ?? filterEndDateTime;

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await storeMarkerApi.getAllStoreMarkers(
        reset ? null : cursorRef.current,
        20,
        {
          filterStartDateTime: toApiDateTime(nextFilterStartDateTime),
          filterEndDateTime: toApiDateTime(nextFilterEndDateTime),
        }
      );

      const {contents = [], cursor} = response.data || {};
      setMarkers(prev => reset ? contents : [...prev, ...contents]);
      cursorRef.current = cursor?.nextCursor || null;
      setHasMore(cursor?.hasMore || false);
    } catch (error: any) {
      console.error('전체 가게 마커 조회 실패:', error);
      toast.error(error?.message || '가게 마커 목록을 불러오지 못했습니다.');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [filterStartDateTime, filterEndDateTime]);

  useEffect(() => {
    fetchMarkers(true);
  }, [fetchMarkers]);

  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchMarkers(false),
    threshold: 0.1
  });

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    cursorRef.current = null;
    fetchMarkers(true);
  };

  const handleClearFilter = () => {
    setFilterStartDateTime('');
    setFilterEndDateTime('');
    cursorRef.current = null;
    fetchMarkers(true, {filterStartDateTime: '', filterEndDateTime: ''});
  };

  const openStoreDetail = (marker: StoreMarker) => {
    setSelectedStore({
      storeId: marker.storeId,
      name: `가게 ${marker.storeId}`,
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-primary">
            <i className="bi bi-geo-alt-fill me-2"></i>
            가게 지도 핀 관리
          </h2>
          <div className="text-muted">전체 가게에 등록된 커스텀 지도 핀 마커를 조회합니다.</div>
        </div>
        <button
          className="btn btn-outline-primary align-self-start"
          onClick={() => fetchMarkers(true)}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          새로고침
        </button>
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

      <div
        ref={scrollContainerRef}
        style={{maxHeight: 'calc(100vh - 290px)', overflowY: 'auto'}}
      >
        {markers.length === 0 && !isLoading ? (
          <EmptyState
            icon="bi-geo-alt"
            title="등록된 가게 마커가 없습니다"
            description="전체 가게 범위에서 조회된 마커가 없습니다."
          />
        ) : (
          <div className="row g-3">
            {markers.map((marker) => (
              <div key={marker.markerId} className="col-12 col-xl-6">
                <div className="card border-0 shadow-sm h-100" style={{borderRadius: '12px', overflow: 'hidden'}}>
                  <div className="card-body p-0">
                    <div className="d-flex flex-column flex-lg-row h-100">
                      <div className="flex-grow-1 p-3 p-md-4">
                        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                          <div className="d-flex align-items-center gap-2 min-w-0">
                            <span
                              className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle flex-shrink-0"
                              style={{width: '36px', height: '36px'}}
                            >
                              <i className="bi bi-geo-alt-fill"></i>
                            </span>
                            <div className="min-w-0">
                              <h6 className="fw-bold text-dark mb-1 text-truncate">{marker.groupId}</h6>
                              <div className="text-muted small">마커 ID {marker.markerId}</div>
                            </div>
                          </div>
                          <button
                            className="btn btn-outline-primary btn-sm flex-shrink-0"
                            onClick={() => openStoreDetail(marker)}
                          >
                            <i className="bi bi-shop me-1"></i>
                            가게 상세
                          </button>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-secondary bg-opacity-10 text-dark border rounded-pill px-3 py-2">
                            Store ID {marker.storeId || '-'}
                          </span>
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
                        className="d-flex gap-3 align-items-center justify-content-center px-3 px-md-4 py-3 border-top border-lg-top-0 border-lg-start"
                        style={{background: '#f8fafc', minWidth: '220px'}}
                      >
                        <MarkerImagePreview title="선택" image={marker.selectedMarkerImage}/>
                        <MarkerImagePreview title="미선택" image={marker.unselectedMarkerImage}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {hasMore && markers.length > 0 && (
          <div ref={loadMoreRef} className="text-center py-4">
            <span className="text-muted">더 많은 마커를 불러오는 중...</span>
          </div>
        )}
      </div>

      <StoreDetailModal
        show={Boolean(selectedStore)}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={undefined}
        onStoreDeleted={undefined}
      />
    </div>
  );
};

const MarkerImagePreview = ({title, image}: {title: string; image?: any}) => {
  const imageUrl = getMarkerImageUrl(image);
  const width = getMarkerImageWidth(image);
  const height = getMarkerImageHeight(image);

  return (
    <div className="bg-white border rounded-3 p-2 text-center shadow-sm" style={{width: '92px'}}>
      <div className="mb-2 d-flex align-items-center justify-content-center" style={{
        width: '100%',
        height: '58px',
        overflow: 'hidden'
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} 마커`}
            style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
          />
        ) : (
          <div className="text-muted small">
            <i className="bi bi-image d-block"></i>
            없음
          </div>
        )}
      </div>
      <div className="small fw-bold text-dark">{title}</div>
      <div className="text-muted" style={{fontSize: '0.72rem'}}>
        {width || 0} x {height || 0}
      </div>
    </div>
  );
};

export default StoreMarkerManage;
