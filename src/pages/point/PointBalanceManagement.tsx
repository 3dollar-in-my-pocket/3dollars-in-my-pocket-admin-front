import {useCallback, useState} from 'react';
import {useSearchParams} from 'react-router';
import pointApi from '@/api/pointApi';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import useCursorPagination from '@/hooks/useCursorPagination';
import useEnumOptions from '@/hooks/useEnumOptions';
import StoreDetailModal from '@/pages/store/StoreDetailModal';
import UserDetailModal from '@/pages/user/UserDetailModal';
import {
  POINT_TICKET_ENUM_NAME,
  PointBalanceSortBy,
  PointBalanceUser,
  PointHistory,
  UserPointBalanceItem,
} from '@/types/point';
import {formatDateTime} from '@/utils/dateUtils';

const PAGE_SIZE = 20;

const SORT_OPTIONS: { value: PointBalanceSortBy; label: string }[] = [
  {value: 'BALANCE_DESC', label: '잔액 많은순'},
  {value: 'BALANCE_ASC', label: '잔액 적은순'},
];

const isSortBy = (value: string | null): value is PointBalanceSortBy =>
  SORT_OPTIONS.some((option) => option.value === value);

/** 탈퇴 등으로 유저를 찾을 수 없으면 userId가 없어 상세로 이동할 수 없습니다. */
const hasUserId = (user: PointBalanceUser) => user.userId !== null && user.userId !== undefined;

/**
 * 포인트 잔액 조회
 *
 * 포인트 티켓별 유저 계정 잔액을 잔액순으로 조회합니다. 티켓·정렬은 URL(?ticket=&sortBy=)에 유지합니다.
 * 티켓·정렬을 바꾸면 커서를 버리고 첫 페이지부터 다시 조회합니다. (다음 페이지는 같은 sortBy로만 요청 가능)
 * 순위 번호는 잔액이 같아도 불러온 순서대로 매기며, 동률 사이의 순서에는 의미가 없습니다.
 */
