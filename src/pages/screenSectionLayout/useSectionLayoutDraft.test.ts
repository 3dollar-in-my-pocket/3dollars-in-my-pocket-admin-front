import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {ScreenSectionLayout} from '@/types/screenSectionLayout';
import useSectionLayoutDraft from './useSectionLayoutDraft';

const layout = (
  id: number,
  sectionType: ScreenSectionLayout['sectionType'],
  sectionId: string,
  displayOrder: number
): ScreenSectionLayout => ({
  id,
  screenType: 'STORE_DETAIL',
  sectionType,
  sectionId,
  displayOrder,
  marginBottom: 0,
  isVisible: true,
  createdAt: '2026-09-19T10:00:00',
  updatedAt: '2026-09-19T10:00:00',
});

/** PREVIEW > TAB > COUPON 순서의 기본 목록 */
const initialLayouts = (): ScreenSectionLayout[] => [
  layout(1, 'PREVIEW', 'PREVIEW', 100),
  layout(2, 'TAB', 'TAB', 200),
  layout(3, 'COUPON', 'COUPON', 300),
];

const renderDraft = (layouts = initialLayouts()) => {
  const hook = renderHook(() => useSectionLayoutDraft());
  act(() => hook.result.current.reset(layouts));
  return hook;
};

const sectionIds = (result: { current: ReturnType<typeof useSectionLayoutDraft> }) =>
  result.current.sections.map((section) => section.sectionId);

describe('useSectionLayoutDraft', () => {
  describe('reset', () => {
    it('displayOrder 순으로 정렬한다', () => {
      const {result} = renderDraft([
        layout(3, 'COUPON', 'COUPON', 300),
        layout(1, 'PREVIEW', 'PREVIEW', 100),
        layout(2, 'TAB', 'TAB', 200),
      ]);

      expect(sectionIds(result)).toEqual(['PREVIEW', 'TAB', 'COUPON']);
    });

    it('초기화 직후에는 변경 사항이 없다', () => {
      const {result} = renderDraft();

      expect(result.current.isDirty).toBe(false);
    });

    it('섹션마다 고유한 key를 부여한다', () => {
      const {result} = renderDraft();
      const keys = result.current.sections.map((section) => section.key);

      expect(new Set(keys).size).toBe(keys.length);
    });
  });

  describe('moveSection', () => {
    it('위로 이동한다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSection(2, 1));

      expect(sectionIds(result)).toEqual(['PREVIEW', 'COUPON', 'TAB']);
      expect(result.current.isDirty).toBe(true);
    });

    it('아래로 이동한다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSection(0, 1));

      expect(sectionIds(result)).toEqual(['TAB', 'PREVIEW', 'COUPON']);
    });

    it('범위를 벗어난 목적지는 양끝으로 보정한다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSection(0, 99));

      expect(sectionIds(result)).toEqual(['TAB', 'COUPON', 'PREVIEW']);
    });

    it('제자리 이동은 변경으로 보지 않는다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSection(1, 1));

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('moveSectionTo', () => {
    it('대상 앞에 끼워 넣는다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSectionTo(2, 0, 'before'));

      expect(sectionIds(result)).toEqual(['COUPON', 'PREVIEW', 'TAB']);
    });

    it('대상 뒤에 끼워 넣는다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSectionTo(0, 2, 'after'));

      expect(sectionIds(result)).toEqual(['TAB', 'COUPON', 'PREVIEW']);
    });

    // 뒤쪽으로 옮길 때는 원본을 들어낸 만큼 인덱스가 당겨져야 한다
    it('바로 다음 항목 뒤로 옮기면 한 칸만 내려간다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSectionTo(0, 1, 'after'));

      expect(sectionIds(result)).toEqual(['TAB', 'PREVIEW', 'COUPON']);
    });

    it('자기 자신 위치로 떨어뜨리면 순서가 유지된다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSectionTo(1, 1, 'before'));

      expect(sectionIds(result)).toEqual(['PREVIEW', 'TAB', 'COUPON']);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('addSection', () => {
    it('목록 끝에 추가하고 sectionType을 sectionId로 쓴다', () => {
      const {result} = renderDraft();
      act(() => result.current.addSection('AD_MOB'));

      expect(sectionIds(result)).toEqual(['PREVIEW', 'TAB', 'COUPON', 'AD_MOB']);
      expect(result.current.sections[3].isVisible).toBe(true);
      expect(result.current.sections[3].marginBottom).toBe(0);
    });

    it('sectionId가 겹치면 일련번호를 붙인다', () => {
      const {result} = renderDraft();
      act(() => result.current.addSection('AD_MOB'));
      act(() => result.current.addSection('AD_MOB'));

      expect(sectionIds(result)).toEqual(['PREVIEW', 'TAB', 'COUPON', 'AD_MOB', 'AD_MOB_2']);
    });
  });

  describe('removeSection / updateSection', () => {
    it('해당 인덱스를 제거한다', () => {
      const {result} = renderDraft();
      act(() => result.current.removeSection(1));

      expect(sectionIds(result)).toEqual(['PREVIEW', 'COUPON']);
    });

    it('일부 필드만 수정한다', () => {
      const {result} = renderDraft();
      act(() => result.current.updateSection(0, {marginBottom: 16}));

      expect(result.current.sections[0].marginBottom).toBe(16);
      expect(result.current.sections[0].sectionId).toBe('PREVIEW');
      expect(result.current.isDirty).toBe(true);
    });

    it('sectionId 앞뒤 공백만 바뀐 것은 변경으로 보지 않는다', () => {
      const {result} = renderDraft();
      act(() => result.current.updateSection(0, {sectionId: '  PREVIEW  '}));

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('toRequest', () => {
    it('배열 순서대로 displayOrder 없이 변환한다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSection(2, 0));

      expect(result.current.toRequest()).toEqual([
        {sectionType: 'COUPON', sectionId: 'COUPON', marginBottom: 0, isVisible: true},
        {sectionType: 'PREVIEW', sectionId: 'PREVIEW', marginBottom: 0, isVisible: true},
        {sectionType: 'TAB', sectionId: 'TAB', marginBottom: 0, isVisible: true},
      ]);
    });

    it('sectionId 앞뒤 공백을 제거한다', () => {
      const {result} = renderDraft();
      act(() => result.current.updateSection(0, {sectionId: '  PREVIEW  '}));

      expect(result.current.toRequest()[0].sectionId).toBe('PREVIEW');
    });
  });

  describe('markSaved', () => {
    it('저장 응답을 새 기준선으로 삼아 변경 표시를 해제한다', () => {
      const {result} = renderDraft();
      act(() => result.current.moveSection(2, 0));
      expect(result.current.isDirty).toBe(true);

      act(() => result.current.markSaved([
        layout(3, 'COUPON', 'COUPON', 100),
        layout(1, 'PREVIEW', 'PREVIEW', 200),
        layout(2, 'TAB', 'TAB', 300),
      ]));

      expect(result.current.isDirty).toBe(false);
      expect(sectionIds(result)).toEqual(['COUPON', 'PREVIEW', 'TAB']);
    });
  });
});
