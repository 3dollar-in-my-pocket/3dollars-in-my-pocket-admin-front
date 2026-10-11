import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import storeThreadsPostLinkApi from '@/api/storeThreadsPostLinkApi';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import StoreThreadsPostLinks from './StoreThreadsPostLinks';

const {confirm} = vi.hoisted(() => ({confirm: vi.fn()}));
vi.mock('@/hooks/useConfirm', () => ({default: () => confirm}));
vi.mock('@/api/storeThreadsPostLinkApi', () => ({
  default: {list: vi.fn(), create: vi.fn(), delete: vi.fn()},
}));
const api = vi.mocked(storeThreadsPostLinkApi);
const url = 'https://www.threads.com/@three/post/C1a2B3c4D5e';
const page = {ok: true, data: {
  contents: [
    {postId: '9007199254740993', url, createdAt: '2026-10-12T14:30:15'},
    {postId: '2', createdAt: '2026-10-12T14:30:15'},
  ], cursor: {hasMore: false},
}};
const fill = (value = url) => fireEvent.change(screen.getByLabelText('Threads 포스트 링크'), {
  target: {value},
});
const ready = () => waitFor(() => expect(screen.getByRole('link')).toBeInTheDocument());

describe('가게 Threads 탭', () => {
  beforeEach(() => {
    api.list.mockReset().mockResolvedValue(page);
    api.create.mockReset();
    api.delete.mockReset();
    confirm.mockReset().mockResolvedValue(true);
    useAuthStore.setState({admin: {
      adminId: '1', name: '관리자', email: 'admin@example.com', role: AdminRole.OPERATOR,
    }});
  });

  it('VIEWER는 조회할 수 있고 등록·삭제는 비활성화된다', async () => {
    useAuthStore.setState({admin: {...useAuthStore.getState().admin, role: AdminRole.VIEWER}});
    render(<StoreThreadsPostLinks storeId="12345"/>);
    await ready();
    expect(screen.getByRole('button', {name: '링크 등록'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Threads 포스트 9007199254740993 삭제'})).toBeDisabled();
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveAttribute('href', url);
    expect(screen.getAllByText('2026-10-12 14:30:15')).toHaveLength(2);
    expect(await screen.findByTitle('Threads 포스트 미리보기')).toHaveAttribute('src', `${url}/embed/`);
    expect(screen.queryByRole('button', {name: /미리보기/})).not.toBeInTheDocument();
    expect(screen.getAllByTitle('Threads 포스트 미리보기')).toHaveLength(1);
  });

  it('잘못된 URL을 차단하고 등록 중 재전송을 막은 뒤 첫 페이지를 갱신한다', async () => {
    let resolveCreate: (value: any) => void;
    api.create.mockImplementation(() => new Promise(resolve => { resolveCreate = resolve; }));
    render(<StoreThreadsPostLinks storeId="12345"/>);
    await ready();
    fill('https://www.threads.com/@three');
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    expect(api.create).not.toHaveBeenCalled();
    expect(screen.getByText('올바른 Threads 포스트 URL을 입력해주세요.')).toBeInTheDocument();
    fill(` ${url}?share=1 `);
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    fireEvent.submit(screen.getByLabelText('Threads 포스트 링크').closest('form'));
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(api.create).toHaveBeenCalledWith('12345', `${url}?share=1`);
    resolveCreate({ok: true, data: page.data.contents[0]});
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
    expect(api.list).toHaveBeenLastCalledWith('12345', null, 'LATEST');
    await waitFor(() => expect(screen.getByLabelText('Threads 포스트 링크')).toHaveValue(''));
  });

  it('삭제 ID를 문자열로 보존하고 이미 삭제된 항목이면 목록을 다시 조회한다', async () => {
    api.delete.mockResolvedValue({ok: false, data: undefined, error: 'not_exists_post'});
    render(<StoreThreadsPostLinks storeId="12345"/>);
    await ready();
    fireEvent.click(screen.getByRole('button', {name: 'Threads 포스트 9007199254740993 삭제'}));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('12345', '9007199254740993'));
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
    expect(screen.getByText('이미 삭제되었거나 이 가게에 등록되지 않은 포스트입니다.')).toBeInTheDocument();
  });

  it('등록 응답 유실 시 목록을 확인하기 전 재등록을 막는다', async () => {
    api.create.mockResolvedValue({ok: false, data: null, message: 'timeout'});
    render(<StoreThreadsPostLinks storeId="12345"/>);
    await ready();
    fill();
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    await waitFor(() => expect(screen.getByText(/중복 등록을 피하려면/)).toBeInTheDocument());
    expect(screen.getByRole('button', {name: '링크 등록'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: '새로고침'}));
    await waitFor(() => expect(screen.getByRole('button', {name: '링크 등록'})).toBeEnabled());
    expect(api.create).toHaveBeenCalledTimes(1);
  });

  it('필드 오류를 표시하고 서버에서 권한이 거절되면 쓰기를 비활성화한다', async () => {
    api.create.mockResolvedValueOnce({ok: false, data: null, error: 'invalid_parameter',
      errorDetails: [{field: 'url', reason: '서버 URL 오류'}]})
      .mockResolvedValueOnce({ok: false, data: null, error: 'forbidden_access_denied'});
    render(<StoreThreadsPostLinks storeId="12345"/>);
    await ready();
    fill();
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    await waitFor(() => expect(screen.getByText('서버 URL 오류')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    await waitFor(() => expect(screen.getByRole('button', {name: '링크 등록'})).toBeDisabled());
    expect(screen.getByRole('button', {name: 'Threads 포스트 9007199254740993 삭제'})).toBeDisabled();
  });
});