const PointBalanceManagement = () => {
  const ticketEnum = useEnumOptions(POINT_TICKET_ENUM_NAME);
  const ticketOptions = ticketEnum.options;

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTicket = searchParams.get('ticket');
  const requestedSortBy = searchParams.get('sortBy');
  // URL의 티켓이 없거나 목록에 없으면 첫 번째 티켓을 사용합니다.
  const ticket = ticketOptions.some((option) => option.value === requestedTicket)
    ? requestedTicket
    : ticketOptions[0]?.value ?? null;
  const sortBy: PointBalanceSortBy = isSortBy(requestedSortBy) ? requestedSortBy : 'BALANCE_DESC';
  const ticketLabel = ticket ? ticketOptions.find((option) => option.value === ticket)?.label ?? ticket : '';
  const isTicketUnavailable = !ticketEnum.isLoading && !ticket;

  const [selectedUser, setSelectedUser] = useState<PointBalanceUser | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const setParam = (key: string, value: string) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set(key, value);
      return next;
    }, {replace: true});
  };

  const fetchBalances = useCallback(
    (cursor: string | null) => (ticket ? pointApi.getPointBalances(ticket, cursor, PAGE_SIZE, sortBy) : null),
    [ticket, sortBy]
  );

  const {
    items: balances,
    setItems: setBalances,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useCursorPagination<UserPointBalanceItem>({
    fetcher: fetchBalances,
    enabled: Boolean(ticket),
    deps: [ticket, sortBy],
    errorMessage: '포인트 잔액 목록을 불러오지 못했습니다.',
  });

  const isInitialLoading = isLoading && !isLoadingMore;

  /**
   * 상세 모달에서 회수하면 해당 유저의 잔액만 제자리에서 갱신합니다.
   * 다시 조회하면 불러온 페이지와 스크롤 위치를 잃으므로, 정렬 순서는 새로고침 시 반영됩니다.
   * 모달에서 다른 티켓을 회수한 경우는 이 목록과 무관하므로 무시합니다.
   */
  const handlePointRevoked = useCallback((revoked: PointHistory) => {
    if (revoked.ticket !== ticket || !selectedUser || !hasUserId(selectedUser)) return;
    const userId = String(selectedUser.userId);
    setBalances((prev) => prev.map((item) => (
      hasUserId(item.user) && String(item.user.userId) === userId
        ? {...item, balance: item.balance + revoked.amount}
        : item
    )));
  }, [ticket, selectedUser, setBalances]);

  return (
    <div>
      <PageHeader
        description="포인트 티켓별로 유저 포인트 잔액을 많은순·적은순으로 조회합니다. 유저를 누르면 상세 정보와 포인트 내역을 볼 수 있습니다."
        actions={
          <button className="btn btn-outline-secondary" onClick={refresh} disabled={!ticket || isLoading}>
            {isInitialLoading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
            ) : (
              <i className="bi bi-arrow-clockwise me-1"/>
            )}
            새로고침
          </button>
        }
      />

      {isTicketUnavailable && (
        <div className="alert alert-warning py-2 small" role="alert">
          서버에서 포인트 티켓 목록({POINT_TICKET_ENUM_NAME})을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}

      <SectionCard title="조회 조건" icon="bi-funnel-fill">
        <div className="d-flex flex-column flex-md-row gap-2">
          <select
            className="form-select"
            style={{maxWidth: 420}}
            aria-label="포인트 티켓 선택"
            value={ticket ?? ''}
            onChange={(e) => setParam('ticket', e.target.value)}
            disabled={ticketEnum.isLoading || ticketOptions.length === 0}
          >
            {ticketEnum.isLoading && <option value="">불러오는 중...</option>}
            {!ticketEnum.isLoading && ticketOptions.length === 0 && (
              <option value="">선택 가능한 포인트 티켓이 없습니다</option>
            )}
            {ticketOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
            ))}
          </select>
          <select
            className="form-select w-auto"
            aria-label="정렬"
            value={sortBy}
            onChange={(e) => setParam('sortBy', e.target.value)}
            disabled={!ticket}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
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
        title={ticket ? `유저 잔액 · ${ticketLabel}` : '유저 잔액'}
        icon="bi-coin"
        aside={balances.length > 0 && (
          <span className="page-count">{balances.length.toLocaleString()}명{hasMore && '+'}</span>
        )}
      >
        {(ticketEnum.isLoading || isInitialLoading) && balances.length === 0 && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">포인트 잔액 목록 불러오는 중</span>
            </div>
          </div>
        )}

        {!isLoading && !error && ticket && balances.length === 0 && (
          <EmptyState
            icon="bi-coin"
            title="포인트를 보유한 유저가 없습니다"
            description="이 티켓의 포인트를 가진 유저 계정이 없습니다."
          />
        )}

        {balances.length > 0 && (
          <DataTable>
            <thead>
            <tr>
              <th className="text-center">순위</th>
              <th>유저</th>
              <th className="text-end">잔액</th>
              <th>가입일</th>
            </tr>
            </thead>
            <tbody>
            {balances.map(({user, balance}, index) => {
              const canOpen = hasUserId(user);
              return (
                // 페이지 사이에 잔액이 바뀐 유저는 다시 나올 수 있고 사라진 유저는 userId가 없어 순서를 key에 포함합니다.
                // (목록은 뒤에 이어 붙이기만 하므로 순서가 바뀌지 않음)
                <tr key={`${index}-${user.userId ?? 'missing'}`}>
                  <td className="text-center text-body-secondary">{index + 1}</td>
                  <td>
                    {canOpen ? (
                      <button
                        type="button"
                        className="btn btn-link p-0 fw-semibold text-start text-decoration-none"
                        onClick={() => setSelectedUser({...user, userId: String(user.userId)})}
                      >
                        {user.name}
                      </button>
                    ) : (
                      <span className="fw-semibold text-body-secondary">{user.name}</span>
                    )}
                    <div className="small text-body-secondary font-monospace">
                      {canOpen ? user.userId : '탈퇴 또는 없는 유저'}
                    </div>
                  </td>
                  <td className="text-end fw-bold text-nowrap">{balance.toLocaleString()}P</td>
                  <td className="small text-body-secondary text-nowrap">{formatDateTime(user.createdAt) || '-'}</td>
                </tr>
              );
            })}
            </tbody>
          </DataTable>
        )}

        {hasMore && balances.length > 0 && (
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

      <UserDetailModal
        show={!!selectedUser}
        onHide={() => setSelectedUser(null)}
        user={selectedUser}
        onStoreClick={(store) => store?.storeId && setSelectedStore(store)}
        onPointRevoked={handlePointRevoked}
      />

      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={() => {
        }}
        onStoreDeleted={() => {
        }}
      />
    </div>
  );
};

export default PointBalanceManagement;
