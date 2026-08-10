interface DetailModalTabTitleProps {
  /** Bootstrap Icons 클래스명 (예: bi-person-vcard) */
  icon: string;
  /** 탭 라벨. 좁은 화면에서는 숨겨지고 아이콘만 남습니다. */
  label: string;
  /** 라벨 오른쪽 건수 배지. 0이나 undefined면 표시하지 않습니다. */
  count?: number;
  /** 미지원 탭 표시 (라벨을 흐리게 하고 금지 아이콘을 덧붙임) */
  unsupported?: boolean;
}

/**
 * 상세 모달 탭바의 탭 제목
 *
 * 라벨 숨김은 CSS 미디어 쿼리(.detail-modal__tab-label)로 처리하므로
 * 렌더 중에 화면 너비를 읽지 않습니다.
 */
const DetailModalTabTitle = ({icon, label, count, unsupported = false}: DetailModalTabTitleProps) => (
  <>
    <i className={`bi ${icon}`} aria-hidden="true"/>
    <span className="detail-modal__tab-label">{label}</span>
    {count ? <span className="detail-modal__tab-count">{count}</span> : null}
    {unsupported && <i className="bi bi-slash-circle" title="미지원" aria-label="미지원"/>}
  </>
);

export default DetailModalTabTitle;
