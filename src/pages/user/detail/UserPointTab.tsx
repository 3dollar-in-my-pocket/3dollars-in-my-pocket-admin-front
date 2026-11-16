import {useCallback, useEffect, useState} from 'react';
import pointApi from '@/api/pointApi';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import useEnumOptions from '@/hooks/useEnumOptions';
import {POINT_TICKET_ENUM_NAME, PointHistory} from '@/types/point';
import {formatDateTimeKo} from '@/utils/dateUtils';

interface UserPointTabProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
}

const PAGE_SIZE = 20;

/** 알 수 없는 type은 원문 그대로 표시합니다. */
const getTypeBadge = (type: string) => {
  if (type === 'EARN') return <span className="badge bg-success-subtle text-success-emphasis">적립</span>;
  if (type === 'REVOKE') return <span className="badge bg-danger-subtle text-danger-emphasis">회수</span>;
  return <span className="badge bg-secondary-subtle text-secondary-emphasis">{type}</span>;
};

const formatAmount = (amount: number) => `${amount > 0 ? '+' : ''}${amount.toLocaleString()}P`;

/**
 * 유저 상세 모달의 포인트 탭 (티켓별 잔액 + 적립/회수 내역)
 *
 * 포인트는 티켓(PointTicket)별로 분리 관리되며, 티켓 목록은 서버 enum에서 받아옵니다.
 * 잔액과 내역은 별도 요청이라 조회 시점 차이로 잔액과 최신 내역의 balanceAfter가 일시적으로 다를 수 있습니다.
 */
const UserPointTab = ({userId, isActive}: UserPointTabProps) => {
  const ticketEnum = useEnumOptions(POINT_TICKET_ENUM_NAME);
  const ticketOptions = ticketEnum.options;
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  // 선택한 티켓이 없거나 목록에 없으면 첫 번째 티켓을 사용합니다.
  const ticket = ticketOptions.some((option) => option.value === selectedTicket)
    ? selectedTicket
    : ticketOptions[0]?.value ?? null;
  const ticketLabelOf = (value: string) => ticketOptions.find((option) => option.value === value)?.label ?? value;
  const isTicketUnavailable = !ticketEnum.isLoading && !ticket;

  const [balance, setBalance] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!ticket) return;
    setIsBalanceLoading(true);
    try {
      const response = await pointApi.getUserPoint(userId, ticket);
      setBalance(response.ok ? response.data?.balance ?? 0 : null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [userId, ticket]);

  const fetchHistories = useCallback(
    (cursor: string | null) => (ticket ? pointApi.getUserPointHistories(userId, ticket, cursor, PAGE_SIZE) : null),
    [userId, ticket]
  );

  const enabled = Boolean(userId && isActive && ticket);

  const {
    items: histories,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<PointHistory>({
    fetcher: fetchHistories,
    enabled,
    deps: [userId, ticket],
    errorMessage: '포인트 내역을 불러오지 못했습니다.'
  });

  useEffect(() => {
    if (enabled) fetchBalance();
  }, [enabled, fetchBalance]);

  const handleRefresh = () => {
    fetchBalance();
    refresh();
  };

  if (isTicketUnavailable && isActive) {
    return (
      <div className="alert alert-warning py-2 small mb-0">
        서버에서 포인트 티켓 목록({POINT_TICKET_ENUM_NAME})을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  return (
    <>
      {ticketOptions.length > 1 && (
        <select
          className="form-select mb-3"
          aria-label="포인트 티켓 선택"
          value={ticket ?? ''}
          onChange={(e) => {
            setBalance(null);
            setSelectedTicket(e.target.value);
          }}
        >
          {ticketOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
          ))}
        </select>
      )}

      <div className="item-card mb-3">
        <div className="item-card__body d-flex align-items-center justify-content-between gap-2">
          <span className="item-card__label mb-0">
            <i className="bi bi-coin me-1" aria-hidden="true"/>
            현재 포인트 잔액
            {ticket && <span className="ms-1 text-body-secondary">· {ticketLabelOf(ticket)}</span>}
          </span>
          <strong className="fs-5" aria-live="polite">
            {isBalanceLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-label="잔액 조회 중"/>
            ) : balance === null ? '-' : `${balance.toLocaleString()}P`}
          </strong>
        </div>
      </div>

      <HistoryPanel
        title="포인트 내역"
        icon="bi-coin"
        count={histories.length}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={handleRefresh}
        onLoadMore={loadMore}
        emptyTitle="포인트 내역이 없습니다"
        emptyDescription="아직 적립되거나 회수된 포인트가 없습니다."
      >
        {histories.map((history) => (
          <div key={history.pointHistoryId} className="item-card mb-3">
            <div className="item-card__body">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {getTypeBadge(history.type)}
                    <h3 className="item-card__name">{history.description || history.reason}</h3>
                  </div>
                  <p className="item-card__desc">
                    <i className="bi bi-calendar3 me-1" aria-hidden="true"/>
                    {formatDateTimeKo(history.occurredAt)}
                  </p>
                  <p className="item-card__desc text-break">
                    <span className="font-monospace">#{history.pointHistoryId}</span>
                    {' · '}{ticketLabelOf(history.ticket)}
                    {' · '}<span className="font-monospace">{history.idempotencyKey}</span>
                    {history.relatedHistoryId && (
                      <> · 원본 적립 <span className="font-monospace">#{history.relatedHistoryId}</span></>
                    )}
                  </p>
                </div>
                <div className="text-end flex-shrink-0">
                  <div className={`fw-bold ${history.amount < 0 ? 'text-danger' : 'text-success'}`}>
                    {formatAmount(history.amount)}
                  </div>
                  <div className="small text-body-secondary">잔액 {history.balanceAfter.toLocaleString()}P</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </HistoryPanel>
    </>
  );
};

export default UserPointTab;
