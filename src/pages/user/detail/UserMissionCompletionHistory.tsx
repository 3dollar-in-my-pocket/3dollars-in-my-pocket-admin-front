import {useCallback, useEffect, useState} from 'react';
import missionApi from '@/api/missionApi';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import {useEnumLabels} from '@/hooks/useEnumOptions';
import ItemCard from '@/components/common/ItemCard';
import {MISSION_ENUM_NAMES, MissionCompletion, MissionGroup, POINT_REWARD_TYPE} from '@/types/mission';
import {POINT_TICKET_ENUM_NAME} from '@/types/point';
import MissionCompletionMeta from './MissionCompletionMeta';
import {formatDateTimeKo} from '@/utils/dateUtils';

interface UserMissionCompletionHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
}

const PAGE_SIZE = 20;
const ENUM_NAMES = [
  MISSION_ENUM_NAMES.periodType,
  MISSION_ENUM_NAMES.activityType,
  MISSION_ENUM_NAMES.rewardType,
  POINT_TICKET_ENUM_NAME,
];

/**
 * 유저 미션 완료 이력 (활동 이력 하위 탭)
 *
 * 이력은 미션 그룹 단위로 조회합니다. 그룹을 고르면 그 그룹의 완료 이력만 보여줍니다. (기본: 최신 그룹)
 * 미션 제목·기간·완료 조건·리워드를 보여줍니다.
 * 삭제 등으로 미션을 찾지 못한 이력은 mission이 null이라 missionId로만 식별할 수 있어 ID를 대체 표시합니다.
 */
const UserMissionCompletionHistory = ({userId, isActive}: UserMissionCompletionHistoryProps) => {
  const enumLabels = useEnumLabels(ENUM_NAMES);
  const labelOf = (enumName: string, value: string) => enumLabels[enumName]?.[value] ?? value;

  const [groups, setGroups] = useState<MissionGroup[] | null>(null);
  const [groupsError, setGroupsError] = useState(false);
  const [selectedGroupCode, setSelectedGroupCode] = useState<string | null>(null);
  // 선택한 그룹이 없거나 목록에 없으면 최신 그룹(목록 첫 번째)을 사용합니다.
  const groupCode = groups?.some((group) => group.code === selectedGroupCode)
    ? selectedGroupCode
    : groups?.[0]?.code ?? null;

  // 그룹 목록은 탭을 처음 열 때 한 번만 조회합니다. 실패하면 새로고침으로 다시 조회합니다.
  const fetchGroups = useCallback(async () => {
    setGroupsError(false);
    const response = await missionApi.getMissionGroups();
    if (!response.ok) {
      setGroupsError(true);
      return;
    }
    setGroups(response.data?.contents ?? []);
  }, []);

  useEffect(() => {
    if (isActive && groups === null && !groupsError) void fetchGroups();
  }, [isActive, groups, groupsError, fetchGroups]);

  const fetchCompletions = useCallback(
    (cursor: string | null) =>
      groupCode ? missionApi.getUserMissionCompletions(groupCode, userId, cursor, PAGE_SIZE) : null,
    [groupCode, userId]
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
    enabled: Boolean(userId && isActive && groupCode),
    deps: [userId, groupCode],
    errorMessage: '미션 완료 이력을 불러오지 못했습니다.'
  });

  const isGroupEmpty = groups !== null && groups.length === 0;

  return (
    <HistoryPanel
      title="미션 완료 이력"
      icon="bi-flag"
      count={groupCode ? completions.length : 0}
      hasMore={Boolean(groupCode) && hasMore}
      isLoading={isLoading || (isActive && groups === null && !groupsError)}
      isLoadingMore={isLoadingMore}
      error={groupsError ? '미션 그룹 목록을 불러오지 못했습니다.' : error}
      onRefresh={groupsError ? () => void fetchGroups() : refresh}
      onLoadMore={loadMore}
      emptyTitle={isGroupEmpty ? '등록된 미션 그룹이 없습니다' : '미션 완료 이력이 없습니다'}
      emptyDescription={isGroupEmpty ? '미션 그룹이 있어야 완료 이력을 조회할 수 있습니다.' : '이 그룹에서 완료한 미션이 없습니다.'}
      aside={groups && groups.length > 0 && (
        <select
          className="form-select form-select-sm w-auto"
          style={{maxWidth: 240}}
          aria-label="미션 그룹 선택"
          value={groupCode ?? ''}
          onChange={(e) => setSelectedGroupCode(e.target.value)}
          disabled={isLoading}
        >
          {groups.map((group) => (
            <option key={group.missionGroupId} value={group.code}>{group.name} ({group.code})</option>
          ))}
        </select>
      )}
    >
      {groupCode && completions.map(({missionCompletionId, missionId, mission, missionGroup, periodKey, sequence, completedAt}) => (
        <ItemCard key={missionCompletionId} item={missionId} muted={!mission} className="mb-2">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div className="flex-grow-1 min-w-0">
              <h3 className="item-card__name text-truncate">
                {mission ? mission.title : '삭제된 미션'}
              </h3>
              <MissionCompletionMeta
                missionGroup={missionGroup}
                periodLabel={mission && labelOf(MISSION_ENUM_NAMES.periodType, mission.periodType)}
                periodKey={periodKey}
                sequence={sequence}
                maxCompletionCount={mission?.maxCompletionCount}
              />
            </div>
            <span className="flex-shrink-0 small text-body-secondary text-nowrap">
              {formatDateTimeKo(completedAt)}
            </span>
          </div>

          {mission ? (
            <dl className="row g-0 small mt-2 mb-0">
              <dt className="col-auto fw-normal text-body-secondary me-2">조건</dt>
              <dd className="col mb-1">
                {mission.conditions.map((condition) => (
                  `${labelOf(MISSION_ENUM_NAMES.activityType, condition.activityType)} ${condition.targetCount}회`
                )).join(', ') || '-'}
              </dd>
              <div className="w-100"/>
              <dt className="col-auto fw-normal text-body-secondary me-2">리워드</dt>
              <dd className="col mb-0">
                {mission.rewards.map((reward, index) => (
                  <span key={`${reward.type}-${index}`} className="me-2 text-nowrap">
                    {reward.type === POINT_REWARD_TYPE ? (
                      <>
                        <strong className="text-success">+{(reward.amount ?? 0).toLocaleString()}P</strong>
                        {reward.ticket && (
                          <span className="text-body-secondary"> {labelOf(POINT_TICKET_ENUM_NAME, reward.ticket)}</span>
                        )}
                      </>
                    ) : labelOf(MISSION_ENUM_NAMES.rewardType, reward.type)}
                  </span>
                ))}
                {mission.rewards.length === 0 && '-'}
              </dd>
            </dl>
          ) : (
            <p className="item-card__desc">
              미션 정보를 찾을 수 없습니다. (미션 <span className="font-monospace">#{missionId}</span>)
            </p>
          )}
        </ItemCard>
      ))}
    </HistoryPanel>
  );
};

export default UserMissionCompletionHistory;
