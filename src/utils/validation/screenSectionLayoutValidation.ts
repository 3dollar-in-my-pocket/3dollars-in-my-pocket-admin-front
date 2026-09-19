/**
 * 화면 섹션 레이아웃 입력값 검증
 *
 * 서버가 저장 전에 동일한 규칙을 검증하고 하나라도 실패하면 아무것도 반영하지 않으므로,
 * 저장 버튼을 누르기 전에 UI에서 먼저 걸러 불필요한 400 응답을 줄입니다.
 */

import {
  MARGIN_BOTTOM_MAX,
  MARGIN_BOTTOM_MIN,
  ScreenSectionLayoutItemRequest,
  ScreenType,
  SECTION_ID_MAX_LENGTH,
  SectionType
} from '@/types/screenSectionLayout';
import {findSectionTypeMeta, getSectionTypes} from '@/constants/screenSectionLayout';

/** 섹션별 검증 오류. key는 섹션 목록의 인덱스입니다. */
export interface SectionLayoutValidationResult {
  /** 목록 전체에 대한 오류 메시지 (필수 섹션 누락 등) */
  formErrors: string[];
  /** 인덱스별 오류 메시지 */
  itemErrors: Record<number, string>;
  isValid: boolean;
}

export const validateSectionLayouts = (
  screenType: ScreenType,
  sections: ScreenSectionLayoutItemRequest[]
): SectionLayoutValidationResult => {
  const formErrors: string[] = [];
  const itemErrors: Record<number, string> = {};

  const sectionTypes = getSectionTypes(screenType);
  if (sectionTypes.length === 0) {
    formErrors.push('섹션 목록이 정의되지 않은 화면입니다. 레이아웃을 저장할 수 없습니다.');
    return {formErrors, itemErrors, isValid: false};
  }

  if (sections.length === 0) {
    formErrors.push('섹션을 1개 이상 추가해주세요.');
  }

  // sectionId 중복 검사 (화면 내 유일해야 합니다)
  const sectionIdCounts = new Map<string, number>();
  sections.forEach(({sectionId}) => {
    const trimmed = sectionId.trim();
    if (!trimmed) return;
    sectionIdCounts.set(trimmed, (sectionIdCounts.get(trimmed) ?? 0) + 1);
  });

  // 중복 불가 섹션의 다중 등록 검사
  const sectionTypeCounts = new Map<string, number>();
  sections.forEach(({sectionType}) => {
    sectionTypeCounts.set(sectionType, (sectionTypeCounts.get(sectionType) ?? 0) + 1);
  });

  sections.forEach((section, index) => {
    const meta = findSectionTypeMeta(screenType, section.sectionType);
    const sectionId = section.sectionId.trim();

    if (!meta) {
      itemErrors[index] = '이 화면에서 사용할 수 없는 섹션입니다.';
      return;
    }

    if (!meta.isConfigurable) {
      itemErrors[index] = `${meta.label} 섹션은 어드민에서 설정할 수 없습니다.`;
      return;
    }

    if (!sectionId) {
      itemErrors[index] = '섹션 식별자를 입력해주세요.';
      return;
    }

    if (sectionId.length > SECTION_ID_MAX_LENGTH) {
      itemErrors[index] = `섹션 식별자는 최대 ${SECTION_ID_MAX_LENGTH}자까지 입력할 수 있습니다.`;
      return;
    }

    if ((sectionIdCounts.get(sectionId) ?? 0) > 1) {
      itemErrors[index] = '섹션 식별자가 다른 섹션과 중복됩니다.';
      return;
    }

    if (!meta.allowsMultiple && (sectionTypeCounts.get(section.sectionType) ?? 0) > 1) {
      itemErrors[index] = `${meta.label} 섹션은 한 번만 추가할 수 있습니다.`;
      return;
    }

    if (!Number.isInteger(section.marginBottom)
      || section.marginBottom < MARGIN_BOTTOM_MIN
      || section.marginBottom > MARGIN_BOTTOM_MAX) {
      itemErrors[index] = `하단 여백은 ${MARGIN_BOTTOM_MIN} ~ ${MARGIN_BOTTOM_MAX} 사이의 정수여야 합니다.`;
    }
  });

  // 필수 섹션은 반드시 isVisible=true로 포함되어야 합니다.
  sectionTypes
    .filter((meta) => meta.isRequired)
    .forEach((meta) => {
      const included = sections.some(
        (section) => section.sectionType === meta.value && section.isVisible
      );
      if (!included) {
        formErrors.push(`${meta.label}(${meta.value}) 섹션은 반드시 노출 상태로 포함되어야 합니다.`);
      }
    });

  return {
    formErrors,
    itemErrors,
    isValid: formErrors.length === 0 && Object.keys(itemErrors).length === 0,
  };
};

/**
 * 섹션 추가 시 사용할 기본 sectionId를 만듭니다.
 *
 * 중복 등록이 불가능한 섹션은 sectionType과 같은 값을 쓰고,
 * AD_MOB처럼 여러 번 넣는 섹션은 뒤에 일련번호를 붙여 서로 다른 값이 되게 합니다.
 */
export const buildDefaultSectionId = (
  sectionType: SectionType,
  usedSectionIds: string[]
): string => {
  const used = new Set(usedSectionIds);
  if (!used.has(sectionType)) {
    return sectionType;
  }

  let index = 2;
  while (used.has(`${sectionType}_${index}`)) {
    index += 1;
  }
  return `${sectionType}_${index}`;
};
