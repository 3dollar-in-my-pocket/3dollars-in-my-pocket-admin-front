import {describe, expect, it} from 'vitest';
import {
  AD_BODY_SUFFIX,
  AD_TITLE_PREFIX,
  addUserToTarget,
  applyAdBodySuffix,
  applyAdTitlePrefix,
  checkAdNotice,
  formatAccountIds,
  hasAdBodySuffix,
  hasAdTitlePrefix,
  isMarketingPush,
  isUserInTarget,
  parseAccountIds,
  PushFormData,
  removeUserFromTarget,
  stripAdBodySuffix,
  stripAdTitlePrefix,
  validatePushData
} from './pushUtils';

/** 유효한 푸시 폼 입력. 개별 케이스에서 필요한 항목만 덮어씁니다. */
const validForm = (overrides: Partial<PushFormData> = {}): PushFormData => ({
  accountIdsInput: '1, 2',
  title: '새 소식',
  body: '내용입니다',
  path: '/home',
  pushType: 'SIMPLE',
  ...overrides
});

describe('광고성 푸시 법정 표기', () => {
  describe('isMarketingPush', () => {
    it('SIMPLE_MARKETING이면 광고성으로 본다', () => {
      expect(isMarketingPush('SIMPLE_MARKETING')).toBe(true);
    });

    it('그 외 타입은 광고성이 아니다', () => {
      expect(isMarketingPush('SIMPLE')).toBe(false);
      expect(isMarketingPush('')).toBe(false);
    });
  });

  describe('hasAdTitlePrefix / hasAdBodySuffix', () => {
    it('접두어와 접미어를 인식한다', () => {
      expect(hasAdTitlePrefix(`${AD_TITLE_PREFIX} 할인 안내`)).toBe(true);
      expect(hasAdBodySuffix(`할인 중입니다\n${AD_BODY_SUFFIX}`)).toBe(true);
    });

    it('앞뒤 공백이 있어도 인식한다', () => {
      expect(hasAdTitlePrefix(`  ${AD_TITLE_PREFIX} 할인`)).toBe(true);
      expect(hasAdBodySuffix(`내용 ${AD_BODY_SUFFIX}  `)).toBe(true);
    });

    it('표기가 없으면 false를 반환한다', () => {
      expect(hasAdTitlePrefix('할인 안내')).toBe(false);
      expect(hasAdBodySuffix('할인 중입니다')).toBe(false);
    });
  });

  describe('applyAdTitlePrefix', () => {
    it('접두어를 붙인다', () => {
      expect(applyAdTitlePrefix('할인 안내')).toBe(`${AD_TITLE_PREFIX} 할인 안내`);
    });

    it('이미 있으면 중복으로 붙이지 않는다', () => {
      const applied = `${AD_TITLE_PREFIX} 할인 안내`;
      expect(applyAdTitlePrefix(applied)).toBe(applied);
    });

    it('빈 문자열이면 접두어만 남긴다', () => {
      expect(applyAdTitlePrefix('')).toBe(`${AD_TITLE_PREFIX} `);
      expect(applyAdTitlePrefix('   ')).toBe(`${AD_TITLE_PREFIX} `);
    });
  });

  describe('applyAdBodySuffix', () => {
    it('접미어를 줄바꿈과 함께 붙인다', () => {
      expect(applyAdBodySuffix('할인 중입니다')).toBe(`할인 중입니다\n${AD_BODY_SUFFIX}`);
    });

    it('이미 있으면 중복으로 붙이지 않는다', () => {
      const applied = `할인 중입니다\n${AD_BODY_SUFFIX}`;
      expect(applyAdBodySuffix(applied)).toBe(applied);
    });

    it('빈 문자열이면 접미어만 남긴다', () => {
      expect(applyAdBodySuffix('')).toBe(AD_BODY_SUFFIX);
    });
  });

  describe('strip 후 apply 왕복', () => {
    it('제목은 원래 값으로 돌아온다', () => {
      const applied = applyAdTitlePrefix('할인 안내');
      expect(stripAdTitlePrefix(applied)).toBe('할인 안내');
    });

    it('본문은 원래 값으로 돌아온다', () => {
      const applied = applyAdBodySuffix('할인 중입니다');
      expect(stripAdBodySuffix(applied)).toBe('할인 중입니다');
    });

    it('표기가 없는 값에 strip을 적용해도 그대로 유지된다', () => {
      expect(stripAdTitlePrefix('할인 안내')).toBe('할인 안내');
      expect(stripAdBodySuffix('할인 중입니다')).toBe('할인 중입니다');
    });
  });

  describe('checkAdNotice', () => {
    it('광고성이 아니면 누락으로 보지 않는다', () => {
      expect(checkAdNotice('SIMPLE', '할인 안내', '할인 중입니다')).toEqual({
        missingTitlePrefix: false,
        missingBodySuffix: false,
        hasMissing: false
      });
    });

    it('광고성인데 표기가 없으면 누락으로 본다', () => {
      const status = checkAdNotice('SIMPLE_MARKETING', '할인 안내', '할인 중입니다');

      expect(status.missingTitlePrefix).toBe(true);
      expect(status.missingBodySuffix).toBe(true);
      expect(status.hasMissing).toBe(true);
    });

    it('표기를 모두 갖추면 누락이 없다', () => {
      const status = checkAdNotice(
        'SIMPLE_MARKETING',
        applyAdTitlePrefix('할인 안내'),
        applyAdBodySuffix('할인 중입니다')
      );

      expect(status.hasMissing).toBe(false);
    });

    // 제목/내용은 둘 중 하나만 입력해도 발송 가능하므로 빈 항목은 누락이 아니다
    it('비어 있는 항목은 누락으로 보지 않는다', () => {
      const status = checkAdNotice('SIMPLE_MARKETING', '', applyAdBodySuffix('할인 중입니다'));

      expect(status.missingTitlePrefix).toBe(false);
      expect(status.missingBodySuffix).toBe(false);
      expect(status.hasMissing).toBe(false);
    });

    it('한쪽만 누락이면 그 항목만 표시한다', () => {
      const status = checkAdNotice('SIMPLE_MARKETING', applyAdTitlePrefix('할인'), '할인 중입니다');

      expect(status.missingTitlePrefix).toBe(false);
      expect(status.missingBodySuffix).toBe(true);
      expect(status.hasMissing).toBe(true);
    });
  });
});

