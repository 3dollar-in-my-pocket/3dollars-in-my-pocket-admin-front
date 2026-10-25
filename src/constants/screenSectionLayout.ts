import {
  ScreenType,
  ScreenTypeMeta,
  SectionConfigFieldMeta,
  SectionConfigMeta,
  SectionConfigOption,
  SectionType,
  SectionTypeMeta,
  SectionVisibilityCondition,
  SectionVisibilityConditionType
} from '@/types/screenSectionLayout';

export interface ScreenApplicationOption {
  value: string;
  label: string;
  /** false면 탭은 보이지만 선택할 수 없습니다. */
  enabled: boolean;
}

/** UI 구성 관리 대상 앱. 사장님앱은 서버 준비 전까지 비활성 상태로 둡니다. */
export const SCREEN_APPLICATIONS: ScreenApplicationOption[] = [
  {value: 'USER', label: '유저앱', enabled: true},
  {value: 'BOSS', label: '사장님앱', enabled: false},
];

export const DEFAULT_SCREEN_APPLICATION = 'USER';

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

/** 노출 조건 종류별 표시명. 예: "AD_1 노출 시" */
export const VISIBILITY_CONDITION_TYPE_LABELS: Record<SectionVisibilityConditionType, string> = {
  EXPOSED: '노출 시',
  NOT_EXPOSED: '미노출 시',
};

/** 전/후 비교에 표시할 노출 조건 요약. 예: "AD_1, AD_2 중 하나라도 노출 시" */
export const formatVisibilityCondition = (condition?: SectionVisibilityCondition | null): string => {
  if (!condition) return '조건 없음';
  const ids = condition.sectionIds.length > 0 ? condition.sectionIds.join(', ') : '(기준 섹션 없음)';
  if (condition.type === 'EXPOSED') {
    return condition.sectionIds.length > 1 ? `${ids} 중 하나라도 노출 시` : `${ids} 노출 시`;
  }
  return condition.sectionIds.length > 1 ? `${ids} 모두 미노출 시` : `${ids} 미노출 시`;
};

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

const stringListField = (
  name: string,
  label: string,
  options: SectionConfigOption[],
  maxItems: number,
  description?: string
): SectionConfigFieldMeta => ({
  name,
  label,
  valueType: 'STRING_LIST',
  isRequired: false,
  options,
  maxItems,
  description,
});

/**
 * 홈 큐레이션 캐러셀 ID. 서버가 목록을 내려주지 않으므로 어드민에서 관리합니다.
 * 서버에 없는 ID는 경고 로그만 남기고 무시됩니다.
 */
export const HOME_CURATION_CAROUSEL_OPTIONS: SectionConfigOption[] = [
  {value: 'POPULAR_SNACKS', label: '최근 인기 간식'},
  {value: 'TASTE_SNACKS', label: '입맛별로 찾는 간식'},
  {value: 'SNS_STORES', label: 'SNS에서 만난 가게'},
];

const positiveDecimalField = (name: string, label: string, options: FieldOptions = {}): SectionConfigFieldMeta => ({
  name,
  label,
  valueType: 'DECIMAL',
  isRequired: true,
  min: 0,
  isMinExclusive: true,
  ...options,
});

const enumField = (name: string, label: string, enumName: string): SectionConfigFieldMeta => ({
  name,
  label,
  valueType: 'ENUM',
  isRequired: true,
  enumName,
});

/** 광고 높이 필드. 애드몹/리스트/큐레이션 광고 모두 같은 범위와 추천값을 사용합니다. */
const adHeightField = (name: string, label: string): SectionConfigFieldMeta =>
  integerField(name, label, 50, 200, {unit: 'dp', presets: [50, 100, 150, 200]});

/**
 * 같은 그룹으로 묶어 표시할 필드 목록.
 * 그룹 안에서는 label만 보여주므로 label에 그룹 이름을 반복하지 않습니다. (전체 이름: getConfigFieldFullLabel)
 */
const inGroup = (group: string, fields: SectionConfigFieldMeta[]): SectionConfigFieldMeta[] =>
  fields.map((field) => ({...field, group}));

const ADVERTISEMENT_POSITIONS_DESCRIPTION = '첫 페이지에만 적용';

/** 그룹 밖(오류 메시지, 변경 비교 요약)에서 쓰는 필드 이름. 예: "카드 애드몹 삽입 위치" */
export const getConfigFieldFullLabel = (field: SectionConfigFieldMeta): string =>
  field.group ? `${field.group} ${field.label}` : field.label;

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
        ...inGroup('목록 애드몹', [
          positionsField('adPositions', '삽입 위치'),
          adHeightField('adHeight', '영역 높이'),
        ]),
        ...inGroup('목록 자체 광고', [
          {
            ...positionsField('advertisementPositions', '삽입 위치'),
            description: ADVERTISEMENT_POSITIONS_DESCRIPTION,
          },
        ]),
      ],
    },
  ],
  HOME_CURATION: [
    {
      type: 'HOME_CURATION',
      label: '홈 큐레이션 설정',
      fields: [
        positiveDecimalField('searchStoreMaxDistanceM', '가게 검색 반경', {unit: 'm'}),
        ...inGroup('캐러셀 애드몹', [
          positionsField('carouselAdPositions', '삽입 위치'),
          adHeightField('carouselAdHeight', '영역 높이'),
        ]),
        ...inGroup('카드 애드몹', [
          positionsField('cardAdPositions', '삽입 위치'),
        ]),
        ...inGroup('카드 자체 광고', [
          {
            ...positionsField('cardAdvertisementPositions', '삽입 위치'),
            description: ADVERTISEMENT_POSITIONS_DESCRIPTION,
          },
          stringListField(
            'cardAdvertisementCarouselIds',
            '적용 캐러셀',
            HOME_CURATION_CAROUSEL_OPTIONS,
            10,
            '선택한 캐러셀에만 자체 광고 노출. 비어 있으면 미노출'
          ),
        ]),
      ],
    },
  ],
  HOME_BOTTOM_SHEET_TAB: [
    {
      type: 'HOME_BOTTOM_SHEET_TAB',
      label: '홈 바텀시트 탭 설정',
      fields: [enumField('defaultSelectedTab', '기본 선택 탭', 'HomeBottomSheetTab')],
    },
  ],
};

/** 설정 필드가 선택지로 쓰는 서버 enum 이름 목록 */
export const SECTION_CONFIG_ENUM_NAMES: string[] = Array.from(new Set(
  Object.values(SECTION_CONFIGS).flat()
    .flatMap((config) => config.fields)
    .map((field) => field.enumName)
    .filter((enumName): enumName is string => Boolean(enumName))
));

/** 설정 타입으로 설정 정의를 찾습니다. 설정 타입은 섹션 타입 간에 겹치지 않습니다. */
export const findConfigMetaByType = (configType: string): SectionConfigMeta | undefined =>
  [EMPTY_CONFIG, ...Object.values(SECTION_CONFIGS).flat()].find((config) => config.type === configType);

/** 섹션 타입이 지원하는 설정 목록. 첫 번째 항목이 섹션 추가 시 기본 설정 타입입니다. */
export const getSectionConfigs = (sectionType: SectionType): SectionConfigMeta[] =>
  SECTION_CONFIGS[sectionType] ?? [EMPTY_CONFIG];
