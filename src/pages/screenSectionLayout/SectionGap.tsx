import React from 'react';

interface SectionGapProps {
  marginBottom: number;
  /** 미노출 섹션의 여백은 화면 조립 시 반영되지 않으므로 흐리게 표시합니다. */
  isVisible: boolean;
}

/** 라벨을 넣을 공간이 없는 높이. 이보다 좁으면 줄무늬만 그립니다. */
const LABEL_MIN_HEIGHT = 22;

/**
 * 0보다 큰 여백에 보장하는 최소 높이.
 *
 * 앱에서는 dp 단위로 렌더링되지만 어드민은 데스크톱 화면이라, 8·16 같은 작은 값을
 * 그대로 px로 그리면 0과 구분되지 않습니다. 작은 값도 눈에 띄게 바닥을 깔아둡니다.
 */
const MIN_VISUAL_HEIGHT = 14;

/** 큰 값이 목록을 과도하게 늘리지 않도록 제한하는 표시 높이 상한 */
const MAX_VISUAL_HEIGHT = 72;

/**
 * 여백 값을 화면에 그릴 높이로 변환합니다.
 *
 * 값에 비례하되 작은 값은 바닥을 깔고 큰 값은 상한을 둬서, 순서 관계는 유지하면서도
 * 0 / 8 / 40 / 100이 모두 서로 다르게 보이도록 합니다.
 */
export const toVisualHeight = (marginBottom: number): number => {
  if (marginBottom <= 0) return 2;
  const scaled = MIN_VISUAL_HEIGHT + marginBottom * 0.6;
  return Math.round(Math.min(scaled, MAX_VISUAL_HEIGHT));
};

/**
 * 섹션 사이의 하단 여백(marginBottom)을 높이로 그려 보여줍니다.
 *
 * 서버가 이 값을 보고 MARGIN 섹션을 자동 삽입하므로, 어드민에서도 숫자 대신
 * 간격으로 보이게 해 화면 결과를 가늠할 수 있게 합니다.
 * 실제 픽셀과 1:1은 아니며 값의 대소 관계를 보여주기 위한 표현입니다.
 */
const SectionGap: React.FC<SectionGapProps> = ({marginBottom, isVisible}) => {
  const isZero = marginBottom <= 0;
  const height = toVisualHeight(marginBottom);
  const isTight = height < LABEL_MIN_HEIGHT;

  const className = [
    'section-gap',
    isZero ? 'section-gap--zero' : '',
    isTight ? 'section-gap--tight' : '',
    isVisible ? '' : 'section-gap--muted'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      style={{height}}
      // 값은 각 섹션의 하단 여백 입력란에서 이미 읽을 수 있으므로 중복 안내하지 않습니다.
      aria-hidden="true"
    >
      <span className="section-gap__label">{marginBottom}</span>
    </div>
  );
};

export default SectionGap;
