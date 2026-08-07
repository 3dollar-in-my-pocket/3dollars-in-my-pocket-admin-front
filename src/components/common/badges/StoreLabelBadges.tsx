import {
  getLabelBadgeClass,
  getLabelDisplayName,
  getLabelIcon
} from '../../../utils/display/storeDisplay';

interface StoreLabelBadgesProps {
  labels?: string[] | null;
}

/**
 * 가게 라벨(인증 가게 등) 배지 목록
 */
const StoreLabelBadges = ({labels}: StoreLabelBadgesProps) => {
  if (!labels || labels.length === 0) return null;

  return (
    <>
      {labels.map((label, index) => (
        <span
          key={index}
          className={`badge rounded-pill px-3 py-2 ${getLabelBadgeClass(label)} bg-opacity-10 text-dark border`}
        >
          <i className={`bi ${getLabelIcon(label)} me-1`}></i>
          {getLabelDisplayName(label)}
        </span>
      ))}
    </>
  );
};

export default StoreLabelBadges;
