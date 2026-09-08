import {describe, expect, it} from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDateTimeKo,
  formatDateTimeKoNoSec,
  formatDateTimeNumeric,
  formatDateTimeShortKo,
  formatTime
} from './dateUtils';

/**
 * 로컬 타임존 기준으로 지정한 시각의 ISO 문자열을 만듭니다.
 *
 * 포맷 함수들이 getFullYear/getHours 등 로컬 시각 기반 API를 쓰므로,
 * UTC 문자열을 넣으면 실행 환경 타임존에 따라 결과가 달라집니다.
 * 테스트는 로컬 시각을 그대로 지정해 타임존 독립적으로 검증합니다.
 */
const localISO = (
  year: number, month: number, day: number,
  hour = 0, minute = 0, second = 0
): string => new Date(year, month - 1, day, hour, minute, second).toISOString();

describe('formatDateTime', () => {
  it('YYYY-MM-DD HH:mm 형식으로 포맷한다', () => {
    expect(formatDateTime(localISO(2026, 3, 5, 14, 30))).toBe('2026-03-05 14:30');
  });

  it('한 자리 월/일/시/분을 0으로 채운다', () => {
    expect(formatDateTime(localISO(2026, 1, 2, 3, 4))).toBe('2026-01-02 03:04');
  });

  it('자정을 00:00으로 표시한다', () => {
    expect(formatDateTime(localISO(2026, 1, 1, 0, 0))).toBe('2026-01-01 00:00');
  });

  it('빈 값이면 하이픈을 반환한다', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime(undefined)).toBe('-');
    expect(formatDateTime('')).toBe('-');
  });
});

describe('formatDate', () => {
  it('YYYY-MM-DD 형식으로 포맷한다', () => {
    expect(formatDate(localISO(2026, 12, 25, 23, 59))).toBe('2026-12-25');
  });

  it('한 자리 월/일을 0으로 채운다', () => {
    expect(formatDate(localISO(2026, 7, 9))).toBe('2026-07-09');
  });

  it('빈 값이면 하이픈을 반환한다', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('')).toBe('-');
  });
});

describe('formatTime', () => {
  it('HH:mm 형식으로 포맷한다', () => {
    expect(formatTime(localISO(2026, 1, 1, 9, 5))).toBe('09:05');
  });

  it('오후 시간을 24시간제로 표시한다', () => {
    expect(formatTime(localISO(2026, 1, 1, 23, 59))).toBe('23:59');
  });

  it('빈 값이면 하이픈을 반환한다', () => {
    expect(formatTime(null)).toBe('-');
    expect(formatTime('')).toBe('-');
  });
});

describe('한국 로케일 포맷 함수', () => {
  const target = localISO(2026, 3, 5, 14, 30, 45);

  // 로케일 출력 문자열은 환경에 따라 달라질 수 있어, 폴백과 포함 여부만 검증합니다.
  describe('빈 값 폴백', () => {
    it('모두 "없음"을 반환한다', () => {
      expect(formatDateTimeKo(null)).toBe('없음');
      expect(formatDateTimeKoNoSec(null)).toBe('없음');
      expect(formatDateTimeNumeric(null)).toBe('없음');
      expect(formatDateTimeShortKo(null)).toBe('없음');
    });

    it('빈 문자열도 "없음"을 반환한다', () => {
      expect(formatDateTimeKo('')).toBe('없음');
      expect(formatDateTimeKoNoSec('')).toBe('없음');
      expect(formatDateTimeNumeric('')).toBe('없음');
      expect(formatDateTimeShortKo('')).toBe('없음');
    });
  });

  describe('formatDateTimeKo', () => {
    it('연월일과 시분초를 모두 포함한다', () => {
      const formatted = formatDateTimeKo(target);

      expect(formatted).toContain('2026');
      expect(formatted).toContain('30');
      // 초까지 표기하는 포맷이다.
      expect(formatted).toContain('45');
    });
  });

  describe('formatDateTimeKoNoSec', () => {
    it('시분은 포함하고 초는 제외한다', () => {
      const formatted = formatDateTimeKoNoSec(target);

      expect(formatted).toContain('2026');
      expect(formatted).toContain('30');
      expect(formatted).not.toContain('45');
    });
  });

  describe('formatDateTimeNumeric', () => {
    it('날짜와 함께 시분을 표시한다', () => {
      const formatted = formatDateTimeNumeric(target);

      expect(formatted).toContain('2026');
      expect(formatted).toContain('30');
    });

    it('초는 표시하지 않는다', () => {
      expect(formatDateTimeNumeric(target)).not.toContain('45');
    });
  });

  describe('formatDateTimeShortKo', () => {
    it('연도와 시분을 포함한다', () => {
      const formatted = formatDateTimeShortKo(target);

      expect(formatted).toContain('2026');
      expect(formatted).toContain('30');
    });
  });
});
