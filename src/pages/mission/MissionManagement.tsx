import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import {useSearchParams} from 'react-router';
import missionApi from '@/api/missionApi';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import useConfirm from '@/hooks/useConfirm';
import {useEnumLabels} from '@/hooks/useEnumOptions';
import {usePermission} from '@/hooks/usePermission';
import {AdminRole} from '@/types/admin';
import {Mission, MISSION_ENUM_NAMES, MissionGroup, POINT_REWARD_TYPE, UpdateMissionRequest} from '@/types/mission';
import {POINT_TICKET_ENUM_NAME} from '@/types/point';
import {formatDateTime} from '@/utils/dateUtils';
import MissionFormModal from './MissionFormModal';
import MissionGroupFormModal from './MissionGroupFormModal';

/**
 * 미션 관리
 *
 * 미션은 미션 그룹 단위로 관리합니다. 선택한 그룹 code는 URL(?group=)에 유지합니다.
 * 조회·등록·수정 모두 OPERATOR 이상만 가능합니다.
 * 삭제 기능은 없으며, 미션을 내리려면 비노출로 수정합니다.
 */
const MISSION_ENUM_NAME_LIST = [...Object.values(MISSION_ENUM_NAMES), POINT_TICKET_ENUM_NAME];

/** 유효 기간 상태 (시작 포함, 종료 미포함) */
const getGroupStatus = (group: MissionGroup) => {
  const now = Date.now();
  if (now < new Date(group.startDateTime).getTime()) return {label: '예정', className: 'text-bg-info'};
  if (now >= new Date(group.endDateTime).getTime()) return {label: '종료', className: 'text-bg-secondary'};
  return {label: '진행 중', className: 'text-bg-success'};
};

/** 수정 API는 전체 교체이므로 현재 값을 그대로 담고 노출 여부만 바꿉니다. (MissionFormModal과 같은 바디 형태) */
const buildVisibilityRequest = (mission: Mission, isVisible: boolean): UpdateMissionRequest => ({
  title: mission.title,
  maxCompletionCount: mission.maxCompletionCount,
  conditions: mission.conditions.map(({activityType, targetCount}) => ({activityType, targetCount})),
  rewards: mission.rewards.map((reward) => (
    reward.type === POINT_REWARD_TYPE
      ? {type: reward.type, ticket: reward.ticket, amount: reward.amount}
      : {type: reward.type}
  )),
  isVisible,
  displayOrder: mission.displayOrder,
});

