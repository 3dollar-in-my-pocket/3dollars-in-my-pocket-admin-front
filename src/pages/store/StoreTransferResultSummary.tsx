import {StoreTransferItem, StoreTransferResult} from '@/types/store';

/** 모르는 type은 서버 값을 그대로 표시합니다. (이관기 구성은 서버에서 추가될 수 있음) */
const TRANSFER_TYPE_LABELS: Record<string, string> = {
  REVIEW: '리뷰',
  IMAGE: '이미지',
  VISIT: '방문 인증',
  FAVORITE: '즐겨찾기',
  INFO: '가게 정보',
  POST: '소식'
};

/** skippedCount 의미가 항목마다 달라 문구를 따로 둡니다. */
const getSkippedNote = ({type, skippedCount}: StoreTransferItem): string | null => {
  if (skippedCount <= 0) return null;
  switch (type) {
    case 'VISIT':
      return `유지할 가게에 같은 날 방문 인증이 있어 제외 ${skippedCount}건`;
    case 'FAVORITE':
      return `유지할 가게를 이미 즐겨찾기해 제외 ${skippedCount}건`;
    default:
      return `${TRANSFER_TYPE_LABELS[type] ?? type} 이관 제외 ${skippedCount}건`;
  }
};

/** 가게 데이터 이관 결과(유형별 이관/제외 건수) 요약 */
const StoreTransferResultSummary = ({result}: { result: StoreTransferResult }) => {
  const items = result.contents;
  if (items.every(item => item.transferredCount === 0 && item.skippedCount === 0)) {
    return <div className="small text-body-secondary">더 이관할 데이터가 없었습니다.</div>;
  }
  const notes = items.map(getSkippedNote).filter(Boolean);
  return (
    <div className="small text-body-secondary">
      {items.map(item => `${TRANSFER_TYPE_LABELS[item.type] ?? item.type} ${item.transferredCount}건`).join(' · ')}
      {notes.length > 0 && <div>{notes.join(', ')}</div>}
    </div>
  );
};

export default StoreTransferResultSummary;
