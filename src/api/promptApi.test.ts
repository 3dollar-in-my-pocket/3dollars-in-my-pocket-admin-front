import {describe, expect, it, vi} from 'vitest';

vi.mock('./apiBase', () => ({default: vi.fn()}));
import axiosInstance from './apiBase';
import promptApi from './promptApi';
import {PromptUpdateRequest} from '@/types/prompt';

describe('프롬프트 API', () => {
  it('PATCH에 명시적인 null과 대문자 사고 수준을 그대로 전달한다', async () => {
    vi.mocked(axiosInstance).mockResolvedValueOnce({data: {ok: true, data: {promptId: 1, thinkingLevel: 'LOW'}}});
    const data: PromptUpdateRequest = {model: 'GEMINI_3_5_FLASH', thinkingBudget: null, thinkingLevel: 'LOW' as const};
    const response = await promptApi.updatePrompt('MENU_EXTRACT', 1, data);
    expect(axiosInstance).toHaveBeenLastCalledWith({
      method: 'PATCH', url: '/v1/prompt-type/MENU_EXTRACT/prompt/1', data,
    });
    expect(response.data.thinkingLevel).toBe('LOW');
  });
  it('HTTP 400의 사고 설정 오류 식별자를 보존한다', async () => {
    vi.mocked(axiosInstance).mockRejectedValueOnce({
      isAxiosError: true,
      response: {status: 400, data: {error: 'invalid_ai_thinking_option', message: '모델의 사고 설정이 유효하지 않습니다'}},
    });
    const response = await promptApi.updatePrompt('MENU_EXTRACT', 1, {thinkingLevel: 'MINIMAL'});
    expect(response.ok).toBe(false);
    expect(response.error).toBe('invalid_ai_thinking_option');
  });
});
