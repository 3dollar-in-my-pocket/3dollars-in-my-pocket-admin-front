import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {describe, expect, it, vi} from 'vitest';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import Statistics from './Statistics';

vi.mock('./ServerStatistics', () => ({default: () => <div>서버 통계 화면</div>}));
vi.mock('./ClientStatInfo', () => ({default: () => <div>GA 화면</div>}));
vi.mock('./AdStatInfo', () => ({default: () => <div>광고 화면</div>}));
vi.mock('./PushStatInfo', () => ({default: () => <div>푸시 화면</div>}));

const renderPage = (role: AdminRole, entry = '/info/statistics') => {
  useAuthStore.setState({admin: {adminId: '1', name: '관리자', email: 'admin@example.com', role}});
  return render(<MemoryRouter initialEntries={[entry]}><Statistics/></MemoryRouter>);
};

const tabLabels = () => screen.getAllByRole('tab').map(tab => tab.textContent);

describe('통계', () => {
  it.each([AdminRole.OWNER, AdminRole.OPERATOR])('%s는 모든 통계 탭을 본다', role => {
    renderPage(role);
    expect(tabLabels()).toEqual(['서버 통계', '클라이언트 통계 (GA)', '광고 통계', '푸시 통계']);
  });

  it('VIEWER는 서버·클라이언트 통계만 본다', () => {
    renderPage(AdminRole.VIEWER);
    expect(tabLabels()).toEqual(['서버 통계', '클라이언트 통계 (GA)']);
  });

  it('쿼리로 지정한 탭을 연다', async () => {
    renderPage(AdminRole.OPERATOR, '/info/statistics?tab=push');
    expect(await screen.findByText('푸시 화면')).toBeInTheDocument();
    expect(screen.queryByText('서버 통계 화면')).not.toBeInTheDocument();
  });
});
