import {describe, expect, it} from 'vitest';
import {ScreenSectionLayoutItemRequest} from '@/types/screenSectionLayout';
import {buildDefaultSectionId, validateSectionLayouts} from './screenSectionLayoutValidation';

/** 필수 섹션만 포함한 최소 유효 목록 */
const requiredSections = (): ScreenSectionLayoutItemRequest[] => [
  {sectionType: 'PREVIEW', sectionId: 'PREVIEW', marginBottom: 8, isVisible: true},
  {sectionType: 'TAB', sectionId: 'TAB', marginBottom: 0, isVisible: true},
];

const validate = (sections: ScreenSectionLayoutItemRequest[]) =>
  validateSectionLayouts('STORE_DETAIL', sections);

describe('validateSectionLayouts', () => {
  it('필수 섹션이 모두 노출 상태면 통과한다', () => {
    expect(validate(requiredSections()).isValid).toBe(true);
  });

  it('섹션 목록이 정의되지 않은 화면은 저장할 수 없다', () => {
    const result = validateSectionLayouts('HOME', requiredSections());

    expect(result.isValid).toBe(false);
    expect(result.formErrors[0]).toContain('섹션 목록이 정의되지 않은 화면');
  });

  describe('필수 섹션', () => {
    it('누락되면 실패한다', () => {
      const result = validate([requiredSections()[0]]);

      expect(result.isValid).toBe(false);
      expect(result.formErrors.some((error) => error.includes('TAB'))).toBe(true);
    });

    it('미노출로 보내면 실패한다', () => {
      const sections = requiredSections();
      sections[1].isVisible = false;
      const result = validate(sections);

      expect(result.isValid).toBe(false);
      expect(result.formErrors.some((error) => error.includes('TAB'))).toBe(true);
    });
  });

  describe('sectionId', () => {
    it('중복되면 해당 항목들이 실패한다', () => {
      const result = validate([
        ...requiredSections(),
        {sectionType: 'AD_MOB', sectionId: 'AD_MOB', marginBottom: 0, isVisible: true},
        {sectionType: 'AD_MOB', sectionId: 'AD_MOB', marginBottom: 0, isVisible: true},
      ]);

      expect(result.isValid).toBe(false);
      expect(result.itemErrors[2]).toBe('섹션 식별자가 다른 섹션과 중복됩니다.');
      expect(result.itemErrors[3]).toBe('섹션 식별자가 다른 섹션과 중복됩니다.');
    });

    it('비어 있으면 실패한다', () => {
      const result = validate([
        ...requiredSections(),
        {sectionType: 'COUPON', sectionId: '   ', marginBottom: 0, isVisible: true},
      ]);

      expect(result.itemErrors[2]).toBe('섹션 식별자를 입력해주세요.');
    });

    it('100자를 넘으면 실패한다', () => {
      const result = validate([
        ...requiredSections(),
        {sectionType: 'COUPON', sectionId: 'A'.repeat(101), marginBottom: 0, isVisible: true},
      ]);

      expect(result.itemErrors[2]).toContain('최대 100자');
    });
  });

  describe('중복 등록', () => {
    it('AD_MOB은 sectionId가 다르면 여러 번 넣을 수 있다', () => {
      const result = validate([
        ...requiredSections(),
        {sectionType: 'AD_MOB', sectionId: 'AD_MOB_TOP', marginBottom: 8, isVisible: true},
        {sectionType: 'AD_MOB', sectionId: 'AD_MOB_BOTTOM', marginBottom: 8, isVisible: true},
      ]);

      expect(result.isValid).toBe(true);
    });

    it('중복 불가 섹션을 2번 넣으면 실패한다', () => {
      const result = validate([
        ...requiredSections(),
        {sectionType: 'COUPON', sectionId: 'COUPON', marginBottom: 0, isVisible: true},
        {sectionType: 'COUPON', sectionId: 'COUPON_2', marginBottom: 0, isVisible: true},
      ]);

      expect(result.isValid).toBe(false);
      expect(result.itemErrors[2]).toContain('한 번만 추가할 수 있습니다');
    });
  });

  it('설정 불가 섹션(MARGIN)은 포함할 수 없다', () => {
    const result = validate([
      ...requiredSections(),
      {sectionType: 'MARGIN', sectionId: 'MARGIN', marginBottom: 0, isVisible: true},
    ]);

    expect(result.isValid).toBe(false);
    expect(result.itemErrors[2]).toContain('설정할 수 없습니다');
  });

  describe('marginBottom', () => {
    const withMargin = (marginBottom: number) => validate([
      ...requiredSections(),
      {sectionType: 'COUPON', sectionId: 'COUPON', marginBottom, isVisible: true},
    ]);

    // 경계값: 0 ~ 100까지 허용
    it('0과 100은 통과한다', () => {
      expect(withMargin(0).isValid).toBe(true);
      expect(withMargin(100).isValid).toBe(true);
    });

    it('범위를 벗어나면 실패한다', () => {
      expect(withMargin(-1).itemErrors[2]).toContain('0 ~ 100');
      expect(withMargin(101).itemErrors[2]).toContain('0 ~ 100');
    });

    it('정수가 아니면 실패한다', () => {
      expect(withMargin(8.5).itemErrors[2]).toContain('정수');
    });
  });

  it('섹션이 하나도 없으면 실패한다', () => {
    const result = validate([]);

    expect(result.isValid).toBe(false);
    expect(result.formErrors).toContain('섹션을 1개 이상 추가해주세요.');
  });
});

describe('buildDefaultSectionId', () => {
  it('사용 중이 아니면 sectionType을 그대로 쓴다', () => {
    expect(buildDefaultSectionId('COUPON', [])).toBe('COUPON');
  });

  it('이미 사용 중이면 일련번호를 붙인다', () => {
    expect(buildDefaultSectionId('AD_MOB', ['AD_MOB'])).toBe('AD_MOB_2');
  });

  it('일련번호도 사용 중이면 빈 번호를 찾는다', () => {
    expect(buildDefaultSectionId('AD_MOB', ['AD_MOB', 'AD_MOB_2', 'AD_MOB_3'])).toBe('AD_MOB_4');
  });
});
