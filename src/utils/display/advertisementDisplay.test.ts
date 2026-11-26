import {formatDisplayWindow, isOvernightWindow, sortDaysOfWeek} from './advertisementDisplay';
import {validateDisplayWindow} from '@/utils/validation/advertisementValidation';

describe('advertisement displayWindow', () => {
  it('요일을 월~일 순서로 정렬하고 중복을 제거한다', () => {
    expect(sortDaysOfWeek(['SATURDAY', 'FRIDAY', 'FRIDAY'])).toEqual(['FRIDAY', 'SATURDAY']);
  });

  it('표시 문자열을 만든다', () => {
    expect(formatDisplayWindow(null)).toBe('제한 없음');
    expect(formatDisplayWindow({daysOfWeek: ['MONDAY', 'FRIDAY'], startTime: null, endTime: null}))
      .toBe('월·금 종일');
    expect(formatDisplayWindow({daysOfWeek: ['SATURDAY', 'FRIDAY'], startTime: '22:00', endTime: '02:00'}))
      .toBe('금·토 22:00~02:00(다음날)');
    expect(formatDisplayWindow({daysOfWeek: ['MONDAY'], startTime: '08:00', endTime: '23:00'}))
      .toBe('월 08:00~23:00');
  });

  it('자정을 넘는 구간을 판별한다', () => {
    expect(isOvernightWindow({daysOfWeek: ['MONDAY'], startTime: '22:00', endTime: '02:00'})).toBe(true);
    expect(isOvernightWindow({daysOfWeek: ['MONDAY'], startTime: '08:00', endTime: '23:00'})).toBe(false);
  });

  it('서버 400 조건을 미리 검증한다', () => {
    expect(validateDisplayWindow(null)).toBeNull();
    expect(validateDisplayWindow({daysOfWeek: [], startTime: null, endTime: null})).not.toBeNull();
    expect(validateDisplayWindow({daysOfWeek: ['MONDAY'], startTime: '08:00', endTime: null})).not.toBeNull();
    expect(validateDisplayWindow({daysOfWeek: ['MONDAY'], startTime: '08:00', endTime: '08:00'})).not.toBeNull();
    expect(validateDisplayWindow({daysOfWeek: ['MONDAY'], startTime: '22:00', endTime: '02:00'})).toBeNull();
  });
});
