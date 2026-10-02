import {
  ScreenType,
  ScreenTypeMeta,
  SectionConfigFieldMeta,
  SectionConfigMeta,
  SectionType,
  SectionTypeMeta
} from '@/types/screenSectionLayout';

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

const integerField = (name: string, min: number, max?: number): SectionConfigFieldMeta => ({
  name,
  valueType: 'INTEGER',
  isRequired: true,
  min,
  max,
});

const booleanField = (name: string): SectionConfigFieldMeta => ({
  name,
  valueType: 'BOOLEAN',
  isRequired: false,
});

const positionsField = (name: string): SectionConfigFieldMeta => ({
  name,
  valueType: 'INTEGER_LIST',
  isRequired: false,
  min: 1,
  maxItems: 20,
  description: '광고 삽입 전 원본 항목 기준 위치입니다. 비어 있으면 광고를 노출하지 않으며, 중복은 허용하지 않습니다. 범위를 넘는 위치는 무시됩니다.',
});

const positiveDecimalField = (name: string): SectionConfigFieldMeta => ({
  name,
  valueType: 'DECIMAL',
  isRequired: true,
  min: 0,
  isMinExclusive: true,
  description: '유한한 양수만 허용합니다.',
});

const EMPTY_CONFIG: SectionConfigMeta = {type: 'EMPTY', fields: []};

/**
 * 섹션 타입별로 선택할 수 있는 설정 타입과 입력 필드 정의.
 *
 * 서버의 섹션 설정 정의와 맞춰 관리합니다. 여기에 없는 섹션 타입은 EMPTY 설정만 사용합니다.
 */
export const SECTION_CONFIGS: Record<SectionType, SectionConfigMeta[]> = {
  AD_MOB: [
    EMPTY_CONFIG,
    {type: 'AD_MOB', fields: [integerField('height', 50, 200)]},
  ],
  HOME_FILTER: [
    {
      type: 'HOME_FILTER',
      fields: [
        booleanField('openStatusDefaultOn'),
        booleanField('recentActivityDefaultOn'),
        booleanField('targetStoresDefaultOn'),
        booleanField('eventFilterVisible'),
      ],
    },
  ],
  HOME_MAP_CONTROL: [
    {type: 'HOME_MAP_CONTROL', fields: [positiveDecimalField('initialMapZoomLevel')]},
  ],
  HOME_LIST: [
    {
      type: 'HOME_LIST',
      fields: [
        integerField('pageSize', 1),
        positionsField('adPositions'),
        integerField('adHeight', 1, 200),
      ],
    },
  ],
  HOME_CURATION: [
    {
      type: 'HOME_CURATION',
      fields: [
        positionsField('sectionAdPositions'),
        integerField('sectionAdHeight', 1, 200),
        positionsField('carouselAdPositions'),
        positiveDecimalField('storeMaxDistanceM'),
      ],
    },
  ],
};

/** 섹션 타입이 지원하는 설정 목록. 첫 번째 항목이 섹션 추가 시 기본 설정 타입입니다. */
export const getSectionConfigs = (sectionType: SectionType): SectionConfigMeta[] =>
  SECTION_CONFIGS[sectionType] ?? [EMPTY_CONFIG];
