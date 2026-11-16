import {useCallback} from 'react';
import missionApi from '@/api/missionApi';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import {useEnumLabels} from '@/hooks/useEnumOptions';
import {MISSION_ENUM_NAMES, MissionCompletion} from '@/types/mission';
import {formatDateTimeKo} from '@/utils/dateUtils';

interface UserMissionCompletionHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
}

const PAGE_SIZE = 20;
const PERIOD_ENUM_NAMES = [MISSION_ENUM_NAMES.periodType];

/**
 * 유저 미션 완료 이력 (활동 이력 하위 탭)
 *
 * 삭제 등으로 미션을 찾지 못한 이력은 missionTitle/periodType이 null이라 missionId로 대체 표시합니다.
 */
const UserMissionCompletionHistory = ({userId, isActive}: UserMissionCompletionHistoryProps) => {
  const enumLabels = useEnumLabels(PERIOD_ENUM_NAMES);
  const periodLabelOf = (value: string) => enumLabels[MISSION_ENUM_NAMES.periodType]?.[value] ?? value;

  const fetchCompletions = useCallback(
    (cursor: string | null) => missionApi.getUserMissionCompletions(userId, cursor, PAGE_SIZE),
    [userId]
  );

  const {
    items: completions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<MissionCompletion>({
    fetcher: fetchCompletions,
    enabled: Boolean(userId && isActive),
    deps: [userId],
    errorMessage: '미션 완료 이력을 불러오지 못했습니다.'
  });

  return (
    <HistoryPanel
      title="미션 완료 이력"
      icon="bi-flag"
      count={completions.length}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onRefresh={refresh}
      onLoadMore={loadMore}
      emptyTitle="미션 완료 이력이 없습니다"
      emptyDescription="아직 완료한 미션이 없습니다."
    >
      {completions.map((completion) => (
        <div key={completion.missionCompletionId} className="item-card mb-3">
          <div className="item-card__body">
            <div className="d-flex align-items-center flex-wrap gap-2">
              {completion.missionTitle ? (
                <h3 className="item-card__name">{completion.missionTitle}</h3>
              ) : (
                <h3 className="item-card__name text-body-secondary">미션 정보 없음</h3>
              )}
              {completion.periodType && (
                <span className="badge text-bg-light border">{periodLabelOf(completion.periodType)}</span>
              )}
              <span className="small text-body-secondary font-monospace">미션 #{completion.missionId}</span>
            </div>
            <p className="item-card__desc">
              <i className="bi bi-calendar-check me-1" aria-hidden="true"/>
              완료 기간 {completion.periodKey} · {completion.sequence}회차
            </p>
            <p className="item-card__desc">
              <i className="bi bi-clock me-1" aria-hidden="true"/>
              {formatDateTimeKo(completion.completedAt)}
            </p>
          </div>
        </div>
      ))}
    </HistoryPanel>
  );
};

export default UserMissionCompletionHistory;
