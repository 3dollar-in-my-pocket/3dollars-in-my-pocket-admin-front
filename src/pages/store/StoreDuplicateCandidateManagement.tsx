import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import storeDuplicateCandidateApi from '@/api/storeDuplicateCandidateApi';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Loading from '@/components/common/Loading';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import useCursorPagination from '@/hooks/useCursorPagination';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useConfirm from '@/hooks/useConfirm';
import {usePermission} from '@/hooks/usePermission';
import {AdminRole} from '@/types/admin';
import {ApiResponse} from '@/types/api';
import {SimpleStore, STORE_STATUS, STORE_TYPE, StoreMenu} from '@/types/store';
import {
  CandidateStore,
  STORE_DUPLICATE_CANDIDATE_STATUS,
  StoreDuplicateCandidate,
  StoreDuplicateCandidateStatus
} from '@/types/storeDuplicateCandidate';
import {formatDateTimeShortKo} from '@/utils/dateUtils';
import StoreDetailModal from './StoreDetailModal';
import StoreTransferResultSummary from './StoreTransferResultSummary';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: StoreDuplicateCandidateStatus; label: string; badgeClass: string }[] = [
  {value: STORE_DUPLICATE_CANDIDATE_STATUS.PENDING, label: '검토 대기', badgeClass: 'text-bg-warning'},
  {value: STORE_DUPLICATE_CANDIDATE_STATUS.MERGED, label: '머지 완료', badgeClass: 'text-bg-success'},
  {value: STORE_DUPLICATE_CANDIDATE_STATUS.IGNORED, label: '무시', badgeClass: 'text-bg-secondary'},
];

/** 처리 시점에 후보 목록이 이미 바뀐 경우. 목록을 다시 불러와 최신 상태를 보여줍니다. */
const STALE_CANDIDATE_ERRORS = ['already_processed_store_duplicate_candidate', 'not_exists_store_duplicate_candidate'];

const MERGE_ERROR_MESSAGES: Record<string, string> = {
  store_not_in_duplicate_candidate: '후보에 포함되지 않은 가게입니다. 후보의 가게 중에서 선택해주세요.',
  // 서버 메시지는 '삭제된 가게입니다'로 고정이라 사유를 함께 안내합니다.
  not_exists_store: '제거할 가게는 유저 제보 가게, 유지할 가게는 활성 가게여야 합니다. 후보는 검토 대기 상태로 복구되었습니다.',
};

const MERGE_RETRYABLE_MESSAGE =
  '머지 중 오류가 발생했거나 응답이 지연되었습니다. 후보는 검토 대기 상태로 복구되어 다시 시도할 수 있습니다. '
  + '(일부 데이터는 이미 이관되었을 수 있습니다)';

const isActive = (store: SimpleStore) => store.status === STORE_STATUS.ACTIVE;

/** 이 가게를 제거할 가게(source)로 머지할 수 없는 이유. 서버 404가 사유를 구분하지 않아 미리 막습니다. */
const getMergeBlockedReason = (source: SimpleStore | null, target: SimpleStore | null): string | null => {
  if (!source || !target) return '가게 정보를 불러오지 못해 머지할 수 없습니다. 무시만 가능합니다.';
  if (source.storeType !== STORE_TYPE.USER_STORE) return '사장님 가게는 제거할 수 없습니다. 상대 가게 쪽에서 머지해주세요.';
  if (!isActive(source)) return '이미 삭제된 가게라 제거할 가게로 선택할 수 없습니다.';
  if (!isActive(target)) return '상대 가게가 활성 상태가 아니라 유지할 가게가 될 수 없습니다.';
  return null;
};

const formatSimilarity = (similarity: number) => `${Math.round(similarity * 100)}%`;

/** 유사도 구간별 색. 높을수록 중복 가능성이 큽니다. */
const getSimilarityTone = (similarity: number) => {
  if (similarity >= 0.9) return 'high';
  if (similarity >= 0.6) return 'mid';
  return 'low';
};

/** 예: "3개 2,000원", "9,000원". 가격 정보가 없으면 null */
const formatMenuPrice = ({price, count}: StoreMenu): string | null => {
  if (price == null) return null;
  return `${count && count > 1 ? `${count}개 ` : ''}${price.toLocaleString()}원`;
};

