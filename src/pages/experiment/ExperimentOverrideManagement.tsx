import {useCallback, useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';
import experimentApi from '@/api/experimentApi';
import userApi from '@/api/userApi';
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
import {SEARCH_TYPES} from '@/types/user';
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
  const [userNicknames, setUserNicknames] = useState<Record<string, string>>({});

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
    errorMessage: '테스트 대상 목록을 불러오지 못했습니다.',
  });

  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1,
    rootMargin: '0px 0px 160px 0px',
  });

  // 강제 지정 API에는 accountId만 포함되므로, 현재 목록의 유저를 한 번에 조회해 닉네임을 보강합니다.
  useEffect(() => {
    const userIds = [...new Set(
      overrides
        .filter((item) => item.accountType === 'USER_ACCOUNT' && /^\d+$/.test(item.accountId))
        .map((item) => Number(item.accountId))
    )];
    if (userIds.length === 0) return;

    let cancelled = false;
    const batches = Array.from({length: Math.ceil(userIds.length / 50)}, (_, index) =>
      userIds.slice(index * 50, (index + 1) * 50)
    );
    Promise.all(batches.map((batch) =>
      userApi.searchUsers({type: SEARCH_TYPES.USER_ID, userIds: batch, size: batch.length})
    )).then((responses) => {
      if (cancelled) return;
      const users = responses.filter((response) => response.ok).flatMap((response) => response.data.users);
      setUserNicknames((current) => ({
        ...current,
        ...Object.fromEntries(
          users
            .filter((user) => user.userId)
            .map((user) => [user.userId!, user.nickname || user.name])
        ),
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [overrides]);

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
      title: '테스트 대상 해제',
      message: '이 계정을 테스트 대상에서 해제하시겠습니까?\n해제하면 해당 계정은 다시 일반 분배 규칙을 따릅니다.',
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
      toast.success('테스트 대상에서 해제되었습니다.');
      refresh();
    } finally {
      setDeletingId(null);
    }
  };

  /** 특정 실험으로 필터링한 경우에만 정확한 사용량을 알 수 있습니다. */
  const usageLabel = experimentKeyFilter && !hasMore
    ? `${overrides.length} / ${MAX_OVERRIDE_COUNT_PER_EXPERIMENT}`
    : `${overrides.length.toLocaleString()}${hasMore ? '+' : ''}건`;
  const groupedOverrides = useMemo(() => {
    const groups = new Map<string, ExperimentVariantOverride[]>();
    overrides.forEach((override) => {
      const group = groups.get(override.experimentKey) ?? [];
      group.push(override);
      groups.set(override.experimentKey, group);
    });
    return [...groups.entries()];
  }, [overrides]);

  return (
    <div>
      <PageHeader
        description="푸시 A/B 테스트를 위해 계정별로 적용할 Variant를 설정합니다."
        actions={
          <div className="d-flex gap-2">
            {canManage && (
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isExperimentsLoading || experiments.length === 0}
              >
                <i className="bi bi-plus-lg me-1"/>
                테스트 대상 등록
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
        title="테스트 대상 목록"
        icon="bi-shuffle"
        aside={overrides.length > 0 && <span className="page-count">{usageLabel}</span>}
      >
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 400px)', overflowY: 'auto'}}>
          {overrides.length === 0 && !isLoading && !error && (
            <EmptyState
              icon="bi-shuffle"
              title="등록된 테스트 대상이 없습니다"
              description="특정 Variant를 적용할 테스트 대상을 등록해주세요."
              actionButton={canManage && experiments.length > 0 ? {
                label: '테스트 대상 등록',
                onClick: handleCreate,
              } : undefined}
            />
          )}

          {overrides.length > 0 && (
            <div className="d-flex flex-column gap-3">
              {groupedOverrides.map(([experimentKey, group]) => (
                <section key={experimentKey} className="border rounded overflow-hidden">
                  <div className="d-flex align-items-center justify-content-between gap-3 bg-body-tertiary px-3 py-2 border-bottom">
                    <div className="min-w-0">
                      <h3 className="fs-6 fw-bold mb-0 text-truncate">
                        {getExperimentLabel(experiments, experimentKey)}
                      </h3>
                      <div className="small text-body-secondary font-monospace text-truncate">{experimentKey}</div>
                    </div>
                    <span className="badge text-bg-light border flex-shrink-0">대상 {group.length}명</span>
                  </div>
                  <DataTable>
                    <thead>
                    <tr>
                      <th>대상 계정</th>
                      <th>Variant</th>
                      <th>메모</th>
                      <th>등록일</th>
                      {canManage && <th className="text-end">관리</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {group.map((override) => (
                      <tr key={override.overrideId}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge text-bg-secondary flex-shrink-0">
                              {getAccountTypeLabel(override.accountType)}
                            </span>
                            <div className="min-w-0">
                              {override.accountType === 'USER_ACCOUNT' && userNicknames[override.accountId] ? (
                                <>
                                  <div>{userNicknames[override.accountId]}</div>
                                  <div className="small text-body-secondary font-monospace">#{override.accountId}</div>
                                </>
                              ) : (
                                <span className="font-monospace">{override.accountId}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><VariantBadge experiments={experiments} override={override}/></td>
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
                </section>
              ))}
            </div>
          )}

          {isLoading && overrides.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">테스트 대상 목록 불러오는 중</span>
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
        accountNickname={editingOverride ? userNicknames[editingOverride.accountId] : undefined}
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
      title={isUnknown ? '현재 실험에 없는 Variant입니다. 이 테스트 대상 설정은 무시됩니다.' : undefined}
    >
      {isUnknown && <i className="bi bi-exclamation-triangle-fill me-1"/>}
      {override.variantKey}
    </span>
  );
};

export default ExperimentOverrideManagement;
