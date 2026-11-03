import {FormEvent, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeApi from '@/api/storeApi';
import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import useConfirm from '@/hooks/useConfirm';
import {Location} from '@/types/domain';
import {formatDistance, formatDistanceBetween, getDistanceMeters} from '@/utils/geoUtils';
import {SimpleStore, STORE_STATUS, StoreDetail, StoreTransferItem, StoreTransferResult} from '@/types/store';
import {ApiResponse} from '@/types/api';

interface StoreTransferModalProps {
  show: boolean;
  onHide: () => void;
  /** 데이터를 넘기고 제거할 가게 목록. 서버 API가 단건이라 한 건씩 차례로 이관합니다. */
  sourceStores: TransferSourceStore[];
  /** 이관 성공 콜백. 성공한 가게는 서버가 이미 삭제했으므로 목록·상세 갱신에 사용합니다. */
  onTransferred: (transferredStoreIds: number[]) => void;
}

export interface TransferSourceStore {
  storeId: number;
  name: string;
  location?: Location;
}

type TransferOutcome =
  | { status: 'success'; result: StoreTransferResult }
  | { status: 'failed'; message: string; retryable: boolean };

/** 대상을 바꿔야 해결되는 실패. 같은 요청을 다시 보내도 결과가 같으므로 재시도를 제공하지 않습니다. */
const NON_RETRYABLE_ERRORS = ['same_store_data_transfer', 'invalid_parameter', 'not_exists_store'];

const TRANSFER_ERROR_MESSAGES: Record<string, string> = {
  // 서버는 제거할/유지할 가게, 미존재/삭제 상태를 구분하지 않고 같은 404를 내립니다.
  not_exists_store: '제거할 가게 또는 유지할 가게를 확인해주세요. (존재하지 않거나, 유지할 가게가 삭제된 상태)'
};

const RETRYABLE_ERROR_MESSAGE =
  '이관 중 오류가 발생했거나 응답이 지연되었습니다. 일부만 이관되었을 수 있습니다. '
  + '잠시 후 다시 시도하면 제거할 가게에 남은 데이터를 이어서 이관합니다.';

const toFailure = (response: ApiResponse<unknown>): TransferOutcome => {
  const retryable = !NON_RETRYABLE_ERRORS.includes(response.error);
  return {
    status: 'failed',
    message: retryable
      ? RETRYABLE_ERROR_MESSAGE
      : TRANSFER_ERROR_MESSAGES[response.error] || response.message || '이관에 실패했습니다.',
    retryable
  };
};

const TRANSFER_TYPE_LABELS: Record<string, string> = {
  REVIEW: '리뷰',
  IMAGE: '이미지',
  VISIT: '방문 인증',
  FAVORITE: '즐겨찾기'
};

/** skippedCount 의미가 항목마다 달라 문구를 따로 둡니다. 모르는 type은 서버 값을 그대로 표시합니다. */
const getSkippedNote = ({type, skippedCount}: StoreTransferItem): string | null => {
  if (skippedCount <= 0) return null;
  switch (type) {
    case 'VISIT':
      return `같은 날 중복으로 제거한 가게에 남은 방문 ${skippedCount}건`;
    case 'FAVORITE':
      return `중복으로 삭제된 제거한 가게의 즐겨찾기 ${skippedCount}건`;
    default:
      return `이관 제외 ${skippedCount}건`;
  }
};

type TargetSearchMode = 'name' | 'id';

const SEARCH_PAGE_SIZE = 20;
/** 확인 창에 나열할 제거할 가게 ID 최대 개수 */
const CONFIRM_ID_PREVIEW_COUNT = 10;

const isDeletedStatus = (status: string) =>
  status === STORE_STATUS.DELETED || status === STORE_STATUS.AUTO_DELETED;

/** 유지할 가게로 쓸 수 없는 이유를 반환합니다. 서버 404가 사유를 구분하지 않아 미리 안내합니다. */
const getTargetInvalidReason = (target: StoreDetail): string | null => {
  if (isDeletedStatus(target.status)) return '삭제된 가게는 유지할 가게로 선택할 수 없습니다.';
  return null;
};

/**
 * 제거할 가게 기준 거리. 제거할 가게가 여러 개면 '가장 가까운 ~ 가장 먼' 범위로 보여주고,
 * 가게별 거리는 마우스를 올리면 볼 수 있습니다. 좌표가 없으면 표시하지 않습니다.
 */
const SourceDistanceText = ({sources, to}: { sources: TransferSourceStore[]; to?: Location }) => {
  if (!to) return null;
  const distances = sources
    .filter(source => source.location)
    .map(source => ({source, meters: getDistanceMeters(source.location, to)}));
  if (distances.length === 0) return null;

  const meters = distances.map(distance => distance.meters);
  const min = formatDistance(Math.min(...meters));
  const max = formatDistance(Math.max(...meters));
  const title = sources.length > 1
    ? distances.map(({source, meters}) => `${source.name} (#${source.storeId}): ${formatDistance(meters)}`).join('\n')
    : '제거할 가게 기준 거리';

  return (
    <span className="ms-auto text-nowrap" title={title}>
      {min === max ? min : `${min} ~ ${max}`}
    </span>
  );
};

const TransferResultSummary = ({result}: { result: StoreTransferResult }) => {
  const items = result.contents;
  if (items.every(item => item.transferredCount === 0 && item.skippedCount === 0)) {
    return <div className="small text-body-secondary">더 이관할 데이터가 없었습니다.</div>;
  }
  const notes = items.map(getSkippedNote).filter(Boolean);
  return (
    <div className="small text-body-secondary">
      {items.map(item => `${TRANSFER_TYPE_LABELS[item.type] ?? item.type} ${item.transferredCount}건`).join(' · ')}
      {notes.length > 0 && <div>{notes.join(', ')}</div>}
    </div>
  );
};

const OUTCOME_BADGES = {
  success: {className: 'text-bg-success', label: '완료'},
  failed: {className: 'text-bg-danger', label: '실패'}
} as const;

const StoreTransferModal = ({
                              show,
                              onHide,
                              sourceStores,
                              onTransferred
                            }: StoreTransferModalProps) => {
  const confirm = useConfirm();
  const [searchMode, setSearchMode] = useState<TargetSearchMode>('name');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimpleStore[] | null>(null);
  const [searchCursor, setSearchCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [target, setTarget] = useState<StoreDetail | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  /** 현재 이관 중인 제거할 가게 ID */
  const [transferringId, setTransferringId] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Record<number, TransferOutcome>>({});

  const sourceIds = new Set(sourceStores.map(source => source.storeId));
  const targetInvalidReason = target ? getTargetInvalidReason(target) : null;
  const succeededCount = sourceStores.filter(source => outcomes[source.storeId]?.status === 'success').length;
  // 하나라도 이관되면 그 가게는 이미 삭제되었으므로, 남은 가게도 같은 유지할 가게로 보내도록 대상을 고정합니다.
  const isTargetLocked = succeededCount > 0;
  const isAllDone = succeededCount === sourceStores.length;
  /** 다음 실행 대상. 대상이 고정된 뒤에는 재시도로 해결될 수 있는 실패만 다시 보냅니다. */
  const runnableSources = sourceStores.filter(source => {
    const outcome = outcomes[source.storeId];
    if (outcome?.status === 'success') return false;
    return !isTargetLocked || (outcome?.status === 'failed' && outcome.retryable);
  });
  const hasOutcomes = Object.keys(outcomes).length > 0;

  const handleClose = () => {
    if (isTransferring) return;
    setSearchMode('name');
    resetSearch('');
    setOutcomes({});
    onHide();
  };

  /** 검색 조건이 바뀌면 이전 조회 결과로 실행되지 않도록 초기화합니다. */
  const resetSearch = (nextQuery: string) => {
    setQuery(nextQuery);
    setSearchResults(null);
    setSearchCursor(null);
    setTarget(null);
    setLookupError(null);
    setOutcomes({});
  };

  const handleQueryChange = (value: string) => {
    resetSearch(searchMode === 'id' ? value.replace(/\D/g, '') : value);
  };

  const handleSearchModeChange = (mode: TargetSearchMode) => {
    if (mode === searchMode) return;
    setSearchMode(mode);
    resetSearch('');
  };

  /** 유지할 가게 상세를 조회해 선택합니다. 이름 검색 결과를 고른 경우에도 최신 상태 검증을 위해 상세를 다시 조회합니다. */
  const selectTarget = async (storeId: number) => {
    if (isLookingUp) return;

    if (sourceIds.has(storeId)) {
      setLookupError('제거할 가게는 유지할 가게로 선택할 수 없습니다.');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setOutcomes({});
    try {
      const response = await storeApi.getStoreDetail(String(storeId), {suppressToast: true});
      if (!response.ok || !response.data) {
        setLookupError(response.message || '가게를 찾을 수 없습니다.');
        return;
      }
      setTarget(response.data);
    } finally {
      setIsLookingUp(false);
    }
  };

  /** 이름으로 가게(유저 제보·사장님 가게)를 검색합니다. reset=false면 다음 페이지를 이어 붙입니다. */
  const searchByName = async (reset: boolean) => {
    const keyword = query.trim();
    if (!keyword || isSearching || (!reset && !searchCursor)) return;

    setIsSearching(true);
    setLookupError(null);
    try {
      const response = await storeApi.searchStores(
        keyword,
        reset ? null : searchCursor,
        SEARCH_PAGE_SIZE
      );
      if (!response.ok || !response.data) {
        setLookupError(response.message || '가게 검색에 실패했습니다.');
        return;
      }
      const {contents = [], cursor} = response.data;
      setSearchResults(prev => (reset || !prev ? contents : [...prev, ...contents]));
      setSearchCursor(cursor?.hasMore ? cursor.nextCursor ?? null : null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLookup = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (searchMode === 'id') {
      selectTarget(Number(query));
    } else {
      setTarget(null);
      searchByName(true);
    }
  };

  // 제거할 가게는 유지할 가게가 될 수 없으므로 검색 결과에서 제외합니다.
  const visibleSearchResults = searchResults?.filter(store => !sourceIds.has(store.storeId)) ?? null;
  const isBusy = isLookingUp || isSearching || isTransferring;

  /** 서버 API가 단건이라 한 건씩 차례로 호출합니다. 한 건이 실패해도 나머지는 계속 진행합니다. */
  const runTransfer = async (sources: TransferSourceStore[]) => {
    if (!target || isTransferring || sources.length === 0) return;

    setIsTransferring(true);
    const succeededIds: number[] = [];
    try {
      for (const source of sources) {
        setTransferringId(source.storeId);
        const response = await storeApi.transferStoreData(String(source.storeId), target.storeId);
        const outcome: TransferOutcome = response.ok ? {status: 'success', result: response.data} : toFailure(response);
        if (response.ok) succeededIds.push(source.storeId);
        setOutcomes(prev => ({...prev, [source.storeId]: outcome}));
      }
    } finally {
      setTransferringId(null);
      setIsTransferring(false);
      if (succeededIds.length > 0) onTransferred(succeededIds);
    }

    const failedCount = sources.length - succeededIds.length;
    if (failedCount === 0) {
      toast.success(`${succeededIds.length}개 가게 데이터 이관이 완료되었습니다.`);
    } else if (succeededIds.length > 0) {
      toast.warning(`${succeededIds.length}개 이관 완료, ${failedCount}개 실패했습니다.`);
    }
  };

  const handleTransfer = async () => {
    if (!target || targetInvalidReason) return;

    // 재시도는 이미 확인한 같은 이관을 이어서 하는 것이므로 다시 묻지 않습니다.
    if (!hasOutcomes) {
      const ids = sourceStores.map(source => `#${source.storeId}`);
      const idPreview = ids.length > CONFIRM_ID_PREVIEW_COUNT
        ? `${ids.slice(0, CONFIRM_ID_PREVIEW_COUNT).join(', ')} 외 ${ids.length - CONFIRM_ID_PREVIEW_COUNT}개`
        : ids.join(', ');
      const confirmed = await confirm({
        title: '가게 데이터 이관',
        message: '제거할 가게의 리뷰·이미지·방문 인증·즐겨찾기를 유지할 가게로 이관합니다.\n'
          + '이관이 끝나면 제거할 가게는 삭제되며, 되돌릴 수 없습니다.'
          + (sourceStores.length > 1 ? '\n가게마다 한 건씩 차례로 이관하며, 일부만 실패할 수 있습니다.' : ''),
        details: [
          {
            label: '제거할 가게',
            value: sourceStores.length === 1
              ? `${sourceStores[0].name} (#${sourceStores[0].storeId})`
              : `${sourceStores.length}개 (${idPreview})`
          },
          {label: '유지할 가게', value: `${target.name} (#${target.storeId})`}
        ],
        confirmLabel: '이관',
        variant: 'danger',
        irreversible: true
      });
      if (!confirmed) return;
    }

    await runTransfer(runnableSources);
  };

  const transferButtonLabel = isTransferring
    ? '이관 중...'
    : hasOutcomes ? `실패한 ${runnableSources.length}개 다시 시도` : '이관 실행';

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="app-modal"
      backdrop={isTransferring ? 'static' : true}
      keyboard={!isTransferring}
    >
      <Modal.Header closeButton={!isTransferring}>
        <Modal.Title>다른 가게로 합치기</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!isAllDone && (
          <div className="alert alert-secondary py-2 small mb-3">
            <strong>제거할 가게 → 유지할 가게</strong> 방향으로 데이터를 옮깁니다.
            <ul className="mb-0 mt-1 ps-3">
              <li>제거할 가게의 리뷰·이미지·방문 인증·즐겨찾기를 유지할 가게로 옮깁니다.</li>
              <li>이관이 끝나면 <strong>제거할 가게는 삭제</strong>되고, 유지할 가게만 남습니다.</li>
            </ul>
          </div>
        )}

        <div className="mb-3">
          <div className="form-label mb-1">
            제거할 가게{sourceStores.length > 1 && ` (${sourceStores.length}개)`}
            {' '}<span className="small text-body-secondary">데이터를 넘기고 삭제됨</span>
          </div>
          <ul className="list-group" style={{maxHeight: 240, overflowY: 'auto'}}>
            {sourceStores.map(source => {
              const outcome = outcomes[source.storeId];
              const distance = target ? formatDistanceBetween(source.location, target.location) : null;
              return (
                <li key={source.storeId} className="list-group-item py-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-truncate">{source.name}</span>
                    <span className="font-monospace small text-body-secondary">#{source.storeId}</span>
                    <span className="ms-auto d-flex align-items-center gap-2 text-nowrap small">
                      {distance && <span className="text-body-secondary" title="유지할 가게까지 거리">{distance}</span>}
                      {transferringId === source.storeId ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-label="이관 중"/>
                      ) : outcome && (
                        <span className={`badge ${OUTCOME_BADGES[outcome.status].className}`}>
                          {OUTCOME_BADGES[outcome.status].label}
                        </span>
                      )}
                    </span>
                  </div>
                  {outcome?.status === 'success' && <TransferResultSummary result={outcome.result}/>}
                  {outcome?.status === 'failed' && <div className="small text-danger">{outcome.message}</div>}
                </li>
              );
            })}
          </ul>
        </div>

        {isAllDone ? (
          <p className="small text-body-secondary mb-0">
            제거할 가게는 모두 삭제되었고, 데이터는 {target?.name} (#{target?.storeId})로 이관되었습니다.
          </p>
        ) : (
          <>
            {!isTargetLocked && (
              <>
              <form onSubmit={handleLookup}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <label htmlFor="transfer-target-query" className="form-label mb-0">
                    유지할 가게 <span className="small text-body-secondary">데이터를 받고 남는 가게</span>
                  </label>
                  <div className="btn-group btn-group-sm" role="group" aria-label="유지할 가게 검색 방식">
                    {([['name', '이름'], ['id', 'ID']] as const).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        className={`btn ${searchMode === mode ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        aria-pressed={searchMode === mode}
                        onClick={() => handleSearchModeChange(mode)}
                        disabled={isBusy}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <input
                    id="transfer-target-query"
                    className={`form-control${lookupError ? ' is-invalid' : ''}`}
                    inputMode={searchMode === 'id' ? 'numeric' : 'text'}
                    placeholder={searchMode === 'id' ? '남길 가게 ID' : '남길 가게 이름'}
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    disabled={isTransferring}
                  />
                  <button
                    type="submit"
                    className="btn btn-outline-primary"
                    disabled={!query.trim() || isBusy}
                  >
                    {isLookingUp || isSearching ? '조회 중...' : '조회'}
                  </button>
                  {lookupError && <div className="invalid-feedback">{lookupError}</div>}
                </div>
              </form>

              {searchMode === 'name' && visibleSearchResults && (
                visibleSearchResults.length === 0 ? (
                  <div className="small text-body-secondary mt-2">검색 결과가 없습니다.</div>
                ) : (
                  <div className="mt-2" style={{maxHeight: 240, overflowY: 'auto'}}>
                    <div className="list-group">
                      {visibleSearchResults.map(store => (
                        <button
                          key={store.storeId}
                          type="button"
                          className={`list-group-item list-group-item-action py-2${
                            target?.storeId === store.storeId ? ' active' : ''}`}
                          aria-current={target?.storeId === store.storeId}
                          onClick={() => selectTarget(store.storeId)}
                          disabled={isBusy}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <StoreTypeBadge storeType={store.storeType} size="sm" bordered/>
                            <span className="text-truncate">{store.name}</span>
                            <span className="font-monospace small opacity-75 ms-auto">#{store.storeId}</span>
                          </div>
                          <div className="d-flex gap-2 small opacity-75">
                            <span className="text-truncate">{store.address?.fullAddress || '주소 정보 없음'}</span>
                            <SourceDistanceText sources={sourceStores} to={store.location}/>
                          </div>
                        </button>
                      ))}
                    </div>
                    {searchCursor && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link w-100 mt-1"
                        onClick={() => searchByName(false)}
                        disabled={isBusy}
                      >
                        {isSearching ? '불러오는 중...' : '더 보기'}
                      </button>
                    )}
                  </div>
                )
              )}

              </>
            )}

            {target && (
              <div className="border rounded p-3 mt-3">
                {isTargetLocked && (
                  <div className="small text-body-secondary mb-1">
                    일부 가게가 이미 이관되어 유지할 가게를 바꿀 수 없습니다.
                  </div>
                )}
                <div className="d-flex align-items-center gap-2 mb-1">
                  <strong className="text-truncate">{target.name}</strong>
                  <span className="font-monospace text-body-secondary">#{target.storeId}</span>
                  <StoreTypeBadge storeType={target.storeType} size="sm" bordered className="ms-auto"/>
                </div>
                <div className="d-flex align-items-center gap-2 small text-body-secondary">
                  <StoreStatusBadge status={target.status}/>
                  <span className="text-truncate">{target.address?.fullAddress || '주소 정보 없음'}</span>
                  <SourceDistanceText sources={sourceStores} to={target.location}/>
                </div>
                {targetInvalidReason && (
                  <div className="text-danger small mt-2" role="alert">{targetInvalidReason}</div>
                )}
              </div>
            )}

            {isTransferring && (
              <div className="alert alert-info py-2 mt-3 mb-0 small" role="status">
                <span className="spinner-border spinner-border-sm me-2"/>
                이관 중입니다. 데이터가 많으면 시간이 걸릴 수 있으니 창을 닫지 마세요.
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={handleClose} disabled={isTransferring}>
          닫기
        </button>
        {!isAllDone && runnableSources.length > 0 && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleTransfer}
            disabled={!target || Boolean(targetInvalidReason) || isTransferring}
          >
            {transferButtonLabel}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default StoreTransferModal;
