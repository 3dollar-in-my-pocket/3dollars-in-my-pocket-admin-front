import {ScreenType, ScreenTypeMeta, SectionType, SectionTypeMeta} from '@/types/screenSectionLayout';

/** 메타데이터 조회 전 초기 상태에서 사용하는 화면 코드입니다. */
export const DEFAULT_SCREEN_TYPE: ScreenType = 'STORE_DETAIL';

/** 서버에서 조회한 화면 메타데이터에서 화면을 찾습니다. */
export const findScreenTypeMeta = (
  screens: ScreenTypeMeta[],
  screenType: ScreenType
): ScreenTypeMeta | undefined => screens.find((screen) => screen.value === screenType);

/** 서버에서 조회한 섹션 메타데이터에서 섹션을 찾습니다. */
export const findSectionTypeMeta = (
  sectionTypes: SectionTypeMeta[],
  sectionType: SectionType
): SectionTypeMeta | undefined => sectionTypes.find((section) => section.value === sectionType);

export const getSectionTypeLabel = (
  sectionTypes: SectionTypeMeta[],
  sectionType: SectionType
): string => findSectionTypeMeta(sectionTypes, sectionType)?.label ?? sectionType;

export const getConfigurableSectionTypes = (sectionTypes: SectionTypeMeta[]): SectionTypeMeta[] =>
  sectionTypes.filter((section) => section.isConfigurable);

export const getConfigField = (
  meta: SectionTypeMeta | undefined,
  configType: string,
  fieldName: string
) => meta?.configs
  ?.find((config) => config.type === configType)
  ?.fields.find((field) => field.name === fieldName);
