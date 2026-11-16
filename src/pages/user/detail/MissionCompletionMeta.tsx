import {MissionGroup} from '@/types/mission';

interface MissionCompletionMetaProps {
  missionGroup?: MissionGroup | null;
  /** 기간 타입 표시명 (예: 일간). 미션을 찾지 못하면 생략 */
  periodLabel?: string | null;
  /** 완료한 기간 키. DAILY는 완료 일자(KST) yyyy-MM-dd */
  periodKey: string;
  /** 기간 안에서 완료한 회차 (1부터) */
  sequence: number;
  /** 기간 내 최대 완료 회차. 있으면 "1/3회차"로 표시 */
  maxCompletionCount?: number | null;
}

/**
 * 미션 완료 정보 한 줄 요약: 그룹 · 기간 타입 · 기간 키 회차
 * 포인트 내역(미션 완료 적립)과 미션 완료 이력에서 같은 형식으로 보여줍니다.
 */
const MissionCompletionMeta = ({
                                 missionGroup,
                                 periodLabel,
                                 periodKey,
                                 sequence,
                                 maxCompletionCount
                               }: MissionCompletionMetaProps) => (
  <div className="d-flex align-items-center flex-wrap gap-1 mt-1 small text-body-secondary">
    {missionGroup && (
      <span className="badge rounded-pill text-bg-light border fw-normal text-truncate" style={{maxWidth: '100%'}}
            title={missionGroup.code}>
        <i className="bi bi-collection me-1" aria-hidden="true"/>
        {missionGroup.name}
      </span>
    )}
    {periodLabel && <span className="badge rounded-pill text-bg-light border fw-normal">{periodLabel}</span>}
    <span>
      {periodKey} · {maxCompletionCount ? `${sequence}/${maxCompletionCount}` : sequence}회차
    </span>
  </div>
);

export default MissionCompletionMeta;