describe('발송 대상 ID 처리', () => {
  describe('parseAccountIds', () => {
    it('쉼표로 구분된 ID를 공백 제거하여 배열로 만든다', () => {
      expect(parseAccountIds('1, 2 ,3')).toEqual(['1', '2', '3']);
    });

    it('빈 항목은 걸러낸다', () => {
      expect(parseAccountIds('1,,2,  ,3')).toEqual(['1', '2', '3']);
    });

    it('빈 문자열이면 빈 배열을 반환한다', () => {
      expect(parseAccountIds('')).toEqual([]);
      expect(parseAccountIds('   ')).toEqual([]);
    });
  });

  describe('formatAccountIds', () => {
    it('쉼표와 공백으로 이어 붙인다', () => {
      expect(formatAccountIds(['1', '2', '3'])).toBe('1, 2, 3');
    });

    it('빈 배열이면 빈 문자열을 반환한다', () => {
      expect(formatAccountIds([])).toBe('');
    });
  });

  describe('addUserToTarget', () => {
    it('없는 ID를 추가한다', () => {
      expect(addUserToTarget('1, 2', 3)).toBe('1, 2, 3');
    });

    it('빈 목록에 추가한다', () => {
      expect(addUserToTarget('', 1)).toBe('1');
    });

    it('이미 있는 ID는 중복 추가하지 않고 원본을 유지한다', () => {
      expect(addUserToTarget('1, 2', 2)).toBe('1, 2');
    });

    it('숫자와 문자열 ID를 같은 값으로 취급한다', () => {
      expect(addUserToTarget('1, 2', '2')).toBe('1, 2');
    });
  });

  describe('removeUserFromTarget', () => {
    it('해당 ID만 제거한다', () => {
      expect(removeUserFromTarget('1, 2, 3', 2)).toBe('1, 3');
    });

    it('없는 ID를 제거해도 목록이 유지된다', () => {
      expect(removeUserFromTarget('1, 2', 9)).toBe('1, 2');
    });

    it('마지막 ID를 제거하면 빈 문자열이 된다', () => {
      expect(removeUserFromTarget('1', 1)).toBe('');
    });
  });

  describe('isUserInTarget', () => {
    it('포함 여부를 판정한다', () => {
      expect(isUserInTarget('1, 2, 3', 2)).toBe(true);
      expect(isUserInTarget('1, 2, 3', 9)).toBe(false);
    });

    // 부분 일치로 잘못 판정하지 않아야 한다
    it('부분 일치는 포함으로 보지 않는다', () => {
      expect(isUserInTarget('123, 456', 12)).toBe(false);
    });

    it('빈 목록이면 항상 false다', () => {
      expect(isUserInTarget('', 1)).toBe(false);
    });
  });
});

describe('validatePushData', () => {
  it('모든 조건을 만족하면 파싱된 대상 ID를 반환한다', () => {
    const result = validatePushData(validForm());

    expect(result.isValid).toBe(true);
    expect(result.accountIds).toEqual(['1', '2']);
  });

  it('푸시 타입이 없으면 실패한다', () => {
    const result = validatePushData(validForm({pushType: '  '}));

    expect(result.isValid).toBe(false);
    expect(result.message).toBe('푸시 타입을 선택해주세요.');
  });

  it('발송 대상이 없으면 실패한다', () => {
    const result = validatePushData(validForm({accountIdsInput: ' , '}));

    expect(result.isValid).toBe(false);
    expect(result.message).toBe('발송 대상을 입력해주세요.');
  });

  it('제목과 내용이 모두 비면 실패한다', () => {
    const result = validatePushData(validForm({title: '', body: '   '}));

    expect(result.isValid).toBe(false);
    expect(result.message).toBe('제목 또는 내용 중 하나는 반드시 입력해주세요.');
  });

  it('제목만 있어도 통과한다', () => {
    expect(validatePushData(validForm({body: ''})).isValid).toBe(true);
  });

  it('내용만 있어도 통과한다', () => {
    expect(validatePushData(validForm({title: ''})).isValid).toBe(true);
  });

  it('랜딩 링크가 없으면 실패한다', () => {
    const result = validatePushData(validForm({path: ''}));

    expect(result.isValid).toBe(false);
    expect(result.message).toBe('랜딩 링크를 입력해주세요.');
  });

  describe('길이 제한', () => {
    it('제목 50자는 통과한다', () => {
      expect(validatePushData(validForm({title: 'ㄱ'.repeat(50)})).isValid).toBe(true);
    });

    it('제목이 50자를 넘으면 실패한다', () => {
      const result = validatePushData(validForm({title: 'ㄱ'.repeat(51)}));

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('제목은 50자 이하로 입력해주세요.');
    });

    it('내용 200자는 통과한다', () => {
      expect(validatePushData(validForm({body: 'ㄱ'.repeat(200)})).isValid).toBe(true);
    });

    it('내용이 200자를 넘으면 실패한다', () => {
      const result = validatePushData(validForm({body: 'ㄱ'.repeat(201)}));

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('내용은 200자 이하로 입력해주세요.');
    });
  });
});
