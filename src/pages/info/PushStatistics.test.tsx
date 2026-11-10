import {render, screen, within} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import statisticsApi from '@/api/statisticsApi';
import PushStatistics from './PushStatistics';

vi.mock('@/api/statisticsApi', () => ({default: {getPushStatistics: vi.fn()}}));
vi.mock('@/hooks/useEnumOptions', () => ({useEnumLabels: () => ({PushType: {STORE_OPEN: '가게 오픈'}})}));
vi.mock('recharts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('recharts')>()),
  ResponsiveContainer: () => <div/>,
}));

const getPushStatistics = vi.mocked(statisticsApi.getPushStatistics);

describe('푸시 통계', () => {
  beforeEach(() => {
    getPushStatistics.mockReset();
  });

  it('기본으로 최근 7일(어제까지)을 TOTAL·DAILY로 조회하고, clickRate가 없으면 -로 표시한다', async () => {
    getPushStatistics.mockImplementation(async (startDate, endDate, unit) => ({
      ok: true,
      data: {
        contents: unit === 'TOTAL' ? [
          {startDate, endDate, pushType: 'STORE_OPEN', sentCount: 100, impressionCount: 80, clickCount: 12, clickRate: 0.15},
          {startDate, endDate, pushType: 'SIMPLE', sentCount: 40, impressionCount: 0, clickCount: 0},
        ] : [],
      },
    }));

    render(<PushStatistics/>);

    const rowOf = (text: string) => screen.getAllByText(text).find((el) => el.closest('tr'))!.closest('tr')!;
    await screen.findAllByText('가게 오픈');
    const storeOpenRow = rowOf('가게 오픈');
    expect(within(storeOpenRow).getByText('15.00%')).toBeInTheDocument();
    const simpleRow = rowOf('SIMPLE');
    expect(within(simpleRow).getByText('-')).toBeInTheDocument();

    const units = getPushStatistics.mock.calls.map(([, , unit]) => unit).sort();
    expect(units).toEqual(['DAILY', 'TOTAL']);
    const [startDate, endDate] = getPushStatistics.mock.calls[0];
    const diffDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000;
    expect(diffDays).toBe(6);
  });

  it('조회 실패 시 서버 메시지를 보여준다', async () => {
    getPushStatistics.mockResolvedValue({
      ok: false, data: null as any,
      message: '푸시 통계는 최근 30일 이내 어제까지의 기간만 조회할 수 있습니다',
    });

    render(<PushStatistics/>);

    expect(await screen.findByText('푸시 통계는 최근 30일 이내 어제까지의 기간만 조회할 수 있습니다')).toBeInTheDocument();
  });
});
