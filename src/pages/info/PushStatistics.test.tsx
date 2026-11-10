import {fireEvent, render, screen, within} from '@testing-library/react';
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

  it.each([
    ['푸시 타입', ['STORE_OPEN', '나머지', '다른 타입'], ['다른 타입', '나머지', 'STORE_OPEN']],
    ['발송 수', ['다른 타입', '나머지', 'STORE_OPEN'], ['STORE_OPEN', '나머지', '다른 타입']],
    ['노출 수', ['다른 타입', '나머지', 'STORE_OPEN'], ['STORE_OPEN', '나머지', '다른 타입']],
    ['클릭 수', ['다른 타입', '나머지', 'STORE_OPEN'], ['STORE_OPEN', '나머지', '다른 타입']],
    ['클릭률', ['나머지', 'STORE_OPEN', '다른 타입'], ['STORE_OPEN', '나머지', '다른 타입']],
  ])('%s 열을 양방향으로 정렬하며 추가 조회하지 않는다', async (label, ascending, descending) => {
    getPushStatistics.mockImplementation(async (startDate, endDate, unit) => ({
      ok: true,
      data: {
        contents: unit === 'TOTAL' ? [
          {startDate, endDate, pushType: 'STORE_OPEN', sentCount: 100, impressionCount: 100,
            clickCount: 100, clickRate: 0.2},
          {startDate, endDate, pushType: '나머지', sentCount: 20, impressionCount: 20,
            clickCount: 20, clickRate: 0.03},
          {startDate, endDate, pushType: '다른 타입', sentCount: 3, impressionCount: 3, clickCount: 3},
        ] : [],
      },
    }));
    render(<PushStatistics/>);
    fireEvent.click(screen.getByRole('button', {name: '검색'}));
    const table = await screen.findByRole('table');
    const order = () => within(table).getAllByRole('row').slice(1).map((row) => {
      const cell = within(row).getAllByRole('cell')[0];
      return cell.querySelector('small')?.textContent ?? cell.textContent;
    });
    const button = within(table).getByRole('button', {name: label as string});
    fireEvent.click(button);
    expect(order()).toEqual(ascending);
    expect(button.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(button);
    expect(order()).toEqual(descending);
    expect(button.closest('th')).toHaveAttribute('aria-sort', 'descending');
    expect(getPushStatistics).toHaveBeenCalledTimes(2);
  });

  it('진입과 기간 변경은 조회하지 않고 검색해야 조회하며, 요청 중 중복 검색을 막는다', async () => {
    getPushStatistics.mockReturnValue(new Promise(() => {}));
    render(<PushStatistics/>);

    expect(screen.getByText('기간을 선택한 후 검색 버튼을 눌러 푸시 통계를 조회하세요.')).toBeInTheDocument();
    expect(getPushStatistics).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: '최근 14일'}));
    fireEvent.change(screen.getByLabelText('시작일'), {target: {value: screen.getByLabelText('종료일').getAttribute('max')}});
    expect(getPushStatistics).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: '검색'}));
    expect(getPushStatistics).toHaveBeenCalledTimes(2);
    const searchButton = screen.getByRole('button', {name: '조회 중...'});
    expect(searchButton).toBeDisabled();
    fireEvent.click(searchButton);
    fireEvent.click(screen.getByRole('button', {name: '최근 7일'}));
    expect(getPushStatistics).toHaveBeenCalledTimes(2);
  });

  it('검색 시 최근 7일(어제까지)을 TOTAL·DAILY로 조회하고, clickRate가 없으면 -로 표시한다', async () => {
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
    fireEvent.click(screen.getByRole('button', {name: '검색'}));

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

    fireEvent.click(screen.getByRole('button', {name: '최근 14일'}));
    expect(getPushStatistics).toHaveBeenCalledTimes(2);
    expect(screen.getByText(`${startDate} ~ ${endDate} 기간 합계입니다.`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: '검색'}));
    await screen.findAllByText('가게 오픈');
    expect(getPushStatistics).toHaveBeenCalledTimes(4);
    const [newStartDate, newEndDate] = getPushStatistics.mock.calls[2];
    expect((new Date(newEndDate).getTime() - new Date(newStartDate).getTime()) / 86_400_000).toBe(13);
  });

  it('조회 실패 시 서버 메시지를 보여준다', async () => {
    getPushStatistics.mockResolvedValue({
      ok: false, data: null as any,
      message: '푸시 통계는 최근 30일 이내 어제까지의 기간만 조회할 수 있습니다',
    });

    render(<PushStatistics/>);
    fireEvent.click(screen.getByRole('button', {name: '검색'}));

    expect(await screen.findByText('푸시 통계는 최근 30일 이내 어제까지의 기간만 조회할 수 있습니다')).toBeInTheDocument();
  });
});
