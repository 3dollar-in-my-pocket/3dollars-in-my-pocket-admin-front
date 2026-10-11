import {describe, expect, it, vi} from 'vitest';
import {AxiosError} from 'axios';
import axiosInstance from './apiBase';
import {apiDelete, apiGet, apiPost} from './apiHelpers';

vi.mock('./apiBase', () => ({default: vi.fn()}));
const axios = vi.mocked(axiosInstance);
const body = {ok: false, error: 'invalid_parameter', message: '입력 오류',
  errorDetails: [{field: 'url', reason: 'URL 오류'}]};

describe('API 오류 상세 보존', () => {
  it('HTTP 오류의 코드와 필드 오류를 보존한다', async () => {
    axios.mockRejectedValueOnce(new AxiosError('Bad Request', undefined, undefined, undefined,
      {data: body, status: 400} as any));
    expect(await apiGet('/test')).toMatchObject(body);
  });

  it('HTTP 200인 실패 응답도 코드와 필드 오류를 보존한다', async () => {
    axios.mockResolvedValueOnce({data: body});
    expect(await apiPost('/test', {url: ''}, {suppressToast: true})).toMatchObject(body);
    expect(axios).toHaveBeenLastCalledWith(expect.objectContaining({suppressToast: true}));
  });

  it('삭제는 data 없는 성공 응답을 처리하고 개별 오류 처리를 지원한다', async () => {
    axios.mockResolvedValueOnce({data: {ok: true}});
    expect(await apiDelete('/test', undefined, {suppressToast: true})).toEqual({ok: true, data: undefined});
    expect(axios).toHaveBeenLastCalledWith(expect.objectContaining({suppressToast: true, method: 'DELETE'}));
  });
});
