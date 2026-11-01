import SectionCard from '@/components/common/SectionCard';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import {formatDateTime} from '@/utils/dateUtils';
import {PollPin} from '@/types/poll';

interface PollPinSectionProps {
  pins: PollPin[];
  isLoading: boolean;
  /** pollId → 투표 제목 (불러온 투표 목록에 있는 경우) */
  pollTitles: Map<number, string>;
  deletingPinId: number | null;
  onCreate: () => void;
  onEdit: (pin: PollPin) => void;
  onDelete: (pin: PollPin) => void;
}

const isActive = (pin: PollPin) => new Date(pin.startDateTime).getTime() <= Date.now();

/**
 * 인기 투표 목록 고정 노출 설정 목록
 */
const PollPinSection = ({pins, isLoading, pollTitles, deletingPinId, onCreate, onEdit, onDelete}: PollPinSectionProps) => (
  <SectionCard
    title="고정 투표"
    icon="bi-pin-angle-fill"
    description="앱 인기 투표 목록 첫 페이지의 지정 위치에 기간 한정으로 노출합니다. 종료된 설정은 표시되지 않습니다."
    aside={
      <button type="button" className="btn btn-sm btn-primary" onClick={onCreate}>
        <i className="bi bi-plus-lg me-1"/>
        고정 등록
      </button>
    }
    flush
  >
    {isLoading && pins.length === 0 ? (
      <div className="text-center py-4">
        <span className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">불러오는 중</span>
        </span>
      </div>
    ) : pins.length === 0 ? (
      <EmptyState icon="bi-pin-angle" title="고정된 투표가 없습니다" description="투표 카드의 고정 버튼으로 등록할 수 있습니다."/>
    ) : (
      <DataTable>
        <thead>
        <tr>
          <th style={{width: 70}}>위치</th>
          <th>투표</th>
          <th>노출 기간</th>
          <th style={{width: 80}}>상태</th>
          <th style={{width: 110}} className="text-end">관리</th>
        </tr>
        </thead>
        <tbody>
        {pins.map(pin => (
          <tr key={pin.pollPinId}>
            <td className="fw-semibold">{pin.position}</td>
            <td>
              <div className="text-truncate" style={{maxWidth: 320}}>
                {pollTitles.get(pin.pollId) ?? <span className="text-muted">제목 미확인</span>}
              </div>
              <div className="small text-muted">ID {pin.pollId}</div>
            </td>
            <td className="small text-nowrap">
              {formatDateTime(pin.startDateTime)}
              <br/>~ {formatDateTime(pin.endDateTime)}
            </td>
            <td>
              {isActive(pin)
                ? <span className="badge bg-success">노출 중</span>
                : <span className="badge bg-secondary">예정</span>}
            </td>
            <td className="text-end text-nowrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary me-1"
                onClick={() => onEdit(pin)}
                aria-label="고정 설정 수정"
                title="수정"
              >
                <i className="bi bi-pencil"/>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(pin)}
                disabled={deletingPinId === pin.pollPinId}
                aria-label="고정 설정 삭제"
                title="삭제"
              >
                <i className="bi bi-trash"/>
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </DataTable>
    )}
  </SectionCard>
);

export default PollPinSection;
