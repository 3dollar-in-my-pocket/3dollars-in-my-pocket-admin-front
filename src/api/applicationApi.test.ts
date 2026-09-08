import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('./apiHelpers', () => ({
  apiGet: vi.fn(),
}));

import {apiGet} from './apiHelpers';
import applicationApi from './applicationApi';

const apiGetMock = apiGet as ReturnType<typeof vi.fn>;

describe('applicationApi.getSchemes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공하면 스킴 목록을 반환한다', async () => {
    apiGetMock.mockResolvedValue({
      ok: true,
      data: {contents: [{scheme: 'dollars://home'}]},
    });

    const result = await applicationApi.getSchemes();

    expect(result.ok).toBe(true);
    expect(result.data.contents).toHaveLength(1);
  });

  it('기본 애플리케이션 타입은 USER다', async () => {
    apiGetMock.mockResolvedValue({ok: true, data: {contents: []}});

    await applicationApi.getSchemes();

    expect(apiGetMock).toHaveBeenCalledWith('/v1/application/USER/schemes');
  });

  it('애플리케이션 타입을 지정할 수 있다', async () => {
    apiGetMock.mockResolvedValue({ok: true, data: {contents: []}});

    await applicationApi.getSchemes('BOSS');

    expect(apiGetMock).toHaveBeenCalledWith('/v1/application/BOSS/schemes');
  });

  // 회귀 테스트: apiGet은 실패를 예외로 던지지 않으므로 ok를 확인해야 한다.
  // 확인하지 않으면 data가 null인 채로 ok:true가 되어 호출부에서 contents 접근이 깨진다.
  it('apiGet이 ok:false를 반환하면 빈 목록으로 실패 처리한다', async () => {
    apiGetMock.mockResolvedValue({ok: false, data: null});

    const result = await applicationApi.getSchemes();

    expect(result.ok).toBe(false);
    expect(result.data).toEqual({contents: []});
  });

  it('data가 비어 있으면 빈 목록으로 실패 처리한다', async () => {
    apiGetMock.mockResolvedValue({ok: true, data: null});

    const result = await applicationApi.getSchemes();

    expect(result.ok).toBe(false);
    expect(result.data).toEqual({contents: []});
  });
});
