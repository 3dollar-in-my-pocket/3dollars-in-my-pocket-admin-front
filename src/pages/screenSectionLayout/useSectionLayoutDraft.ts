import {useCallback, useMemo, useRef, useState} from 'react';
import {
  ScreenSectionLayout,
  ScreenSectionLayoutItemRequest,
  SectionType
} from '@/types/screenSectionLayout';
import {buildDefaultSectionId} from '@/utils/validation/screenSectionLayoutValidation';

/**
 * 편집 중인 섹션 한 줄.
 *
 * key는 React 렌더링 전용 식별자입니다. sectionId는 사용자가 자유롭게 바꿀 수 있어
 * 입력 도중 중복/빈 값이 될 수 있으므로 key로 쓰면 포커스가 튑니다.
 */
export interface SectionLayoutDraft {
  key: string;
  sectionType: SectionType;
  sectionId: string;
  marginBottom: number;
  isVisible: boolean;
}

/** 서버 응답을 편집용 초안으로 변환합니다. displayOrder는 배열 순서로 대체됩니다. */
const toDraft = (layout: ScreenSectionLayout, key: string): SectionLayoutDraft => ({
  key,
  sectionType: layout.sectionType,
  sectionId: layout.sectionId,
  marginBottom: layout.marginBottom,
  isVisible: layout.isVisible,
});

/** 저장 여부 비교용 스냅샷. key는 렌더링 전용이라 제외합니다. */
const toComparable = (sections: SectionLayoutDraft[]): string =>
  JSON.stringify(sections.map(({sectionType, sectionId, marginBottom, isVisible}) => ({
    sectionType,
    sectionId: sectionId.trim(),
    marginBottom,
    isVisible,
  })));

/**
 * 섹션 레이아웃 편집 상태 관리
 *
 * 전체 교체(PUT) API에 맞춰 화면 전체의 최종 상태를 로컬에서 들고 있다가 한 번에 저장합니다.
 */
export const useSectionLayoutDraft = () => {
  const [sections, setSections] = useState<SectionLayoutDraft[]>([]);
  // 마지막으로 서버와 동기화된 상태. 변경 여부 판정과 전/후 비교에 사용합니다.
  const [savedSections, setSavedSections] = useState<SectionLayoutDraft[]>([]);
  const keySeq = useRef(0);

  const nextKey = useCallback(() => {
    keySeq.current += 1;
    return `section-${keySeq.current}`;
  }, []);

  /** 서버에서 받은 목록으로 편집 상태를 초기화합니다. */
  const reset = useCallback((layouts: ScreenSectionLayout[]) => {
    // 서버가 displayOrder를 계산해 내려주지만 응답 순서를 신뢰하지 않고 명시적으로 정렬합니다.
    const ordered = [...layouts].sort((a, b) => a.displayOrder - b.displayOrder);
    const drafts = ordered.map((layout) => toDraft(layout, nextKey()));
    setSections(drafts);
    setSavedSections(drafts);
  }, [nextKey]);

  /** 저장 성공 후 현재 상태를 기준선으로 삼습니다. */
  const markSaved = useCallback((layouts: ScreenSectionLayout[]) => {
    reset(layouts);
  }, [reset]);

  const updateSection = useCallback((index: number, changes: Partial<SectionLayoutDraft>) => {
    setSections((prev) => prev.map((section, i) => (i === index ? {...section, ...changes} : section)));
  }, []);

  const removeSection = useCallback((index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addSection = useCallback((sectionType: SectionType) => {
    setSections((prev) => {
      const sectionId = buildDefaultSectionId(sectionType, prev.map((section) => section.sectionId.trim()));
      return [...prev, {key: nextKey(), sectionType, sectionId, marginBottom: 0, isVisible: true}];
    });
  }, [nextKey]);

  /** from 위치의 섹션을 to 위치로 옮깁니다. 배열 순서가 곧 노출 순서입니다. */
  const moveSection = useCallback((from: number, to: number) => {
    setSections((prev) => {
      if (from === to || from < 0 || from >= prev.length) return prev;
      const boundedTo = Math.max(0, Math.min(to, prev.length - 1));
      if (from === boundedTo) return prev;

      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(boundedTo, 0, moved);
      return next;
    });
  }, []);

  /** 드래그한 섹션을 대상 인덱스의 앞/뒤에 끼워 넣습니다. */
  const moveSectionTo = useCallback((from: number, targetIndex: number, position: 'before' | 'after') => {
    setSections((prev) => {
      if (from < 0 || from >= prev.length) return prev;

      let insertAt = targetIndex + (position === 'after' ? 1 : 0);
      // 원래 위치를 먼저 들어내므로, 뒤쪽으로 이동할 때는 인덱스가 하나 당겨집니다.
      if (from < insertAt) insertAt -= 1;
      if (from === insertAt) return prev;

      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(insertAt, next.length)), 0, moved);
      return next;
    });
  }, []);

  /** PUT 요청 본문으로 변환합니다. sectionId 앞뒤 공백은 서버 검증 전에 정리합니다. */
  const toRequest = useCallback((): ScreenSectionLayoutItemRequest[] =>
    sections.map(({sectionType, sectionId, marginBottom, isVisible}) => ({
      sectionType,
      sectionId: sectionId.trim(),
      marginBottom,
      isVisible,
    })), [sections]);

  const isDirty = useMemo(
    () => toComparable(sections) !== toComparable(savedSections),
    [sections, savedSections]
  );

  return {
    sections,
    /** 마지막으로 저장된(서버 기준) 섹션 목록. 전/후 비교의 '이전' 값입니다. */
    savedSections,
    isDirty,
    reset,
    markSaved,
    addSection,
    updateSection,
    removeSection,
    moveSection,
    moveSectionTo,
    toRequest,
  };
};

export default useSectionLayoutDraft;
