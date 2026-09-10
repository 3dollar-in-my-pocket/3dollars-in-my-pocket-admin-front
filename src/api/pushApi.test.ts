import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('./apiHelpers', () => ({
  apiPost: vi.fn(),
}));

vi.mock('./userApi', () => ({
  default: {searchUsers: vi.fn()},
}));

import {apiPost} from './apiHelpers';
import userApi from './userApi';
import pushApi from './pushApi';

const apiPostMock = apiPost as ReturnType<typeof vi.fn>;
const searchUsersMock = userApi.searchUsers as ReturnType<typeof vi.fn>;

const pushData = {accountIds: ['1'], accountType: 'USER_ACCOUNT'};

describe('pushApi.sendPush', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공하면 ok와 데이터를 반환한다', async () => {
    apiPostMock.mockResolvedValue({ok: true, data: {sent: 1}});

    const result = await pushApi.sendPush('SIMPLE', pushData, 'n-1');

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({sent: 1});
  });

  it('푸시 타입과 nonce를 전달한다', async () => {
    apiPostMock.mockResolvedValue({ok: true, data: {}});

    await pushApi.sendPush('SIMPLE_MARKETING', pushData, 'n-1');

    expect(apiPostMock).toHaveBeenCalledWith(
      '/v1/push/SIMPLE_MARKETING',
      pushData,
      {nonce: 'n-1'}
    );
  });

  // 회귀 테스트: apiPost는 실패를 예외로 던지지 않으므로 ok를 확인해야 한다.
  // 확인하지 않으면 발송 실패가 성공으로 처리된다.
  it('apiPost가 ok:false를 반환하면 실패로 처리한다', async () => {
    apiPostMock.mockResolvedValue({ok: false, data: null, message: '대상이 유효하지 않습니다.'});

    const result = await pushApi.sendPush('SIMPLE', pushData, 'n-1');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('대상이 유효하지 않습니다.');
  });

  it('실패 메시지가 없으면 기본 문구를 반환한다', async () => {
    apiPostMock.mockResolvedValue({ok: false, data: null});

    const result = await pushApi.sendPush('SIMPLE', pushData, 'n-1');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('푸시 발송 중 오류가 발생했습니다.');
  });
});

describe('pushApi.searchUserByNickname', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('유저 검색 결과를 푸시 대상 형태로 변환한다', async () => {
    searchUsersMock.mockResolvedValue({
      ok: true,
      data: {
        users: [{
          userId: '1',
          nickname: '홍길동',
          socialType: 'KAKAO',
          createdAt: '2026-01-01T00:00:00Z',
        }],
      },
    });

    const result = await pushApi.searchUserByNickname('홍길동');

    expect(result.ok).toBe(true);
    expect(result.data).toEqual([{
      id: '1',
      nickname: '홍길동',
      socialType: 'KAKAO',
      createdAt: '2026-01-01T00:00:00Z',
    }]);
  });

  it('검색어의 앞뒤 공백을 제거해 요청한다', async () => {
    searchUsersMock.mockResolvedValue({ok: true, data: {users: []}});

    await pushApi.searchUserByNickname('  홍길동  ');

    expect(searchUsersMock).toHaveBeenCalledWith(
      expect.objectContaining({query: '홍길동'})
    );
  });

  it('검색이 실패하면 빈 목록과 메시지를 반환한다', async () => {
    searchUsersMock.mockResolvedValue({ok: false, data: null});

    const result = await pushApi.searchUserByNickname('홍길동');

    expect(result.ok).toBe(false);
    expect(result.data).toEqual([]);
    expect(result.error).toBe('사용자 검색에 실패했습니다.');
  });

  it('예외가 발생해도 빈 목록을 반환한다', async () => {
    searchUsersMock.mockRejectedValue(new Error('network'));

    const result = await pushApi.searchUserByNickname('홍길동');

    expect(result.ok).toBe(false);
    expect(result.data).toEqual([]);
  });
});
