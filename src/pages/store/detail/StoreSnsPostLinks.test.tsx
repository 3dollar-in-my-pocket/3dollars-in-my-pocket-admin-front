import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import storeSnsPostLinkApi from '@/api/storeSnsPostLinkApi';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import {StorePost} from '@/types/storePost';
import StoreSnsPostLinks from './StoreSnsPostLinks';

const {confirm} = vi.hoisted(() => ({confirm: vi.fn()}));
vi.mock('@/hooks/useConfirm', () => ({default: () => confirm}));
vi.mock('@/api/storeSnsPostLinkApi', () => ({
  default: {list: vi.fn(), listAll: vi.fn(), create: vi.fn(), delete: vi.fn()},
}));
const api = vi.mocked(storeSnsPostLinkApi);
const url = 'https://www.threads.com/@three/post/C1a2B3c4D5e';
const snsPost = (postId: string, sectionType: string, postUrl: string): StorePost => ({
  postId, body: '', sections: [{sectionType, url: postUrl, ratio: 0}], isOwner: false, stickers: [], store: null,
  createdAt: '2026-10-12T14:30:15', updatedAt: '2026-10-12T14:30:15',
});
const page = {ok: true, data: {
  contents: [
    snsPost('9007199254740993', 'THREADS_POST_LINK', url),
    snsPost('2', 'INSTAGRAM_POST_LINK', ''),
  ], cursor: {hasMore: false},
}};
const fill = (value = url) => fireEvent.change(screen.getByLabelText('SNS 포스트 링크'), {
  target: {value},
});
const ready = () => waitFor(() => expect(screen.getByRole('link')).toBeInTheDocument());

describe('가게 SNS 탭', () => {
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
    render(<StoreSnsPostLinks storeId="12345"/>);
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
    render(<StoreSnsPostLinks storeId="12345"/>);
    await ready();
    fill('https://www.threads.com/@three');
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    expect(api.create).not.toHaveBeenCalled();
    expect(screen.getByText('올바른 Threads 포스트 URL을 입력해주세요.')).toBeInTheDocument();
    fill(` ${url}?share=1 `);
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    fireEvent.submit(screen.getByLabelText('SNS 포스트 링크').closest('form'));
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(api.create).toHaveBeenCalledWith('12345', `${url}?share=1`);
    resolveCreate({ok: true, data: page.data.contents[0]});
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
    expect(api.list).toHaveBeenLastCalledWith('12345', null, 'LATEST', []);
    await waitFor(() => expect(screen.getByLabelText('SNS 포스트 링크')).toHaveValue(''));
  });

  it('삭제 ID를 문자열로 보존하고 이미 삭제된 항목이면 목록을 다시 조회한다', async () => {
    api.delete.mockResolvedValue({ok: false, data: undefined, error: 'not_exists_post'});
    render(<StoreSnsPostLinks storeId="12345"/>);
    await ready();
    fireEvent.click(screen.getByRole('button', {name: 'Threads 포스트 9007199254740993 삭제'}));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('12345', '9007199254740993'));
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
    expect(screen.getByText('이미 삭제되었거나 이 가게에 등록되지 않은 포스트입니다.')).toBeInTheDocument();
  });

  it('등록 응답 유실 시 목록을 확인하기 전 재등록을 막는다', async () => {
    api.create.mockResolvedValue({ok: false, data: null, message: 'timeout'});
    render(<StoreSnsPostLinks storeId="12345"/>);
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
    render(<StoreSnsPostLinks storeId="12345"/>);
    await ready();
    fill();
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    await waitFor(() => expect(screen.getByText('서버 URL 오류')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    await waitFor(() => expect(screen.getByRole('button', {name: '링크 등록'})).toBeDisabled());
    expect(screen.getByRole('button', {name: 'Threads 포스트 9007199254740993 삭제'})).toBeDisabled();
  });
  it('플랫폼별로 URL을 검증하고 Instagram 링크를 등록한다', async () => {
    const instagramUrl = 'https://www.instagram.com/p/C1a2B3c4D5e/';
    api.create.mockResolvedValue({ok: true, data: snsPost('3', 'INSTAGRAM_POST_LINK', instagramUrl)});
    render(<StoreSnsPostLinks storeId="12345"/>);
    await ready();
    const submit = () => fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    fill('https://www.instagram.com/share/abc');
    submit();
    expect(screen.getByText('올바른 Instagram 포스트 URL을 입력해주세요.')).toBeInTheDocument();
    fill('https://www.facebook.com/p/C1a2B3c4D5e');
    submit();
    expect(screen.getByText('Threads 또는 Instagram 포스트 URL만 등록할 수 있습니다.')).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();
    fill(instagramUrl);
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledWith('12345', instagramUrl));
  });

  it('미지원 SNS 서버 오류(BR116)를 입력 필드에 표시한다', async () => {
    api.create.mockResolvedValue({ok: false, data: null, error: 'unsupported_sns_post_link'});
    render(<StoreSnsPostLinks storeId="12345"/>);
    await ready();
    fill();
    fireEvent.click(screen.getByRole('button', {name: '링크 등록'}));
    await waitFor(() => expect(screen.getByLabelText('SNS 포스트 링크')).toHaveClass('is-invalid'));
    expect(screen.getByText('Threads 또는 Instagram 포스트 URL만 등록할 수 있습니다.')).toBeInTheDocument();
  });

  it('플랫폼 필터를 바꾸면 선택한 플랫폼으로 다시 조회한다', async () => {
    render(<StoreSnsPostLinks storeId="12345"/>);
    await ready();
    fireEvent.change(screen.getByLabelText('SNS 포스트 플랫폼'), {target: {value: 'INSTAGRAM'}});
    await waitFor(() => expect(api.list).toHaveBeenLastCalledWith('12345', null, 'LATEST', ['INSTAGRAM']));
    fireEvent.change(screen.getByLabelText('SNS 포스트 플랫폼'), {target: {value: ''}});
    await waitFor(() => expect(api.list).toHaveBeenLastCalledWith('12345', null, 'LATEST', []));
  });
});
