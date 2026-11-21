import {useCallback, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import raffleApi from '@/api/raffleApi';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import useCursorPagination from '@/hooks/useCursorPagination';
import useEnumOptions, {useEnumLabels} from '@/hooks/useEnumOptions';
import {usePermission} from '@/hooks/usePermission';
import {AdminRole} from '@/types/admin';
import {POINT_TICKET_ENUM_NAME} from '@/types/point';
import {POINT_RAFFLE_COST_TYPE, Raffle, RAFFLE_ENUM_NAMES} from '@/types/raffle';
import {formatDateTime} from '@/utils/dateUtils';
import RaffleFormModal from './RaffleFormModal';

const PAGE_SIZE = 20;
const LABEL_ENUM_NAMES = [RAFFLE_ENUM_NAMES.status, RAFFLE_ENUM_NAMES.costType, POINT_TICKET_ENUM_NAME];

/** 알 수 없는 상태는 회색으로 표시합니다. */
const STATUS_BADGE_CLASS: Record<string, string> = {
  ACTIVE: 'text-bg-success',
  STOPPED: 'text-bg-warning',
  HIDDEN: 'text-bg-secondary',
};

/** 진행 예정·종료는 상태가 아니라 기간으로 결정됩니다. (시작 포함, 종료 미포함) */
const getPeriodLabel = (raffle: Raffle) => {
  const now = Date.now();
  if (now < new Date(raffle.startDateTime).getTime()) return '기간 전';
  if (now >= new Date(raffle.endDateTime).getTime()) return '기간 종료';
  return null;
};

/**
 * 응모 관리
 *
 * 응모 대상은 응모 티켓(RaffleTicket)별로 관리합니다. 선택한 티켓은 URL(?ticket=)에 유지합니다.
 * 조회는 로그인만 필요하고, 등록·수정은 OPERATOR 이상만 가능합니다.
 * 삭제 기능은 없으며, 내리려면 비노출(HIDDEN)로 수정합니다.
 */
const RaffleManagement = () => {
  const ticketEnum = useEnumOptions(RAFFLE_ENUM_NAMES.ticket);
  const ticketOptions = ticketEnum.options;
  const enumLabels = useEnumLabels(LABEL_ENUM_NAMES);
  const labelOf = (enumName: string, value: string) => enumLabels[enumName]?.[value] ?? value;

  const {hasAccess} = usePermission();
  const canManage = hasAccess([AdminRole.OPERATOR]);

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTicket = searchParams.get('ticket');
  // URL의 티켓이 없거나 목록에 없으면 첫 번째 티켓을 사용합니다.
  const ticket = ticketOptions.some((option) => option.value === requestedTicket)
    ? requestedTicket
    : ticketOptions[0]?.value ?? null;
  const ticketLabel = ticket ? ticketOptions.find((option) => option.value === ticket)?.label ?? ticket : '';
  const isTicketUnavailable = !ticketEnum.isLoading && !ticket;

  const [showForm, setShowForm] = useState(false);
  const [editingRaffleCode, setEditingRaffleCode] = useState<string | null>(null);

  const selectTicket = (value: string) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set('ticket', value);
      return next;
    }, {replace: true});
  };

  const fetchRaffles = useCallback(
    (cursor: string | null) => (ticket ? raffleApi.getRaffles(ticket, cursor, PAGE_SIZE) : null),
    [ticket]
  );

  const {
    items: raffles,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useCursorPagination<Raffle>({
    fetcher: fetchRaffles,
    enabled: Boolean(ticket),
    deps: [ticket],
    errorMessage: '응모 목록을 불러오지 못했습니다.',
  });

  const openCreate = () => {
    setEditingRaffleCode(null);
    setShowForm(true);
  };

  const openEdit = (raffleCode: string) => {
    setEditingRaffleCode(raffleCode);
    setShowForm(true);
  };

  const isInitialLoading = isLoading && !isLoadingMore;

  return (
    <div>
      <PageHeader
        description="응모 티켓별로 앱에 노출되는 응모 대상과 응모 비용을 관리합니다. 내리려면 비노출로 수정해주세요."
        actions={
          <div className="d-flex gap-2">
            {canManage && (
              <button className="btn btn-primary" onClick={openCreate} disabled={!ticket}>
                <i className="bi bi-plus-lg me-1"/>
                응모 등록
              </button>
            )}
            <button className="btn btn-outline-secondary" onClick={refresh} disabled={!ticket || isLoading}>
              {isInitialLoading ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
              ) : (
                <i className="bi bi-arrow-clockwise me-1"/>
              )}
              새로고침
            </button>
          </div>
        }
      />

      {isTicketUnavailable && (
        <div className="alert alert-warning py-2 small" role="alert">
          서버에서 응모 티켓 목록({RAFFLE_ENUM_NAMES.ticket})을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}

      <SectionCard title="응모 티켓" icon="bi-ticket-detailed-fill">
        <select
          className="form-select"
          style={{maxWidth: 420}}
          aria-label="응모 티켓 선택"
          value={ticket ?? ''}
          onChange={(e) => selectTicket(e.target.value)}
          disabled={ticketEnum.isLoading || ticketOptions.length === 0}
        >
          {ticketEnum.isLoading && <option value="">불러오는 중...</option>}
          {!ticketEnum.isLoading && ticketOptions.length === 0 && <option value="">선택 가능한 응모 티켓이 없습니다</option>}
          {ticketOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
          ))}
        </select>
      </SectionCard>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center py-2" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>
            다시 시도
          </button>
        </div>
      )}

      <SectionCard
        title={ticket ? `응모 목록 · ${ticketLabel}` : '응모 목록'}
        icon="bi-ticket-perforated-fill"
        aside={raffles.length > 0 && (
          <span className="page-count">{raffles.length.toLocaleString()}건{hasMore && '+'}</span>
        )}
      >
        {(ticketEnum.isLoading || isInitialLoading) && raffles.length === 0 && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">응모 목록 불러오는 중</span>
            </div>
          </div>
        )}

        {!isLoading && !error && ticket && raffles.length === 0 && (
          <EmptyState
            icon="bi-ticket-perforated"
            title="등록된 응모가 없습니다"
            description="유저가 포인트로 응모할 대상을 등록해주세요."
            actionButton={canManage ? {label: '응모 등록', onClick: openCreate} : undefined}
          />
        )}

        {raffles.length > 0 && (
          <DataTable>
            <thead>
            <tr>
              <th>제목</th>
              <th>응모 비용</th>
              <th>응모 기간</th>
              <th className="text-center">상태</th>
              <th className="text-end" title="비동기 집계 표시용 값이라 실제 응모 수보다 작을 수 있습니다">응모 수</th>
              <th>수정일</th>
              {canManage && <th className="text-end">관리</th>}
            </tr>
            </thead>
            <tbody>
            {raffles.map((raffle) => (
              <tr key={raffle.raffleId}>
                <td>
                  <div className="fw-semibold">{raffle.title}</div>
                  <div className="small text-body-secondary font-monospace">{raffle.code}</div>
                </td>
                <td className="text-nowrap">
                  {raffle.cost?.type === POINT_RAFFLE_COST_TYPE ? (
                    <>
                      <div>{raffle.cost.amount.toLocaleString()}P</div>
                      <div className="small text-body-secondary">
                        {labelOf(POINT_TICKET_ENUM_NAME, raffle.cost.pointTicket)}
                      </div>
                    </>
                  ) : raffle.cost?.type ? labelOf(RAFFLE_ENUM_NAMES.costType, raffle.cost.type) : '-'}
                </td>
                <td className="small text-nowrap">
                  {formatDateTime(raffle.startDateTime)}
                  <br/>
                  ~ {formatDateTime(raffle.endDateTime)}
                  <span className="text-body-secondary"> (미포함)</span>
                </td>
                <td className="text-center">
                  <span className={`badge ${STATUS_BADGE_CLASS[raffle.status] ?? 'text-bg-secondary'}`}>
                    {labelOf(RAFFLE_ENUM_NAMES.status, raffle.status)}
                  </span>
                  {getPeriodLabel(raffle) && (
                    <div className="small text-body-secondary mt-1">{getPeriodLabel(raffle)}</div>
                  )}
                </td>
                <td className="text-end">{raffle.entryCount.toLocaleString()}</td>
                <td className="small text-body-secondary text-nowrap">{formatDateTime(raffle.updatedAt)}</td>
                {canManage && (
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEdit(raffle.code)}
                    >
                      수정
                    </button>
                  </td>
                )}
              </tr>
            ))}
            </tbody>
          </DataTable>
        )}

        {hasMore && raffles.length > 0 && (
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoadingMore && <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"/>}
              더보기
            </button>
          </div>
        )}
      </SectionCard>

      {ticket && (
        <RaffleFormModal
          show={showForm}
          ticket={ticket}
          ticketLabel={ticketLabel}
          raffleCode={editingRaffleCode}
          onHide={() => setShowForm(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};

export default RaffleManagement;
