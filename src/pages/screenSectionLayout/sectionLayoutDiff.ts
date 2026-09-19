import {SectionLayoutDraft} from './useSectionLayoutDraft';

export type SectionDiffStatus = 'added' | 'removed' | 'moved' | 'updated' | 'unchanged';

/** 값이 바뀐 필드 하나 */
export interface SectionFieldChange {
  label: string;
  before: string;
  after: string;
}

/** 섹션 한 건의 전/후 비교 결과 */
export interface SectionDiffEntry {
  sectionId: string;
  sectionType: string;
  status: SectionDiffStatus;
  /** 1-based 노출 순서. 추가된 섹션은 before가, 삭제된 섹션은 after가 null입니다. */
  beforeOrder: number | null;
  afterOrder: number | null;
  changes: SectionFieldChange[];
}

export interface SectionLayoutDiff {
  entries: SectionDiffEntry[];
  addedCount: number;
  removedCount: number;
  movedCount: number;
  updatedCount: number;
  /** 실제로 달라진 항목이 하나라도 있는지 여부 */
  hasChanges: boolean;
}

const formatVisible = (isVisible: boolean) => (isVisible ? '노출' : '미노출');

/** sectionId를 키로 정규화합니다. 서버도 이 값으로 기존 레코드를 재사용/삭제합니다. */
const keyOf = (section: SectionLayoutDraft) => section.sectionId.trim();

/**
 * 저장된 상태와 편집 중인 상태를 비교합니다.
 *
 * 서버가 sectionId로 레코드를 매칭해 재사용/삭제하므로 비교도 sectionId 기준으로 합니다.
 * sectionId를 바꾸면 서버에서는 삭제 후 재생성이라, 여기서도 삭제 + 추가로 표시됩니다.
 */
export const diffSectionLayouts = (
  before: SectionLayoutDraft[],
  after: SectionLayoutDraft[]
): SectionLayoutDiff => {
  const beforeByKey = new Map(before.map((section, index) => [keyOf(section), {section, index}]));
  const afterByKey = new Map(after.map((section, index) => [keyOf(section), {section, index}]));

  const entries: SectionDiffEntry[] = [];

  // 편집 후 목록을 기준으로 추가/이동/수정 여부를 판단합니다.
  after.forEach((section, index) => {
    const key = keyOf(section);
    const previous = beforeByKey.get(key);

    if (!previous) {
      entries.push({
        sectionId: key,
        sectionType: section.sectionType,
        status: 'added',
        beforeOrder: null,
        afterOrder: index + 1,
        changes: [],
      });
      return;
    }

    const changes: SectionFieldChange[] = [];
    if (previous.section.marginBottom !== section.marginBottom) {
      changes.push({
        label: '하단 여백',
        before: String(previous.section.marginBottom),
        after: String(section.marginBottom),
      });
    }
    if (previous.section.isVisible !== section.isVisible) {
      changes.push({
        label: '노출 여부',
        before: formatVisible(previous.section.isVisible),
        after: formatVisible(section.isVisible),
      });
    }
    // sectionType은 UI에서 바꿀 수 없지만, 같은 sectionId를 다른 타입으로 재사용한 경우를 대비해 비교합니다.
    if (previous.section.sectionType !== section.sectionType) {
      changes.push({
        label: '섹션 타입',
        before: previous.section.sectionType,
        after: section.sectionType,
      });
    }

    const moved = previous.index !== index;
    const status: SectionDiffStatus = changes.length > 0
      ? 'updated'
      : moved ? 'moved' : 'unchanged';

    entries.push({
      sectionId: key,
      sectionType: section.sectionType,
      status,
      beforeOrder: previous.index + 1,
      afterOrder: index + 1,
      changes,
    });
  });

  // 편집 후 목록에 없는 섹션은 저장 시 삭제됩니다.
  before.forEach((section, index) => {
    const key = keyOf(section);
    if (afterByKey.has(key)) return;

    entries.push({
      sectionId: key,
      sectionType: section.sectionType,
      status: 'removed',
      beforeOrder: index + 1,
      afterOrder: null,
      changes: [],
    });
  });

  // 삭제 항목은 원래 순서를 알 수 있게 뒤로 모으고, 나머지는 편집 후 순서대로 보여줍니다.
  entries.sort((a, b) => {
    if (a.afterOrder === null && b.afterOrder === null) {
      return (a.beforeOrder ?? 0) - (b.beforeOrder ?? 0);
    }
    if (a.afterOrder === null) return 1;
    if (b.afterOrder === null) return -1;
    return a.afterOrder - b.afterOrder;
  });

  const countBy = (status: SectionDiffStatus) =>
    entries.filter((entry) => entry.status === status).length;

  const addedCount = countBy('added');
  const removedCount = countBy('removed');
  const movedCount = countBy('moved');
  const updatedCount = countBy('updated');

  return {
    entries,
    addedCount,
    removedCount,
    movedCount,
    updatedCount,
    hasChanges: addedCount + removedCount + movedCount + updatedCount > 0,
  };
};