interface StatTileProps {
  icon: string;
  label: string;
  value: number;
  /** 상대 가게 값. 더 많은 쪽을 강조해 남길 가게 판단을 돕습니다. */
  otherValue: number | null;
}

const StatTile = ({icon, label, value, otherValue}: StatTileProps) => {
  const isMore = otherValue != null && value > otherValue;
  return (
    <div className={`dup-stat ${isMore ? 'dup-stat--more' : ''}`}>
      <span className="dup-stat__label"><i className={`bi ${icon}`} aria-hidden="true"/>{label}</span>
      <span className="dup-stat__value">
        {value.toLocaleString()}
        {isMore && <i className="bi bi-caret-up-fill ms-1" aria-label="상대 가게보다 많음"/>}
      </span>
    </div>
  );
};

const RECENT_IMAGE_SLOTS = 3;

const RecentImages = ({store, images, imageCount}: {
  store: SimpleStore;
  images: CandidateStore['recentImages'];
  imageCount: number;
}) => {
  if (images.length === 0) {
    return (
      <div className="dup-panel__empty">
        <i className="bi bi-image me-1"/>{imageCount > 0 ? '활성 이미지가 없습니다' : '등록된 이미지가 없습니다'}
      </div>
    );
  }
  const restCount = imageCount - images.length;
  return (
    <div className="dup-images">
      {images.slice(0, RECENT_IMAGE_SLOTS).map((image, index) => (
        <a key={image.imageId} href={image.url} target="_blank" rel="noopener noreferrer" className="review-thumb"
           title={`${formatDateTimeShortKo(image.createdAt)} 등록`}>
          <img src={image.url} alt={`${store.name} 최근 이미지`} loading="lazy"/>
          {index === images.length - 1 && restCount > 0 && <span className="review-thumb__more">+{restCount}</span>}
        </a>
      ))}
    </div>
  );
};

/** 두 가게의 메뉴를 나란히 비교할 수 있도록 간단한 목록으로 보여줍니다. 메뉴가 많으면 영역 안에서 스크롤합니다. */
const MenuList = ({menus}: { menus: StoreMenu[] }) => {
  if (menus.length === 0) return <div className="dup-panel__empty"><i className="bi bi-list-ul me-1"/>등록된 메뉴가 없습니다</div>;
  return (
    <ul className="dup-menu">
      {menus.map((menu, index) => {
        const price = formatMenuPrice(menu);
        return (
          <li key={index} className="dup-menu__item">
            <span className="dup-menu__name">
              {menu.name || menu.category?.name || '메뉴명 없음'}
              {menu.category && menu.name && <span className="dup-menu__category">{menu.category.name}</span>}
            </span>
            {price && <span className="dup-menu__price">{price}</span>}
          </li>
        );
      })}
    </ul>
  );
};

interface StorePanelProps {
  candidateStore: CandidateStore | null;
  other: CandidateStore | null;
  /** 머지 버튼 노출 여부 (검토 대기 + 운영자 권한) */
  actionable: boolean;
  disabled: boolean;
  onOpenDetail: (store: SimpleStore) => void;
  onMerge: (source: SimpleStore, target: SimpleStore) => void;
}

