import React from 'react';
import {ScreenType} from '@/types/screenSectionLayout';
import {getScreenTypeLabel, getSectionTypeLabel} from '@/constants/screenSectionLayout';
import {SectionLayoutDraft} from './useSectionLayoutDraft';

interface SectionPreviewProps {
  screenType: ScreenType;
  sections: SectionLayoutDraft[];
  /** 편집 목록에서 선택된 섹션. 미리보기에서도 같은 블록을 강조합니다. */
  activeKey: string | null;
  onSelect: (key: string) => void;
}

/**
 * 섹션 블록의 표시 높이.
 *
 * 앱의 실제 섹션 높이는 콘텐츠에 따라 달라져 알 수 없으므로, 여기서는 모든 블록을
 * 같은 높이로 그립니다. 미리보기의 목적은 높이 재현이 아니라 순서와 여백 비율입니다.
 */
const BLOCK_HEIGHT = 44;

/**
 * 여백 값을 미리보기 높이로 변환합니다.
 *
 * 실제 dp 값을 그대로 px로 쓰면 8과 16의 차이가 거의 보이지 않아, 비율은 유지하되
 * 조금 과장해서 그립니다. 절대 크기가 아닌 대소 관계를 보여주기 위한 표현입니다.
 */
export const toPreviewGapHeight = (marginBottom: number): number => {
  if (marginBottom <= 0) return 0;
  return Math.round(Math.min(4 + marginBottom * 0.55, 44));
};

/**
 * 편집 중인 섹션 구성을 모바일 화면 모양으로 그려 보여줍니다.
 *
 * 숫자 목록만으로는 "위에서 세 번째, 여백 24"가 실제로 어떻게 보이는지 가늠하기 어려워
 * 순서와 여백을 그대로 쌓아 올린 축소도를 함께 제공합니다.
 */
const SectionPreview: React.FC<SectionPreviewProps> = ({screenType, sections, activeKey, onSelect}) => {
  const visibleSections = sections.filter((section) => section.isVisible);

  return (
    <div className="screen-preview">
      <div className="screen-preview__frame">
        <div className="screen-preview__notch" aria-hidden="true"/>
        <div className="screen-preview__bar">{getScreenTypeLabel(screenType)}</div>

        <div className="screen-preview__body">
          {visibleSections.length === 0 ? (
            <p className="screen-preview__empty">
              노출 중인 섹션이 없습니다.
            </p>
          ) : (
            visibleSections.map((section, index) => {
              const gapHeight = toPreviewGapHeight(section.marginBottom);
              const isLast = index === visibleSections.length - 1;

              return (
                <React.Fragment key={section.key}>
                  <button
                    type="button"
                    className={`screen-preview__block ${activeKey === section.key ? 'is-active' : ''}`}
                    style={{height: BLOCK_HEIGHT}}
                    onClick={() => onSelect(section.key)}
                    title={`${getSectionTypeLabel(screenType, section.sectionType)} (${section.sectionId})`}
                  >
                    <span className="screen-preview__block-order">{index + 1}</span>
                    <span className="screen-preview__block-name">
                      {getSectionTypeLabel(screenType, section.sectionType)}
                    </span>
                  </button>

                  {/* 마지막 섹션의 하단 여백은 아래에 이어지는 섹션이 없어 화면에서 의미가 없습니다. */}
                  {!isLast && gapHeight > 0 && (
                    <div
                      className="screen-preview__gap"
                      style={{height: gapHeight}}
                      aria-hidden="true"
                    >
                      <span className="screen-preview__gap-label">{section.marginBottom}</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      <p className="screen-preview__caption">
        노출 중인 섹션만 순서대로 표시합니다. 블록 높이는 실제 화면과 다르며, 섹션 사이 간격만 여백 값에 비례합니다.
      </p>
    </div>
  );
};

export default SectionPreview;
