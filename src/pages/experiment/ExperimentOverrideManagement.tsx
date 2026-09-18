import {useCallback, useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import experimentApi from '@/api/experimentApi';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import FilterCard from '@/components/common/FilterCard';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import useConfirm from '@/hooks/useConfirm';
import useCursorPagination from '@/hooks/useCursorPagination';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import {usePermission} from '@/hooks/usePermission';
import {AdminRole} from '@/types/admin';
import {
  EXPERIMENT_ACCOUNT_TYPES,
  ExperimentVariantInfo,
  ExperimentVariantOverride,
  MAX_OVERRIDE_COUNT_PER_EXPERIMENT,
} from '@/types/experiment';
import {formatDateTime} from '@/utils/dateUtils';
import ExperimentOverrideFormModal from './ExperimentOverrideFormModal';

const PAGE_SIZE = 30;

const getAccountTypeLabel = (accountType: string) =>
  EXPERIMENT_ACCOUNT_TYPES.find((option) => option.value === accountType)?.label ?? accountType;

/**
 * 푸시 A/B 테스트 관리 (실험 Variant 강제 지정)
 *
 * 테스트 계정이 특정 Variant를 받도록 고정합니다.
 * 등록된 계정은 실험의 정상 분배에서 빠지므로 테스트 계정만 등록해야 합니다.
 */
const ExperimentOverrideManagement = () => {
  const confirm = useConfirm();
  const {hasAccess} = usePermission();
  const canManage = hasAccess([AdminRole.OPERATOR]);

  const [experiments, setExperiments] = useState<ExperimentVariantInfo[]>([]);
  const [isExperimentsLoading, setIsExperimentsLoading] = useState(false);
  const [experimentKeyFilter, setExperimentKeyFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOverride, setEditingOverride] = useState<ExperimentVariantOverride | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 실험 목록은 서버 정의를 그대로 내려받습니다. 화면에 하드코딩하지 않습니다.
  useEffect(() => {
    let cancelled = false;

    setIsExperimentsLoading(true);
    experimentApi.getExperimentVariants()
      .then((response) => {
        if (cancelled || !response?.ok) return;
        setExperiments(response.data?.contents ?? []);
      })
      .finally(() => {
        if (!cancelled) setIsExperimentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchOverrides = useCallback(
    (cursor: string | null) => experimentApi.getOverrides({
      experimentKey: experimentKeyFilter || undefined,
      cursor,
      size: PAGE_SIZE,
    }),
    [experimentKeyFilter]
  );

  const {
    items: overrides,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useCursorPagination<ExperimentVariantOverride>({
    fetcher: fetchOverrides,
    deps: [experimentKeyFilter],
    errorMessage: '강제 지정 목록을 불러오지 못했습니다.',
  });

  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1,
    rootMargin: '0px 0px 160px 0px',
  });

  const handleCreate = () => {
    setEditingOverride(null);
    setShowForm(true);
  };

  const handleEdit = (override: ExperimentVariantOverride) => {
    setEditingOverride(override);
    setShowForm(true);
  };

  const handleDelete = async (override: ExperimentVariantOverride) => {
    if (deletingId) return;

    const confirmed = await confirm({
      title: '강제 지정 삭제',
      message: '이 계정의 Variant 강제 지정을 삭제하시겠습니까?\n삭제하면 해당 계정은 다시 일반 분배 규칙을 따릅니다.',
      details: [
        {label: '실험', value: getExperimentLabel(experiments, override.experimentKey)},
        {label: '계정', value: `${getAccountTypeLabel(override.accountType)} / ${override.accountId}`},
        {label: 'Variant', value: override.variantKey},
      ],
      variant: 'danger',
      confirmLabel: '삭제',
      irreversible: true,
    });
    if (!confirmed) return;

    setDeletingId(override.overrideId);
    try {
      const response = await experimentApi.deleteOverride(override.overrideId);
      if (!response.ok) return;
      toast.success('강제 지정이 삭제되었습니다.');
      refresh();
    } finally {
      setDeletingId(null);
    }
  };

  /** 특정 실험으로 필터링한 경우에만 정확한 사용량을 알 수 있습니다. */
  const usageLabel = experimentKeyFilter && !hasMore
    ? `${overrides.length} / ${MAX_OVERRIDE_COUNT_PER_EXPERIMENT}`
    : `${overrides.length.toLocaleString()}${hasMore ? '+' : ''}건`;

  return (
    <div>
      <PageHeader
        description="푸시 A/B 실험에서 특정 테스트 계정이 받을 Variant를 강제로 고정합니다. 등록된 계정은 정상 분배에서 빠지므로 테스트 계정만 등록해주세요."
        actions={
          <div className="d-flex gap-2">
            {canManage && (
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isExperimentsLoading || experiments.length === 0}
              >
                <i className="bi bi-plus-lg me-1"/>
                강제 지정 등록
              </button>
            )}
            <button className="btn btn-outline-secondary" onClick={refresh} disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
              ) : (
                <i className="bi bi-arrow-clockwise me-1"/>
              )}
              새로고침
            </button>
          </div>
        }
      />

      <div className="alert alert-warning d-flex gap-2 py-2" role="alert">
        <i className="bi bi-exclamation-triangle-fill"/>
        <div className="small">
          서버가 지정 목록을 캐싱하므로 등록·수정·삭제가 반영되기까지 <strong>최대 5분</strong>이 걸릴 수 있습니다.
          또한 실험에 없는 Variant를 지정하면 오류 없이 무시되고 기존 분배 규칙이 적용됩니다.
        </div>
      </div>

      <FilterCard title="실험 필터" icon="bi-funnel">
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${experimentKeyFilter === '' ? 'filter-chip--active' : ''}`}
            onClick={() => setExperimentKeyFilter('')}
            disabled={isLoading}
          >
            전체
          </button>
          {experiments.map((experiment) => (
            <button
              key={experiment.experimentKey}
              type="button"
              className={`filter-chip ${experimentKeyFilter === experiment.experimentKey ? 'filter-chip--active' : ''}`}
              onClick={() => setExperimentKeyFilter(experiment.experimentKey)}
              disabled={isLoading}
            >
              {experiment.description}
            </button>
          ))}
          {isExperimentsLoading && (
            <span className="text-body-secondary small align-self-center">실험 목록 불러오는 중...</span>
          )}
        </div>
      </FilterCard>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center py-2" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>
            다시 시도
          </button>
        </div>
      )}

      <SectionCard
        title="강제 지정 목록"
        icon="bi-shuffle"
        aside={overrides.length > 0 && <span className="page-count">{usageLabel}</span>}
      >
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 400px)', overflowY: 'auto'}}>
          {overrides.length === 0 && !isLoading && !error && (
            <EmptyState
              icon="bi-shuffle"
              title="등록된 강제 지정이 없습니다"
              description="테스트 계정에 특정 Variant를 고정하려면 강제 지정을 등록해주세요."
              actionButton={canManage && experiments.length > 0 ? {
                label: '강제 지정 등록',
                onClick: handleCreate,
              } : undefined}
            />
          )}

          {overrides.length > 0 && (
            <DataTable>
              <thead>
              <tr>
                <th>실험</th>
                <th>계정</th>
                <th>계정 ID</th>
                <th>Variant</th>
                <th>메모</th>
                <th>등록일</th>
                {canManage && <th className="text-end">관리</th>}
              </tr>
              </thead>
              <tbody>
              {overrides.map((override) => (
                <tr key={override.overrideId}>
                  <td>
                    <div>{getExperimentLabel(experiments, override.experimentKey)}</div>
                    <div className="small text-body-secondary font-monospace">{override.experimentKey}</div>
                  </td>
                  <td>
                    <span className="badge text-bg-secondary">
                      {getAccountTypeLabel(override.accountType)}
                    </span>
                  </td>
                  <td className="font-monospace">{override.accountId}</td>
                  <td>
                    <VariantBadge experiments={experiments} override={override}/>
                  </td>
                  <td className="text-body-secondary" style={{wordBreak: 'break-all'}}>
                    {override.memo || '-'}
                  </td>
                  <td className="small text-body-secondary">{formatDateTime(override.createdAt)}</td>
                  {canManage && (
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEdit(override)}
                        disabled={deletingId === override.overrideId}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(override)}
                        disabled={deletingId === override.overrideId}
                      >
                        {deletingId === override.overrideId ? (
                          <span className="spinner-border spinner-border-sm"/>
                        ) : '삭제'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              </tbody>
            </DataTable>
          )}

          {isLoading && overrides.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">강제 지정 목록 불러오는 중</span>
              </div>
            </div>
          )}

          {hasMore && overrides.length > 0 && (
            <div ref={loadMoreRef} className="text-center py-4">
              {isLoading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">추가 목록 불러오는 중</span>
                </div>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      <ExperimentOverrideFormModal
        show={showForm}
        override={editingOverride}
        experiments={experiments}
        onHide={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </div>
  );
};

/** 실험 설명을 우선 표시하고, 서버에서 사라진 실험은 키를 그대로 노출합니다. */
const getExperimentLabel = (experiments: ExperimentVariantInfo[], experimentKey: string) =>
  experiments.find((experiment) => experiment.experimentKey === experimentKey)?.description ?? experimentKey;

/** 실험에 존재하지 않는 Variant는 무시되므로 경고 배지로 구분합니다. */
const VariantBadge = ({experiments, override}: {
  experiments: ExperimentVariantInfo[];
  override: ExperimentVariantOverride;
}) => {
  const experiment = experiments.find((item) => item.experimentKey === override.experimentKey);
  // 실험 목록을 아직 못 받았으면 판단할 수 없으므로 경고를 띄우지 않습니다.
  const isUnknown = !!experiment && !experiment.variantKeys.includes(override.variantKey);

  return (
    <span
      className={`badge ${isUnknown ? 'text-bg-warning' : 'text-bg-primary'}`}
      title={isUnknown ? '현재 실험에 없는 Variant입니다. 이 지정은 무시됩니다.' : undefined}
    >
      {isUnknown && <i className="bi bi-exclamation-triangle-fill me-1"/>}
      {override.variantKey}
    </span>
  );
};

export default ExperimentOverrideManagement;
