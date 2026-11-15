import {useCallback, useEffect, useState} from 'react';
import missionApi from '@/api/missionApi';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import {useEnumLabels} from '@/hooks/useEnumOptions';
import {usePermission} from '@/hooks/usePermission';
import {AdminRole} from '@/types/admin';
import {Mission, MISSION_ENUM_NAMES, POINT_REWARD_TYPE} from '@/types/mission';
import {formatDateTime} from '@/utils/dateUtils';
import MissionFormModal from './MissionFormModal';

/**
 * 미션 관리
 *
 * 등록·수정은 OPERATOR 이상, 조회는 모든 어드민이 가능합니다.
 * 삭제 기능은 없으며, 미션을 내리려면 비노출로 수정합니다.
 */
const MISSION_ENUM_NAME_LIST = Object.values(MISSION_ENUM_NAMES);

const MissionManagement = () => {
  // 표시명은 서버 enum에서 받아오며, 조회 전이나 실패 시에는 원래 값을 그대로 보여줍니다.
  const enumLabels = useEnumLabels(MISSION_ENUM_NAME_LIST);
  const labelOf = (enumName: string, value: string) => enumLabels[enumName]?.[value] ?? value;

  const {hasAccess} = usePermission();
  const canManage = hasAccess([AdminRole.OPERATOR]);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await missionApi.getMissions();
      if (!response.ok) {
        setError('미션 목록을 불러오지 못했습니다.');
        return;
      }
      setMissions(response.data?.contents ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMissions();
  }, [fetchMissions]);

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
        description="앱에 노출되는 미션의 완료 조건과 리워드를 관리합니다. 미션을 내리려면 비노출로 수정해주세요."
        actions={
          <div className="d-flex gap-2">
            {canManage && (
              <button className="btn btn-primary" onClick={openCreate} disabled={isLoading}>
                <i className="bi bi-plus-lg me-1"/>
                미션 등록
              </button>
            )}
            <button className="btn btn-outline-secondary" onClick={() => void fetchMissions()} disabled={isLoading}>
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

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center py-2" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void fetchMissions()}>
            다시 시도
          </button>
        </div>
      )}

      <SectionCard
        title="미션 목록"
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

        {!isLoading && !error && missions.length === 0 && (
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
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEdit(mission.missionId)}
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
      </SectionCard>

      <MissionFormModal
        show={showForm}
        missionId={editingMissionId}
        defaultDisplayOrder={nextDisplayOrder}
        onHide={() => setShowForm(false)}
        onSuccess={() => void fetchMissions()}
      />
    </div>
  );
};

export default MissionManagement;