const StorePanel = ({candidateStore, other, actionable, disabled, onOpenDetail, onMerge}: StorePanelProps) => {
  if (!candidateStore) {
    return (
      <div className="dup-panel dup-panel--missing">
        <i className="bi bi-question-circle fs-4"/>
        <span>가게 정보를 조회할 수 없습니다</span>
      </div>
    );
  }
  const {store, menus, reviewCount, subscriberCount, imageCount, recentImages} = candidateStore;
  const otherStore = other?.store ?? null;
  const blockedReason = getMergeBlockedReason(store, otherStore);

  return (
    <div className={`dup-panel ${isActive(store) ? '' : 'dup-panel--inactive'}`}>
      <div className="dup-panel__head">
        <div className="d-flex flex-wrap align-items-center gap-1">
          <StoreTypeBadge storeType={store.storeType}/>
          {!isActive(store) && <StoreStatusBadge status={store.status}/>}
          <span className="dup-panel__id">#{store.storeId}</span>
        </div>
        <button
          type="button"
          className="dup-panel__name"
          onClick={() => onOpenDetail(store)}
          aria-label={`${store.name} 상세 보기`}
        >
          {store.name}<i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true"/>
        </button>
        <div className="dup-panel__meta">
          <span><i className="bi bi-geo-alt me-1"/>{store.address?.fullAddress || '주소 정보 없음'}</span>
          <span className="d-flex flex-wrap align-items-center gap-2">
            <span className="rating-badge"><i className="bi bi-star-fill"/>{store.rating.toFixed(1)}</span>
            {store.createdAt && <span>등록 {formatDateTimeShortKo(store.createdAt)}</span>}
          </span>
          {store.categories.length > 0 && (
            <span><i className="bi bi-tag me-1"/>{store.categories.map(category => category.name).join(', ')}</span>
          )}
        </div>
      </div>

      <div className="dup-stats">
        <StatTile icon="bi-chat-square-text" label="리뷰" value={reviewCount} otherValue={other?.reviewCount ?? null}/>
        <StatTile icon="bi-heart" label="즐겨찾기" value={subscriberCount}
                  otherValue={other?.subscriberCount ?? null}/>
        <StatTile icon="bi-image" label="이미지" value={imageCount} otherValue={other?.imageCount ?? null}/>
      </div>

      <div className="dup-panel__section">
        <span className="dup-panel__label">최근 이미지</span>
        <RecentImages store={store} images={recentImages} imageCount={imageCount}/>
      </div>

      <div className="dup-panel__section">
        <span className="dup-panel__label">메뉴 {menus.length > 0 && <span className="page-count">{menus.length}</span>}</span>
        <MenuList menus={menus}/>
      </div>

      {actionable && (
        <div className="dup-panel__action">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger w-100"
            onClick={() => onMerge(store, otherStore)}
            disabled={disabled || !!blockedReason}
          >
            <i className="bi bi-arrow-right-circle me-1"/>이 가게 제거 (상대 가게로 머지)
          </button>
          <div className="form-text">
            {blockedReason ?? '이 가게의 데이터를 상대 가게로 옮기고 이 가게는 삭제합니다.'}
          </div>
        </div>
      )}
    </div>
  );
};

