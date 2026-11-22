import {useCallback, useEffect, useState} from 'react';
import pointApi from '@/api/pointApi';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import useEnumOptions, {useEnumLabels} from '@/hooks/useEnumOptions';
import ItemCard from '@/components/common/ItemCard';
import {MISSION_ENUM_NAMES} from '@/types/mission';
import MissionCompletionMeta from './MissionCompletionMeta';
import {
  MissionCompletedPointSource,
  POINT_TICKET_ENUM_NAME,
  PointHistory,
  PointHistorySortBy,
  PointHistorySource,
  RaffleEnteredPointSource,
} from '@/types/point';
import {formatDateTimeKo} from '@/utils/dateUtils';

interface UserPointTabProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
}

const PAGE_SIZE = 20;
const PERIOD_ENUM_NAMES = [MISSION_ENUM_NAMES.periodType];

/** 알 수 없는 type은 원문 그대로 표시합니다. */
const getTypeBadge = (type: string) => {
  if (type === 'EARN') return <span className="badge bg-success-subtle text-success-emphasis">적립</span>;
  if (type === 'REVOKE') return <span className="badge bg-danger-subtle text-danger-emphasis">회수</span>;
  if (type === 'USE') return <span className="badge bg-primary-subtle text-primary-emphasis">사용</span>;
  return <span className="badge bg-secondary-subtle text-secondary-emphasis">{type}</span>;
};

const formatAmount = (amount: number) => `${amount > 0 ? '+' : ''}${amount.toLocaleString()}P`;

const isMissionCompletedSource = (source?: PointHistorySource | null): source is MissionCompletedPointSource =>
  source?.reason === 'MISSION_COMPLETED';

const isRaffleEnteredSource = (source?: PointHistorySource | null): source is RaffleEnteredPointSource =>
  source?.reason === 'RAFFLE_ENTERED';

/**
 * 유저 상세 모달의 포인트 탭 (티켓별 잔액 + 적립/회수/사용 내역)
 *
 * 포인트는 티켓(PointTicket)별로 분리 관리되며, 티켓 목록은 서버 enum에서 받아옵니다.
 * 내역 정렬(sortBy)을 바꾸면 커서를 버리고 첫 페이지부터 다시 조회합니다.
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
  const enumLabels = useEnumLabels(PERIOD_ENUM_NAMES);
  const periodLabelOf = (value: string) => enumLabels[MISSION_ENUM_NAMES.periodType]?.[value] ?? value;
  const isTicketUnavailable = !ticketEnum.isLoading && !ticket;
  const [sortBy, setSortBy] = useState<PointHistorySortBy>('LATEST');

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
    (cursor: string | null) =>
      ticket ? pointApi.getUserPointHistories(userId, ticket, cursor, PAGE_SIZE, sortBy) : null,
    [userId, ticket, sortBy]
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
    deps: [userId, ticket, sortBy],
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
        // 상세 모달 탭 안에 중첩되므로 pills로 구분하고, 티켓이 늘어나도 줄바꿈 대신 가로 스크롤합니다.
        <ul className="nav nav-pills flex-nowrap overflow-x-auto mb-3 pb-1" role="tablist" aria-label="포인트 티켓">
          {ticketOptions.map((option) => {
            const isSelected = option.value === ticket;
            return (
              <li key={option.value} className="nav-item flex-shrink-0" role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  title={option.value}
                  className={`nav-link py-1 px-3 text-nowrap${isSelected ? ' active' : ''}`}
                  onClick={() => {
                    if (isSelected) return;
                    setBalance(null);
                    setSelectedTicket(option.value);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
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
        emptyDescription="아직 적립·회수·사용된 포인트가 없습니다."
        aside={(
          <select
            className="form-select form-select-sm w-auto"
            aria-label="포인트 내역 정렬"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as PointHistorySortBy)}
            disabled={isLoading}
          >
            <option value="LATEST">최신순</option>
            <option value="OLDEST">오래된순</option>
          </select>
        )}
      >
        {histories.map((history) => {
          // 알 수 없는 reason이나 source가 null(미션·응모 대상 삭제 등)이면 description만 표시합니다.
          const missionSource = isMissionCompletedSource(history.source) ? history.source : null;
          const raffleSource = isRaffleEnteredSource(history.source) ? history.source : null;
          const sourceTitle = missionSource?.mission.title ?? raffleSource?.raffle.title;
          const isDeduction = history.amount < 0;
          return (
            <ItemCard key={history.pointHistoryId} item={history} className="mb-2">
              <div className="d-flex align-items-start gap-3">
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-2 min-w-0">
                    {getTypeBadge(history.type)}
                    <h3 className="item-card__name text-truncate">
                      {sourceTitle ?? (history.description || history.reason)}
                    </h3>
                  </div>
                  {missionSource && (
                    <MissionCompletionMeta
                      missionGroup={missionSource.missionGroup}
                      periodLabel={periodLabelOf(missionSource.mission.periodType)}
                      periodKey={missionSource.periodKey}
                      sequence={missionSource.sequence}
                      maxCompletionCount={missionSource.mission.maxCompletionCount}
                    />
                  )}
                  <p className="item-card__desc">
                    {formatDateTimeKo(history.occurredAt)}
                    {sourceTitle && history.description && <> · {history.description}</>}
                  </p>
                </div>
                <div className={`flex-shrink-0 fs-6 fw-bold text-nowrap ${isDeduction ? 'text-danger' : 'text-success'}`}>
                  {formatAmount(history.amount)}
                </div>
              </div>
            </ItemCard>
          );
        })}
      </HistoryPanel>
    </>
  );
};

export default UserPointTab;
