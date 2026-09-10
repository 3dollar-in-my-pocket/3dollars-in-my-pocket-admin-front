import {describe, expect, it} from 'vitest';
import {getAdStatus, getTimeUntil} from './timeUtils';

/** 기준 시각. 모든 케이스는 이 시각을 현재로 두고 계산합니다. */
const NOW = new Date('2026-01-01T00:00:00.000Z');

/** 기준 시각에서 지정한 만큼 떨어진 ISO 문자열을 만듭니다. */
const after = (
  {days = 0, hours = 0, minutes = 0, seconds = 0}: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }
): string => {
  const ms = ((days * 24 + hours) * 60 + minutes) * 60_000 + seconds * 1000;
  return new Date(NOW.getTime() + ms).toISOString();
};

describe('getTimeUntil', () => {
  describe('이미 지난 시각', () => {
    // 회귀 테스트: 시작 기준인데 "종료됨"을 반환하던 버그
    it('시작 기준이면 시작됨을 반환한다', () => {
      expect(getTimeUntil(after({minutes: -1}), NOW, 'start')).toBe('시작됨');
    });

    it('종료 기준이면 종료됨을 반환한다', () => {
      expect(getTimeUntil(after({minutes: -1}), NOW, 'end')).toBe('종료됨');
    });

    it('정확히 같은 시각도 지난 것으로 본다', () => {
      expect(getTimeUntil(after({}), NOW, 'end')).toBe('종료됨');
      expect(getTimeUntil(after({}), NOW, 'start')).toBe('시작됨');
    });
  });

  describe('30초 미만', () => {
    it('곧 시작으로 표시한다', () => {
      expect(getTimeUntil(after({seconds: 10}), NOW, 'start')).toBe('곧 시작');
    });

    it('종료 기준이면 곧 종료로 표시한다', () => {
      expect(getTimeUntil(after({seconds: 29}), NOW, 'end')).toBe('곧 종료');
    });
  });

  describe('30초 이상 1분 미만', () => {
    it('초 단위로 표시한다', () => {
      expect(getTimeUntil(after({seconds: 30}), NOW, 'start')).toBe('30초 후 시작');
      expect(getTimeUntil(after({seconds: 59}), NOW, 'start')).toBe('59초 후 시작');
    });
  });

  describe('1시간 미만', () => {
    it('10분 미만이면 분과 초를 함께 표시한다', () => {
      expect(getTimeUntil(after({minutes: 3, seconds: 20}), NOW, 'start')).toBe('3분 20초 후 시작');
    });

    it('10분 미만이고 초가 딱 맞으면 분만 표시한다', () => {
      expect(getTimeUntil(after({minutes: 5}), NOW, 'start')).toBe('5분 후 시작');
    });

    it('10분 이상이면 분만 표시한다', () => {
      expect(getTimeUntil(after({minutes: 30, seconds: 40}), NOW, 'start')).toBe('30분 후 시작');
    });
  });

  describe('1일 미만', () => {
    it('5시간 이하면 시간과 분을 함께 표시한다', () => {
      expect(getTimeUntil(after({hours: 3, minutes: 20}), NOW, 'end')).toBe('3시간 20분 후 종료');
    });

    it('5시간 이하이고 분이 딱 맞으면 시간만 표시한다', () => {
      expect(getTimeUntil(after({hours: 5}), NOW, 'end')).toBe('5시간 후 종료');
    });

    it('5시간을 넘으면 시간만 표시한다', () => {
      expect(getTimeUntil(after({hours: 6, minutes: 30}), NOW, 'end')).toBe('6시간 후 종료');
    });
  });

  describe('1일 이상', () => {
    it('시간이 딱 맞으면 일만 표시한다', () => {
      expect(getTimeUntil(after({days: 3}), NOW, 'start')).toBe('3일 후 시작');
    });

    it('남은 시간이 있으면 일과 시간을 함께 표시한다', () => {
      expect(getTimeUntil(after({days: 2, hours: 5}), NOW, 'start')).toBe('2일 5시간 후 시작');
    });

    it('99일까지는 그대로 표시한다', () => {
      expect(getTimeUntil(after({days: 99}), NOW, 'start')).toBe('99일 후 시작');
    });

    // 경계값: 100일부터 축약 표기로 바뀐다
    it('100일 이상은 100+일로 축약한다', () => {
      expect(getTimeUntil(after({days: 100}), NOW, 'start')).toBe('100+일 후 시작');
      expect(getTimeUntil(after({days: 365}), NOW, 'end')).toBe('100+일 후 종료');
    });
  });

  it('eventType을 넘기지 않으면 시작 기준으로 동작한다', () => {
    expect(getTimeUntil(after({days: 1}), NOW)).toBe('1일 후 시작');
  });
});

describe('getAdStatus', () => {
  it('시작 전이면 예정 상태와 시작까지 남은 시간을 반환한다', () => {
    const status = getAdStatus(after({days: 2}), after({days: 5}), NOW);

    expect(status.status).toBe('scheduled');
    expect(status.label).toBe('예정');
    expect(status.timeText).toBe('2일 후 시작');
    expect(status.badgeClass).toBe('bg-warning text-dark');
  });

  it('기간 중이면 진행중 상태와 종료까지 남은 시간을 반환한다', () => {
    const status = getAdStatus(after({days: -1}), after({days: 3}), NOW);

    expect(status.status).toBe('active');
    expect(status.label).toBe('진행중');
    expect(status.timeText).toBe('3일 후 종료');
    expect(status.badgeClass).toBe('bg-success');
  });

  it('종료 후면 종료 상태를 반환한다', () => {
    const status = getAdStatus(after({days: -5}), after({days: -1}), NOW);

    expect(status.status).toBe('ended');
    expect(status.label).toBe('종료');
    expect(status.timeText).toBe('종료됨');
    expect(status.badgeClass).toBe('bg-secondary');
  });

  // 경계값: 시작 시각과 정확히 같으면 진행중으로 본다
  it('시작 시각과 같으면 진행중으로 본다', () => {
    const status = getAdStatus(after({}), after({days: 1}), NOW);

    expect(status.status).toBe('active');
  });

  // 경계값: 종료 시각과 정확히 같으면 아직 진행중으로 본다
  it('종료 시각과 같으면 진행중으로 본다', () => {
    const status = getAdStatus(after({days: -1}), after({}), NOW);

    expect(status.status).toBe('active');
    // 종료 시각에 도달했으므로 남은 시간은 없다.
    expect(status.timeText).toBe('종료됨');
  });
});
