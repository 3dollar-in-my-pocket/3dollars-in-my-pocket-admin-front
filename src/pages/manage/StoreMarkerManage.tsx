import {FormEvent, useCallback, useMemo, useState} from 'react';
import {Image} from '@/types/domain';
import storeMarkerApi from '@/api/storeMarkerApi';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';
import useCursorPagination from '@/hooks/useCursorPagination';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import StoreDetailModal from '@/pages/store/StoreDetailModal';
import StoreMarkerDetailModal from '@/components/StoreMarkerDetailModal';
import {StoreMarker} from '@/types/storeMarker';
import {formatDateTime} from '@/utils/dateUtils';
import {getAdStatus} from '@/utils/timeUtils';
import {toast} from 'react-toastify';
import BulkMarkerFormModal from '@/components/store/BulkMarkerFormModal';
import BulkSelectionToolbar from '@/components/common/BulkSelectionToolbar';
import useBulkSelection from '@/hooks/useBulkSelection';
import type {BulkSelectHandler} from '@/types/common';

const toApiDateTime = (value: string): string => {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
};

const getMarkerImageUrl = (image?: Image): string => {
  if (!image) return '';
  return image.imageUrl || '';
};

const getMarkerImageSize = (value?: number): number => Number(value || 0);

/** 마커 일괄 수정/삭제 API가 한 번에 받을 수 있는 최대 개수 */
const MAX_BULK_SELECTION = 50;