const MissionManagement = () => {
  // 표시명은 서버 enum에서 받아오며, 조회 전이나 실패 시에는 원래 값을 그대로 보여줍니다.
  const enumLabels = useEnumLabels(MISSION_ENUM_NAME_LIST);
  const labelOf = (enumName: string, value: string) => enumLabels[enumName]?.[value] ?? value;

  const {hasAccess} = usePermission();
  const canManage = hasAccess([AdminRole.OPERATOR]);

  const [searchParams, setSearchParams] = useSearchParams();
  const groupCode = searchParams.get('group');

  const [groups, setGroups] = useState<MissionGroup[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MissionGroup | null>(null);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const confirm = useConfirm();
  const [togglingMissionId, setTogglingMissionId] = useState<string | null>(null);

  const selectedGroup = groups.find((group) => group.code === groupCode) ?? null;

  const selectGroup = useCallback((code: string | null) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      if (code) next.set('group', code);
      else next.delete('group');
      return next;
    }, {replace: true});
  }, [setSearchParams]);

  const fetchGroups = useCallback(async () => {
    setIsGroupsLoading(true);
    setGroupsError(null);
    try {
      const response = await missionApi.getMissionGroups();
      if (!response.ok) {
        setGroupsError('미션 그룹 목록을 불러오지 못했습니다.');
        return;
      }
      setGroups(response.data?.contents ?? []);
    } finally {
      setIsGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  // 선택된 그룹이 없거나 목록에 없으면 최신 그룹을 선택합니다.
  useEffect(() => {
    if (isGroupsLoading || groupsError) return;
    if (!groups.some((group) => group.code === groupCode)) selectGroup(groups[0]?.code ?? null);
  }, [groups, groupCode, isGroupsLoading, groupsError, selectGroup]);

  // 그룹을 빠르게 바꿀 때 이전 그룹의 늦은 응답이 덮어쓰지 않도록 마지막 요청만 반영합니다.
  const latestRequestRef = useRef(0);

  const fetchMissions = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    setMissions([]);
    setError(null);
    if (!groupCode) return;

    setIsLoading(true);
    try {
      const response = await missionApi.getMissions(groupCode);
      if (requestId !== latestRequestRef.current) return;
      if (!response.ok) {
        setError('미션 목록을 불러오지 못했습니다.');
        return;
      }
      setMissions(response.data?.contents ?? []);
    } finally {
      if (requestId === latestRequestRef.current) setIsLoading(false);
    }
  }, [groupCode]);

  useEffect(() => {
    void fetchMissions();
  }, [fetchMissions]);

  const openCreateGroup = () => {
    setEditingGroup(null);
    setShowGroupForm(true);
  };

  const openEditGroup = () => {
    setEditingGroup(selectedGroup);
    setShowGroupForm(true);
  };

  const handleGroupSaved = (saved: MissionGroup) => {
    void fetchGroups();
    selectGroup(saved.code);
  };

  const handleToggleVisible = async (mission: Mission) => {
    if (!groupCode || togglingMissionId) return;
    const nextVisible = !mission.isVisible;
    if (!await confirm({
      title: nextVisible ? '미션 노출' : '미션 비노출',
      message: nextVisible
        ? '이 미션을 앱에 다시 노출하시겠습니까?'
        : '이 미션을 앱에서 내리시겠습니까?\n언제든 다시 노출로 바꿀 수 있습니다.',
      details: [{label: '미션', value: mission.title}],
      confirmLabel: nextVisible ? '노출' : '비노출',
      variant: nextVisible ? 'primary' : 'warning',
    })) return;

    setTogglingMissionId(mission.missionId);
    try {
      // 목록을 띄운 뒤 다른 관리자가 수정했을 수 있어, 최신 값을 받아 노출 여부만 바꿔 저장합니다.
      const latest = await missionApi.getMission(groupCode, mission.missionId);
      if (!latest.ok) return;
      const response = await missionApi.updateMission(
        groupCode,
        mission.missionId,
        buildVisibilityRequest(latest.data, nextVisible)
      );
      // 실패 메시지는 공통 인터셉터가 토스트로 노출합니다.
      if (!response.ok) return;

      setMissions((prev) => prev.map((item) => (item.missionId === mission.missionId ? response.data : item)));
      toast.success(`미션이 ${nextVisible ? '노출' : '비노출'}로 변경되었습니다. 앱에는 캐시로 인해 최대 수 분 늦게 반영될 수 있습니다.`);
    } finally {
      setTogglingMissionId(null);
    }
  };

  const openCreate = () => {
    setEditingMissionId(null);
    setShowForm(true);
  };

  const openEdit = (missionId: string) => {
    setEditingMissionId(missionId);
    setShowForm(true);
  };

  // 신규 미션은 기본적으로 목록 맨 뒤에 노출되도록 현재 최댓값 + 1을 제안합니다.
  const nextDisplayOrder = missions.length > 0
    ? Math.max(...missions.map((mission) => mission.displayOrder)) + 1
    : 1;
  const visibleCount = missions.filter((mission) => mission.isVisible).length;

  return (
    <div>
      <PageHeader
        description="미션 그룹별로 앱에 노출되는 미션의 완료 조건과 리워드를 관리합니다. 미션을 내리려면 목록의 비노출 버튼을 눌러주세요."
        actions={
          <div className="d-flex gap-2">
            {canManage && (
              <button className="btn btn-primary" onClick={openCreate} disabled={isLoading || !selectedGroup}>
                <i className="bi bi-plus-lg me-1"/>
                미션 등록
              </button>
            )}
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                void fetchGroups();
                void fetchMissions();
              }}
              disabled={isLoading || isGroupsLoading}
            >
              {isLoading || isGroupsLoading ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
              ) : (
                <i className="bi bi-arrow-clockwise me-1"/>
              )}
              새로고침
            </button>
          </div>
        }
      />

      {groupsError && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center py-2" role="alert">
          <span>{groupsError}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void fetchGroups()}>
            다시 시도
          </button>
        </div>
      )}

      <SectionCard
        title="미션 그룹"
        icon="bi-collection-fill"
        aside={canManage && (
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={openCreateGroup}>
            <i className="bi bi-plus-lg me-1"/>그룹 등록
          </button>
        )}
      >
        {!isGroupsLoading && !groupsError && groups.length === 0 ? (
          <EmptyState
            icon="bi-collection"
            title="등록된 미션 그룹이 없습니다"
            description="미션을 등록하려면 먼저 미션 그룹을 등록해주세요."
            actionButton={canManage ? {label: '그룹 등록', onClick: openCreateGroup} : undefined}
          />
        ) : (
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 gap-md-3">
            <select
              className="form-select"
              style={{maxWidth: 420}}
              aria-label="미션 그룹 선택"
              value={selectedGroup?.code ?? ''}
              onChange={(e) => selectGroup(e.target.value)}
              disabled={isGroupsLoading || groups.length === 0}
            >
              {isGroupsLoading && groups.length === 0 && <option value="">불러오는 중...</option>}
              {groups.map((group) => (
                <option key={group.missionGroupId} value={group.code}>
                  [{getGroupStatus(group).label}] {group.name} ({group.code})
                </option>
              ))}
            </select>
            {selectedGroup && (
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className={`badge ${getGroupStatus(selectedGroup).className}`}>
                  {getGroupStatus(selectedGroup).label}
                </span>
                <span className="text-body-secondary text-nowrap">
                  {formatDateTime(selectedGroup.startDateTime)} ~ {formatDateTime(selectedGroup.endDateTime)} (종료 미포함)
                </span>
                {canManage && (
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={openEditGroup}>
                    그룹 수정
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center py-2" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void fetchMissions()}>
            다시 시도
          </button>
        </div>
      )}

      <SectionCard
        title={selectedGroup ? `미션 목록 · ${selectedGroup.name}` : '미션 목록'}
        icon="bi-flag-fill"
        aside={missions.length > 0 && (
          <span className="page-count">노출 {visibleCount} / 전체 {missions.length}</span>
        )}
      >
        {isLoading && missions.length === 0 && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">미션 목록 불러오는 중</span>
            </div>
          </div>
        )}

        {!isLoading && !error && selectedGroup && missions.length === 0 && (
          <EmptyState
            icon="bi-flag"
            title="등록된 미션이 없습니다"
            description="유저에게 노출할 미션을 등록해주세요."
            actionButton={canManage ? {label: '미션 등록', onClick: openCreate} : undefined}
          />
        )}

        {missions.length > 0 && (
          <DataTable>
            <thead>
            <tr>
              <th className="text-center">순서</th>
              <th>제목</th>
              <th>기간</th>
              <th className="text-center">최대 완료</th>
              <th>완료 조건</th>
              <th>리워드</th>
              <th className="text-center">노출</th>
              <th>수정일</th>
              {canManage && <th className="text-end">관리</th>}
            </tr>
            </thead>
            <tbody>
            {missions.map((mission) => (
              <tr key={mission.missionId}>
                <td className="text-center">{mission.displayOrder}</td>
                <td>
                  <div className="fw-semibold">{mission.title}</div>
                  <div className="small text-body-secondary font-monospace">{mission.missionId}</div>
                </td>
                <td><span className="badge text-bg-light border">{labelOf(MISSION_ENUM_NAMES.periodType, mission.periodType)}</span></td>
                <td className="text-center">{mission.maxCompletionCount}회</td>
                <td>
                  {mission.conditions.map((condition) => (
                    <div key={condition.activityType} className="text-nowrap">
                      {labelOf(MISSION_ENUM_NAMES.activityType, condition.activityType)} {condition.targetCount.toLocaleString()}회
                    </div>
                  ))}
                </td>
                <td>
                  {mission.rewards.map((reward) => (
                    <div key={reward.type} className="text-nowrap">
                      {labelOf(MISSION_ENUM_NAMES.rewardType, reward.type)}
                      {reward.type === POINT_REWARD_TYPE && ` ${reward.amount?.toLocaleString()}P`}
                      {reward.ticket && (
                        <div className="small text-body-secondary">{labelOf(POINT_TICKET_ENUM_NAME, reward.ticket)}</div>
                      )}
                    </div>
                  ))}
                </td>
                <td className="text-center">
                  {mission.isVisible
                    ? <span className="badge text-bg-success">노출</span>
                    : <span className="badge text-bg-secondary">비노출</span>}
                </td>
                <td className="small text-body-secondary text-nowrap">{formatDateTime(mission.updatedAt)}</td>
                {canManage && (
                  <td className="text-end">
                    <div className="d-inline-flex gap-1">
                      <button
                        type="button"
                        className={`btn btn-sm text-nowrap ${mission.isVisible ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggleVisible(mission)}
                        disabled={Boolean(togglingMissionId)}
                        aria-label={`${mission.title} ${mission.isVisible ? '비노출' : '노출'}로 변경`}
                      >
                        {togglingMissionId === mission.missionId ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-label="변경 중"/>
                        ) : mission.isVisible ? '비노출' : '노출'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary text-nowrap"
                        onClick={() => openEdit(mission.missionId)}
                        disabled={togglingMissionId === mission.missionId}
                      >
                        수정
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            </tbody>
          </DataTable>
        )}
      </SectionCard>

      {selectedGroup && (
        <MissionFormModal
          show={showForm}
          groupCode={selectedGroup.code}
          missionId={editingMissionId}
          defaultDisplayOrder={nextDisplayOrder}
          onHide={() => setShowForm(false)}
          onSuccess={() => void fetchMissions()}
        />
      )}

      <MissionGroupFormModal
        show={showGroupForm}
        group={editingGroup}
        onHide={() => setShowGroupForm(false)}
        onSuccess={handleGroupSaved}
      />
    </div>
  );
};

export default MissionManagement;