const StoreDuplicateCandidateManagement = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const {hasAccess} = usePermission();
  const canProcess = hasAccess([AdminRole.OPERATOR]);

  const [status, setStatus] = useState<StoreDuplicateCandidateStatus>(STORE_DUPLICATE_CANDIDATE_STATUS.PENDING);
  /** 처리 중인 후보 ID. 머지가 오래 걸려 처리 중에는 다른 후보 처리도 막습니다. */
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<SimpleStore | null>(null);

  // status를 바꾸면 deps로 커서를 버리고 첫 페이지부터 다시 조회합니다.
  const fetchCandidates = useCallback(
    (cursor: string | null) => storeDuplicateCandidateApi.getCandidates(status, cursor, PAGE_SIZE),
    [status]
  );

  const {items: candidates, setItems, isLoading, hasMore, error, refresh, loadMore} =
    useCursorPagination<StoreDuplicateCandidate>({
      fetcher: fetchCandidates,
      deps: [status],
      errorMessage: '중복 의심 가게 후보를 불러오는데 실패했습니다.'
    });

  const {loadMoreRef} = useInfiniteScroll({hasMore, isLoading, onLoadMore: loadMore, threshold: 0.1});

  const isPending = status === STORE_DUPLICATE_CANDIDATE_STATUS.PENDING;

  /** 공통 에러 토스트를 끈 호출이므로 인증/권한/목록 갱신 처리까지 여기서 담당합니다. 처리했으면 true */
  const handleCommonError = (response: ApiResponse<unknown>): boolean => {
    if (response.error === 'unauthorized') {
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/');
      return true;
    }
    if (response.error === 'forbidden_access_denied') {
      toast.error('중복 가게 처리 권한이 없습니다. 운영자 이상만 처리할 수 있습니다.');
      return true;
    }
    if (STALE_CANDIDATE_ERRORS.includes(response.error)) {
      toast.warning(`${response.message || '이미 처리되었거나 존재하지 않는 후보입니다.'} 목록을 새로고침합니다.`);
      refresh();
      return true;
    }
    return false;
  };

  const handleMerge = async (candidate: StoreDuplicateCandidate, source: SimpleStore, target: SimpleStore) => {
    if (processingId) return;
    const confirmed = await confirm({
      title: '중복 가게 머지',
      message: '제거할 가게의 리뷰·이미지·방문 인증·즐겨찾기를 유지할 가게로 이관합니다.\n'
        + '이관이 끝나면 제거할 가게는 삭제되며, 되돌릴 수 없습니다.',
      details: [
        {label: '제거할 가게 (삭제됨)', value: `${source.name} (#${source.storeId})`},
        {label: '유지할 가게 (데이터 받음)', value: `${target.name} (#${target.storeId})`},
      ],
      irreversible: true,
      confirmLabel: '머지',
      variant: 'danger'
    });
    if (!confirmed) return;

    setProcessingId(candidate.candidateId);
    try {
      const response = await storeDuplicateCandidateApi.merge(candidate.candidateId, source.storeId);
      if (response.ok) {
        toast.success(
          <div>
            <div className="fw-semibold mb-1">{source.name} → {target.name} 머지 완료</div>
            <StoreTransferResultSummary result={response.data}/>
          </div>
        );
        // 원본이 속한 다른 후보는 다음 배치 때 정리되므로, 그 전까지 삭제 상태로 표시해 머지를 막습니다.
        const markDeleted = (candidateStore: CandidateStore | null) =>
          candidateStore?.store.storeId === source.storeId
            ? {...candidateStore, store: {...candidateStore.store, status: STORE_STATUS.DELETED}}
            : candidateStore;
        setItems(prev => prev
          .filter(item => item.candidateId !== candidate.candidateId)
          .map(item => ({...item, firstStore: markDeleted(item.firstStore), secondStore: markDeleted(item.secondStore)})));
        return;
      }
      if (handleCommonError(response)) return;
      const message = MERGE_ERROR_MESSAGES[response.error]
        ?? (response.error === 'invalid_parameter' || response.error === 'missing_parameter'
          ? response.message
          : MERGE_RETRYABLE_MESSAGE);
      toast.error(message || '머지에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleIgnore = async (candidate: StoreDuplicateCandidate) => {
    if (processingId) return;
    const names = [candidate.firstStore, candidate.secondStore]
      .map(candidateStore => candidateStore
        ? `${candidateStore.store.name} (#${candidateStore.store.storeId})`
        : '조회 불가')
      .join(' / ');
    const confirmed = await confirm({
      title: '중복 아님 처리',
      message: '이 후보를 중복이 아닌 것으로 처리합니다. 가게 데이터는 변경되지 않으며, 이후 배치에서도 다시 후보로 나타나지 않습니다.',
      details: [{label: '가게', value: names}],
      irreversible: true,
      confirmLabel: '무시',
      variant: 'warning'
    });
    if (!confirmed) return;

    setProcessingId(candidate.candidateId);
    try {
      const response = await storeDuplicateCandidateApi.ignore(candidate.candidateId);
      if (response.ok) {
        toast.success('중복 아님으로 처리했습니다.');
        setItems(prev => prev.filter(item => item.candidateId !== candidate.candidateId));
        return;
      }
      if (handleCommonError(response)) return;
      toast.error(response.message || '무시 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderCandidate = (candidate: StoreDuplicateCandidate) => {
    const {firstStore, secondStore} = candidate;
    const statusOption = STATUS_OPTIONS.find(option => option.value === candidate.status);
    const isProcessing = processingId === candidate.candidateId;
    const actionable = canProcess && candidate.status === STORE_DUPLICATE_CANDIDATE_STATUS.PENDING;

    return (
      <li key={candidate.candidateId} className={`dup-candidate ${isProcessing ? 'dup-candidate--processing' : ''}`}>
        <div className="dup-candidate__head">
          <div className={`dup-similarity dup-similarity--${getSimilarityTone(candidate.nameSimilarity)}`}
               title="이름 유사도 (후보 생성 시점)">
            <span className="dup-similarity__label">이름 유사도</span>
            <strong className="dup-similarity__value">{formatSimilarity(candidate.nameSimilarity)}</strong>
          </div>
          <div className="dup-candidate__facts">
            <span className="dup-fact" title="두 가게 사이 거리 (후보 생성 시점)">
              <i className="bi bi-signpost-split"/>{candidate.distanceMeters.toLocaleString()}m
            </span>
            {candidate.overlappingCategories.map(category => (
              <span key={category.categoryId} className="dup-fact dup-fact--category" title="공통 카테고리">
                <i className="bi bi-tag"/>{category.name}
              </span>
            ))}
          </div>
          <div className="dup-candidate__aside">
            {!isPending && statusOption && <span className={`badge ${statusOption.badgeClass}`}>{statusOption.label}</span>}
            <span>후보 생성 {formatDateTimeShortKo(candidate.createdAt)}</span>
          </div>
        </div>

        <div className="dup-candidate__pair">
          {[[firstStore, secondStore], [secondStore, firstStore]].map(([candidateStore, other], index) => (
            <StorePanel
              key={candidateStore?.store.storeId ?? `empty-${index}`}
              candidateStore={candidateStore}
              other={other}
              actionable={actionable}
              disabled={!!processingId}
              onOpenDetail={setSelectedStore}
              onMerge={(source, target) => handleMerge(candidate, source, target)}
            />
          ))}
          <span className="dup-candidate__vs" aria-hidden="true"><i className="bi bi-arrow-left-right"/></span>
        </div>

        {actionable && (
          <div className="dup-candidate__foot">
            {isProcessing && (
              <span className="small text-muted me-auto">
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
                처리 중입니다. 데이터가 많으면 시간이 걸릴 수 있습니다.
              </span>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleIgnore(candidate)}
              disabled={!!processingId}
            >
              <i className="bi bi-x-circle me-1"/>중복 아님 (무시)
            </button>
          </div>
        )}
      </li>
    );
  };

  const renderList = () => {
    if (error && candidates.length === 0) return <ErrorState message={error} onRetry={refresh}/>;
    if (isLoading && candidates.length === 0) {
      return <div className="text-center py-4"><Loading/></div>;
    }
    if (candidates.length === 0) {
      return (
        <EmptyState
          icon="bi-check2-circle"
          title="중복 의심 가게 후보가 없습니다"
          description={isPending
            ? '중복 후보 탐지 배치를 실행하기 전이거나, 모든 후보를 처리했습니다.'
            : '처리된 후보가 없습니다.'}
        />
      );
    }
    return (
      <>
        <ul className="dup-candidate-list">{candidates.map(renderCandidate)}</ul>
        <div ref={loadMoreRef} className="text-center py-3" style={{display: hasMore ? 'block' : 'none'}}>
          {isLoading && <Loading/>}
        </div>
      </>
    );
  };

  return (
    <div>
      <PageHeader
        description="배치가 찾아낸 중복 의심 가게 쌍을 검토해 머지(제거할 가게 → 유지할 가게로 데이터 이관 후 제거할 가게 삭제)하거나 무시합니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>새로고침
          </button>
        }
      />

      <FilterCard title="후보 상태" icon="bi-funnel">
        <div className="filter-chips">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${status === option.value ? 'filter-chip--active' : ''}`}
              onClick={() => setStatus(option.value)}
              disabled={!!processingId}
              aria-pressed={status === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="form-field__hint mb-0 mt-2">
          이름 유사도가 높은 순으로 표시합니다. 머지 버튼을 누른 가게가 제거할 가게가 되어 삭제되고, 상대 가게가 유지할 가게로 남습니다. 제거할 가게는 유저 제보 가게만 선택할 수 있습니다.
          {!canProcess && ' 머지·무시는 운영자 이상만 처리할 수 있습니다.'}
        </p>
      </FilterCard>

      <SectionCard
        title="중복 의심 가게 후보"
        icon="bi-intersect"
        aside={candidates.length > 0 && (
          <span className="page-count">{candidates.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        {renderList()}
      </SectionCard>

      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onStoreDeleted={() => {
          setSelectedStore(null);
          refresh();
        }}
      />
    </div>
  );
};

export default StoreDuplicateCandidateManagement;
