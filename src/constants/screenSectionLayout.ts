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

type FieldOptions = Pick<SectionConfigFieldMeta, 'unit' | 'presets' | 'description'>;

const integerField = (
  name: string,
  label: string,
  min: number,
  max?: number,
  options: FieldOptions = {}
): SectionConfigFieldMeta => ({
  name,
  label,
  valueType: 'INTEGER',
  isRequired: true,
  min,
  max,
  ...options,
});

const booleanField = (name: string, label: string): SectionConfigFieldMeta => ({
  name,
  label,
  valueType: 'BOOLEAN',
  isRequired: false,
});

const positionsField = (name: string, label: string): SectionConfigFieldMeta => ({
  name,
  label,
  valueType: 'INTEGER_LIST',
  isRequired: false,
  min: 1,
  maxItems: 20,
  description: '비어 있으면 미노출',
});

const positiveDecimalField = (name: string, label: string, options: FieldOptions = {}): SectionConfigFieldMeta => ({
  name,
  label,
  valueType: 'DECIMAL',
  isRequired: true,
  min: 0,
  isMinExclusive: true,
  ...options,
});

/** 광고 높이 필드. 애드몹/리스트/큐레이션 광고 모두 같은 범위와 추천값을 사용합니다. */
const adHeightField = (name: string, label: string): SectionConfigFieldMeta =>
  integerField(name, label, 50, 200, {unit: 'dp', presets: [50, 100, 150, 200]});

const EMPTY_CONFIG: SectionConfigMeta = {type: 'EMPTY', label: '추가 설정 없음', fields: []};

/**
 * 섹션 타입별로 선택할 수 있는 설정 타입과 입력 필드 정의.
 *
 * 서버의 섹션 설정 정의와 맞춰 관리합니다. 여기에 없는 섹션 타입은 EMPTY 설정만 사용합니다.
 */
export const SECTION_CONFIGS: Record<SectionType, SectionConfigMeta[]> = {
  AD_MOB: [
    {
      type: 'AD_MOB',
      label: '광고 설정',
      fields: [adHeightField('height', '광고 영역 높이')],
    },
  ],
  HOME_FILTER: [
    {
      type: 'HOME_FILTER',
      label: '홈 필터 설정',
      fields: [
        booleanField('openStatusDefaultOn', '"영업중" 필터 기본 켜기'),
        booleanField('recentActivityDefaultOn', '"최근 활동" 필터 기본 켜기'),
        booleanField('targetStoresDefaultOn', '"사장님 직영점만" 필터 기본 켜기'),
        booleanField('eventFilterVisible', '이벤트 필터 표시'),
      ],
    },
  ],
  HOME_MAP_CONTROL: [
    {
      type: 'HOME_MAP_CONTROL',
      label: '홈 지도 설정',
      fields: [positiveDecimalField('initialMapZoomLevel', '지도 시작 확대 수준')],
    },
  ],
  HOME_LIST: [
    {
      type: 'HOME_LIST',
      label: '홈 목록 설정',
      fields: [
        integerField('pageSize', '한 번에 불러올 가게 수', 1, undefined, {unit: '개'}),
        positionsField('adPositions', '목록 광고 삽입 위치'),
        adHeightField('adHeight', '목록 광고 영역 높이'),
      ],
    },
  ],
  HOME_CURATION: [
    {
      type: 'HOME_CURATION',
      label: '홈 큐레이션 설정',
      fields: [
        positionsField('carouselAdPositions', '캐러셀 광고 삽입 위치'),
        adHeightField('carouselAdHeight', '캐러셀 광고 영역 높이'),
        positionsField('cardAdPositions', '카드 광고 삽입 위치'),
        positiveDecimalField('searchStoreMaxDistanceM', '가게 검색 반경', {unit: 'm'}),
      ],
    },
  ],
};

/** 설정 타입으로 설정 정의를 찾습니다. 설정 타입은 섹션 타입 간에 겹치지 않습니다. */
export const findConfigMetaByType = (configType: string): SectionConfigMeta | undefined =>
  [EMPTY_CONFIG, ...Object.values(SECTION_CONFIGS).flat()].find((config) => config.type === configType);

/** 섹션 타입이 지원하는 설정 목록. 첫 번째 항목이 섹션 추가 시 기본 설정 타입입니다. */
export const getSectionConfigs = (sectionType: SectionType): SectionConfigMeta[] =>
  SECTION_CONFIGS[sectionType] ?? [EMPTY_CONFIG];