const StoreMarkerManage = () => {
  const [filterStartDateTime, setFilterStartDateTime] = useState('');
  const [filterEndDateTime, setFilterEndDateTime] = useState('');
  // 입력 중인 필터 값. 조회 버튼을 눌러야 appliedFilter에 반영된다.
  const [appliedFilter, setAppliedFilter] = useState({startDateTime: '', endDateTime: ''});
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<StoreMarker | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const hasFilter = useMemo(
    () => Boolean(filterStartDateTime || filterEndDateTime),
    [filterStartDateTime, filterEndDateTime]
  );

  const fetchMarkers = useCallback(
    (cursor: string | null) => storeMarkerApi.getAllStoreMarkers(cursor, 20, {
      filterStartDateTime: toApiDateTime(appliedFilter.startDateTime),
      filterEndDateTime: toApiDateTime(appliedFilter.endDateTime),
    }),
    [appliedFilter]
  );

  const {
    items: markers,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreMarker>({
    fetcher: fetchMarkers,
    deps: [appliedFilter],
    errorMessage: '가게 마커 목록을 불러오지 못했습니다.'
  });

  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1
  });

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    setAppliedFilter({startDateTime: filterStartDateTime, endDateTime: filterEndDateTime});
  };

  const handleClearFilter = () => {
    setFilterStartDateTime('');
    setFilterEndDateTime('');
    setAppliedFilter({startDateTime: '', endDateTime: ''});
  };

  const openStoreDetail = (storeId: number) => {
    setSelectedStore({
      storeId,
      name: `가게 ${storeId}`,
    });
    setSelectedMarker(null);
  };

  const selection = useBulkSelection<StoreMarker, number>({
    items: markers,
    getKey: marker => marker.markerId,
    max: MAX_BULK_SELECTION,
    // 조회 조건이 바뀌면 화면에서 사라진 마커가 선택된 채 남지 않도록 초기화합니다.
    resetDeps: [appliedFilter]
  });
  const selectedIds = selection.selectedList;

  const deleteSelected = async () => {
    if (!window.confirm(`선택한 마커 ${selectedIds.length}개를 삭제하시겠습니까?`)) return;
    setIsBulkDeleting(true);
    try {
      const response = await storeMarkerApi.deleteStoreMarkersBulk(selectedIds);
      if (response.ok) {
        toast.success('선택한 마커 삭제 요청이 완료되었습니다.');
        selection.clear();
        refresh();
      }
    } finally { setIsBulkDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        description="전체 가게에 등록된 커스텀 지도 핀 마커를 조회합니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
      />

      <FilterCard
        aside={hasFilter && (
          <button className="form-subhead__clear" onClick={handleClearFilter}>
            초기화
          </button>
        )}
      >
        <form onSubmit={handleFilterSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="marker-start">활성 기간 시작일</label>
              <input
                id="marker-start"
                type="datetime-local"
                className="form-control"
                value={filterStartDateTime}
                onChange={(event) => setFilterStartDateTime(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="marker-end">활성 기간 종료일</label>
              <input
                id="marker-end"
                type="datetime-local"
                className="form-control"
                value={filterEndDateTime}
                onChange={(event) => setFilterEndDateTime(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                <i className="bi bi-search me-1"/>
                조회
              </button>
            </div>
            <div className="col-12">
              <p className="form-field__hint mt-0">
                시작일과 종료일은 선택 입력입니다. 입력한 기간 안에 활성화되는 마커만 조회합니다.
              </p>
            </div>
          </div>
        </form>
      </FilterCard>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3 py-2" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={refresh} disabled={isLoading}>
            다시 시도
          </button>
        </div>
      )}

      <SectionCard
        title="가게 지도 핀 목록"
        icon="bi-geo-alt-fill"
        aside={markers.length > 0 && (
          <span className="page-count">{markers.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        {selectedIds.length > 0 && <div className="alert alert-primary bulk-action-bar py-2">
          <strong>{selectedIds.length}개 선택됨</strong>
          <div className="bulk-action-bar__actions">
            <button className="btn btn-sm btn-primary" onClick={() => setShowBulkEdit(true)}>일괄 수정</button>
            <button className="btn btn-sm btn-outline-danger" onClick={deleteSelected} disabled={isBulkDeleting}>{isBulkDeleting ? '삭제 중...' : '일괄 삭제'}</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={selection.clear}>선택 해제</button>
          </div>
        </div>}
        {markers.length > 0 && (
          <BulkSelectionToolbar
            id="store-marker-bulk-select"
            unit="개"
            selectedCount={selection.selectedCount}
            selectableCount={selection.selectableCount}
            isAllSelected={selection.isAllSelected}
            isPartiallySelected={selection.isPartiallySelected}
            onToggleAll={selection.toggleAll}
            onClear={selection.clear}
            max={MAX_BULK_SELECTION}
          />
        )}
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 360px)', overflowY: 'auto'}}>
          {markers.length === 0 && !isLoading ? (
            <EmptyState
              icon="bi-geo-alt"
              title="등록된 가게 마커가 없습니다"
              description="조회 조건에 맞는 마커가 없습니다."
            />
          ) : (
            <div className="row g-3">
              {markers.map((marker, index) => (
                <div key={marker.markerId} className="col-12 col-xl-6">
                  <MarkerCard
                    marker={marker}
                    onClick={setSelectedMarker}
                    onStoreClick={openStoreDetail}
                    index={index}
                    selected={selection.isSelected(marker.markerId)}
                    onSelect={selection.toggle}
                  />
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm text-primary me-2" role="status"/>
              <span className="small text-muted">불러오는 중...</span>
            </div>
          )}

          {hasMore && markers.length > 0 && <div ref={loadMoreRef} style={{minHeight: '1px'}}/>}
        </div>
      </SectionCard>

      <StoreMarkerDetailModal
        show={Boolean(selectedMarker)}
        onHide={() => setSelectedMarker(null)}
        marker={selectedMarker}
        onStoreClick={openStoreDetail}
      />

      <StoreDetailModal
        show={Boolean(selectedStore)}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={undefined}
        onStoreDeleted={undefined}
      />
      <BulkMarkerFormModal show={showBulkEdit} mode="update" targetIds={selectedIds}
                           initialMarker={markers.find(marker => marker.markerId === selectedIds[0])}
                           onHide={() => setShowBulkEdit(false)} onSuccess={() => { selection.clear(); refresh(); }}/>
    </div>
  );
};

interface MarkerCardProps {
  marker: StoreMarker;
  /** 카드 클릭 시 마커 상세 열기 */
  onClick: (marker: StoreMarker) => void;
  /** 가게 상세 열기 */
  onStoreClick: (storeId: number) => void;
  selected: boolean;
  onSelect: BulkSelectHandler<number>;
  /** 목록 내 순서 (Shift + 클릭 범위 선택에 사용) */
  index?: number;
}

/**
 * 가게 지도 핀 카드
 *
 * 마커 이미지가 핵심 정보이므로 카드 상단에 크게 배치하고,
 * 활성 기간은 상태 배지로 한눈에 구분한다.
 */
const MarkerCard = ({marker, onClick, onStoreClick, selected, onSelect, index}: MarkerCardProps) => {
  const status = getAdStatus(marker.period?.startDateTime, marker.period?.endDateTime);

  return (
    <div
      className={`item-card item-card--clickable marker-card h-100 ${selected ? 'border border-primary border-2' : ''}`}
      onClick={() => onClick(marker)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(marker);
        }
      }}
    >
      <div className="item-card__body">
        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-start justify-content-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`badge ${status.badgeClass}`}>{status.label}</span>
              {status.status !== 'ended' && (
                <span className="marker-card__countdown">{status.timeText}</span>
              )}
            </div>
            <h3 className="item-card__name text-truncate">{marker.groupId}</h3>
            <p className="item-card__desc mb-0 font-monospace">
              마커 {marker.markerId} · 가게 {marker.storeId || '-'}
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-end">
          <button type="button" className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-outline-secondary'}`}
                  aria-pressed={selected} aria-label={`마커 ${marker.markerId} ${selected ? '선택 해제' : '선택'}`}
                  onClick={event => { event.stopPropagation(); onSelect(marker.markerId, index, event); }}>
            <i className={`bi ${selected ? 'bi-check-square-fill' : 'bi-square'} me-1`}/>
            {selected ? '선택됨' : '선택'}
          </button>
          <button
            className="btn btn-sm btn-outline-primary flex-shrink-0"
            onClick={(event) => {
              event.stopPropagation();
              onStoreClick(marker.storeId);
            }}
          >
            <i className="bi bi-shop me-1"/>
            가게 상세
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
            <span className="form-summary__value">
              {formatDateTime(marker.period?.startDateTime)}
            </span>
          </div>
          <div className="form-summary__row">
            <span className="form-summary__label">종료일</span>
            <span className="form-summary__value">
              {formatDateTime(marker.period?.endDateTime)}
            </span>
          </div>
        </div>
      </div>
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
          <img src={imageUrl} alt={`${title} 마커`} loading="lazy"/>
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

export default StoreMarkerManage;
