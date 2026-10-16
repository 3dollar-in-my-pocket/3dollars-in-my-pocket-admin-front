import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter, useLocation} from 'react-router-dom';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import StoreActivityManagement from './StoreActivityManagement';

vi.mock('../review/ReviewManagement', () => ({default: () => <div>리뷰 화면</div>}));
vi.mock('../manage/StoreImageManage', () => ({default: () => <div>이미지 화면</div>}));
vi.mock('../storePost/StorePostManagement', () => ({default: () => <div>소식 화면</div>}));
vi.mock('../storeSnsPost/StoreSnsPostManagement', () => ({default: () => <div>SNS 포스트 화면</div>}));
vi.mock('../coupon/CouponManagement', () => ({default: () => <div>쿠폰 화면</div>}));
vi.mock('../storeMessage/StoreMessageManagement', () => ({default: () => <div>메시지 화면</div>}));
vi.mock('../storeReport/StoreReportManagement', () => ({default: () => <div>신고 화면</div>}));

const LocationSearch = () => <div data-testid="search">{useLocation().search}</div>;

const renderPage = (role: AdminRole, entry = '/manage/store-activity') => {
  useAuthStore.setState({admin: {adminId: '1', name: '관리자', email: 'admin@example.com', role}});
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <StoreActivityManagement/>
      <LocationSearch/>
    </MemoryRouter>
  );
};

const tabLabels = () => screen.getAllByRole('tab').map(tab => tab.textContent);

describe('가게 활동 관리', () => {
  beforeEach(() => {
    useAuthStore.setState({admin: null});
  });

  it('OWNER는 이미지 탭을 포함한 모든 탭을 본다', () => {
    renderPage(AdminRole.OWNER);
    expect(tabLabels()).toEqual(['리뷰', '이미지', '신고 이력', '소식', 'SNS 포스트', '쿠폰', '메시지']);
  });

  it.each([AdminRole.OPERATOR, AdminRole.VIEWER])('%s는 이미지 탭을 보지 못한다', role => {
    renderPage(role);
    expect(tabLabels()).toEqual(['리뷰', '신고 이력', '소식', 'SNS 포스트', '쿠폰', '메시지']);
  });

  it('선택한 탭의 화면만 렌더링하고 URL에 반영한다', async () => {
    renderPage(AdminRole.OPERATOR);
    expect(await screen.findByText('리뷰 화면')).toBeInTheDocument();
    expect(screen.queryByText('쿠폰 화면')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', {name: /쿠폰/}));
    expect(await screen.findByText('쿠폰 화면')).toBeInTheDocument();
    expect(screen.queryByText('리뷰 화면')).not.toBeInTheDocument();
    expect(screen.getByTestId('search')).toHaveTextContent('?tab=coupon');
  });

  it('권한 없는 탭으로 들어오면 첫 번째 탭을 보여준다', async () => {
    renderPage(AdminRole.VIEWER, '/manage/store-activity?tab=image');
    expect(await screen.findByText('리뷰 화면')).toBeInTheDocument();
    expect(screen.queryByText('이미지 화면')).not.toBeInTheDocument();
  });
});
