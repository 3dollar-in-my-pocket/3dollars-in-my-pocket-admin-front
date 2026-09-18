import {describe, expect, it} from 'vitest';
import {SectionLayoutDraft} from './useSectionLayoutDraft';
import {diffSectionLayouts} from './sectionLayoutDiff';

const draft = (
  sectionType: SectionLayoutDraft['sectionType'],
  sectionId: string,
  overrides: Partial<SectionLayoutDraft> = {}
): SectionLayoutDraft => ({
  key: `key-${sectionId}`,
  sectionType,
  sectionId,
  marginBottom: 0,
  isVisible: true,
  ...overrides,
});

/** PREVIEW > TAB > COUPON 순서의 저장된 상태 */
const saved = (): SectionLayoutDraft[] => [
  draft('PREVIEW', 'PREVIEW', {marginBottom: 8}),
  draft('TAB', 'TAB'),
  draft('COUPON', 'COUPON', {marginBottom: 16}),
];

const findEntry = (entries: ReturnType<typeof diffSectionLayouts>['entries'], sectionId: string) =>
  entries.find((entry) => entry.sectionId === sectionId);

describe('diffSectionLayouts', () => {
  it('변경이 없으면 hasChanges가 false다', () => {
    const diff = diffSectionLayouts(saved(), saved());

    expect(diff.hasChanges).toBe(false);
    expect(diff.entries.every((entry) => entry.status === 'unchanged')).toBe(true);
  });

  it('추가된 섹션을 added로 표시한다', () => {
    const diff = diffSectionLayouts(saved(), [...saved(), draft('REVIEW', 'REVIEW')]);

    expect(diff.addedCount).toBe(1);
    const entry = findEntry(diff.entries, 'REVIEW');
    expect(entry?.status).toBe('added');
    expect(entry?.beforeOrder).toBeNull();
    expect(entry?.afterOrder).toBe(4);
  });

  it('빠진 섹션을 removed로 표시한다', () => {
    const diff = diffSectionLayouts(saved(), saved().slice(0, 2));

    expect(diff.removedCount).toBe(1);
    const entry = findEntry(diff.entries, 'COUPON');
    expect(entry?.status).toBe('removed');
    expect(entry?.beforeOrder).toBe(3);
    expect(entry?.afterOrder).toBeNull();
  });

  it('순서만 바뀌면 moved로 표시하고 전/후 순서를 담는다', () => {
    const after = saved();
    const [coupon] = after.splice(2, 1);
    after.unshift(coupon);

    const diff = diffSectionLayouts(saved(), after);

    expect(diff.movedCount).toBe(3);
    const entry = findEntry(diff.entries, 'COUPON');
    expect(entry?.status).toBe('moved');
    expect(entry?.beforeOrder).toBe(3);
    expect(entry?.afterOrder).toBe(1);
  });

  describe('값 변경', () => {
    it('하단 여백 변경을 updated로 표시한다', () => {
      const after = saved();
      after[0] = {...after[0], marginBottom: 24};

      const diff = diffSectionLayouts(saved(), after);
      const entry = findEntry(diff.entries, 'PREVIEW');

      expect(diff.updatedCount).toBe(1);
      expect(entry?.status).toBe('updated');
      expect(entry?.changes).toEqual([{label: '하단 여백', before: '8', after: '24'}]);
    });

    it('노출 여부 변경을 한국어로 표시한다', () => {
      const after = saved();
      after[2] = {...after[2], isVisible: false};

      const diff = diffSectionLayouts(saved(), after);
      const entry = findEntry(diff.entries, 'COUPON');

      expect(entry?.changes).toEqual([{label: '노출 여부', before: '노출', after: '미노출'}]);
    });

    it('여러 필드가 바뀌면 모두 담는다', () => {
      const after = saved();
      after[0] = {...after[0], marginBottom: 0, isVisible: false};

      const diff = diffSectionLayouts(saved(), after);
      const entry = findEntry(diff.entries, 'PREVIEW');

      expect(entry?.changes).toHaveLength(2);
    });
  });

  // 서버가 sectionId로 레코드를 매칭하므로 ID 변경은 삭제 + 재생성이다
  it('sectionId를 바꾸면 삭제와 추가로 표시한다', () => {
    const after = saved();
    after[2] = {...after[2], sectionId: 'COUPON_NEW'};

    const diff = diffSectionLayouts(saved(), after);

    expect(findEntry(diff.entries, 'COUPON')?.status).toBe('removed');
    expect(findEntry(diff.entries, 'COUPON_NEW')?.status).toBe('added');
    expect(diff.removedCount).toBe(1);
    expect(diff.addedCount).toBe(1);
  });

  it('sectionId 앞뒤 공백은 같은 섹션으로 본다', () => {
    const after = saved();
    after[0] = {...after[0], sectionId: '  PREVIEW  '};

    const diff = diffSectionLayouts(saved(), after);

    expect(diff.hasChanges).toBe(false);
  });

  it('삭제 항목을 목록 뒤로 모은다', () => {
    const after = [draft('TAB', 'TAB'), draft('PREVIEW', 'PREVIEW', {marginBottom: 8})];
    const diff = diffSectionLayouts(saved(), after);

    expect(diff.entries[diff.entries.length - 1].sectionId).toBe('COUPON');
  });

  it('저장된 상태가 비어 있으면 모두 추가로 본다', () => {
    const diff = diffSectionLayouts([], saved());

    expect(diff.addedCount).toBe(3);
    expect(diff.removedCount).toBe(0);
    expect(diff.hasChanges).toBe(true);
  });
});
