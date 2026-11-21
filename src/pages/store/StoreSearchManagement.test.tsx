import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter, useLocation} from 'react-router-dom';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import StoreSearchManagement from './StoreSearchManagement';

vi.mock('./StoreSearch', () => ({default: () => <div>검색 화면</div>}));
vi.mock('./PopularNeighborhoodStores', () => ({default: () => <div>인기 가게 화면</div>}));

const LocationSearch = () => <div data-testid="search">{useLocation().search}</div>;

const renderPage = (entry = '/manage/store-search') => {
  useAuthStore.setState({admin: {adminId: '1', name: '관리자', email: 'admin@example.com', role: AdminRole.VIEWER}});
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <StoreSearchManagement/>
      <LocationSearch/>
    </MemoryRouter>
  );
};

describe('가게 검색', () => {
  beforeEach(() => {
    useAuthStore.setState({admin: null});
  });

  it('기본으로 가게 검색 탭을 보여준다', async () => {
    renderPage();
    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['가게 검색', '인기 가게']);
    expect(await screen.findByText('검색 화면')).toBeInTheDocument();
  });

  it('?tab=popular면 인기 가게 탭을 보여준다', async () => {
    renderPage('/manage/store-search?tab=popular');
    expect(await screen.findByText('인기 가게 화면')).toBeInTheDocument();
  });

  it('탭을 바꾸면 URL에 반영한다', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('tab', {name: /인기 가게/}));
    expect(await screen.findByText('인기 가게 화면')).toBeInTheDocument();
    expect(screen.getByTestId('search').textContent).toBe('?tab=popular');
  });
});
