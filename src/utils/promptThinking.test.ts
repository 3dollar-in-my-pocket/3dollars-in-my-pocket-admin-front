import {describe, expect, it} from 'vitest';
import {buildPromptPatch, getThinkingLevels, ignoresTemperature, validateThinking} from './promptThinking';
import {PromptResponse} from '@/types/prompt';

const original: PromptResponse = {
  promptId: 1, promptType: 'MENU_EXTRACT', version: 1, description: '설명', content: '본문',
  status: 'DRAFT', model: 'GEMINI_3_5_FLASH', thinkingBudget: 2048, thinkingLevel: null,
};

describe('프롬프트 사고 설정', () => {
  it('모델별 level과 temperature 정책을 적용한다', () => {
    expect(getThinkingLevels('GEMINI_3_8_FLASH')).toEqual(['LOW', 'MEDIUM', 'HIGH']);
    expect(getThinkingLevels('GEMINI_2_5_FLASH')).toEqual([]);
    expect(ignoresTemperature('GEMINI_3_5_FLASH_LITE')).toBe(true);
    expect(ignoresTemperature('GEMINI_3_5_FLASH')).toBe(false);
  });
  it.each([-1, 0, 512, 24576])('Lite 예산 %s를 허용한다', thinkingBudget => {
    expect(validateThinking({description: 'a', content: 'b', model: 'GEMINI_2_5_FLASH_LITE', thinkingBudget})).toBeNull();
  });
  it.each([-2, 1, 511, 24577, 512.5])('Lite 예산 %s를 거부한다', thinkingBudget => {
    expect(validateThinking({description: 'a', content: 'b', model: 'GEMINI_2_5_FLASH_LITE', thinkingBudget})).toBeTruthy();
  });
  it('Flash의 1~511 예산은 허용한다', () => {
    expect(validateThinking({description: 'a', content: 'b', model: 'GEMINI_2_5_FLASH', thinkingBudget: 1})).toBeNull();
  });
  it('기본 모델 level, 3.8 MINIMAL, 동시 설정을 거부한다', () => {
    expect(validateThinking({description: 'a', content: 'b', thinkingLevel: 'LOW'})).toBeTruthy();
    expect(validateThinking({...original, model: 'GEMINI_3_8_FLASH', thinkingBudget: null as number | null, thinkingLevel: 'MINIMAL'})).toBeTruthy();
    expect(validateThinking({...original, thinkingLevel: 'LOW'})).toBeTruthy();
  });
  it('PATCH는 변경값과 명시적 null만 보낸다', () => {
    const patch = buildPromptPatch({...original, model: 'GEMINI_2_5_FLASH', thinkingBudget: null as number | null}, original);
    expect(patch).toEqual({model: 'GEMINI_2_5_FLASH', thinkingBudget: null as number | null});
    expect(JSON.parse(JSON.stringify(patch))).toHaveProperty('thinkingBudget', null);
  });
  it('기존 3.x budget은 사고 설정 미수정일 때 유지한다', () => {
    expect(validateThinking({...original, description: '수정'}, original)).toBeNull();
    expect(buildPromptPatch({...original, description: '수정'}, original)).toEqual({description: '수정'});
    expect(validateThinking({...original, thinkingBudget: 4096}, original)).toBeTruthy();
    const invalid = {...original, thinkingBudget: -2};
    expect(validateThinking({...invalid, description: '수정'}, invalid)).toBeTruthy();
  });
  it('모델 전환과 기존 옵션 null 제거를 함께 검증한다', () => {
    const values = {...original, model: 'GEMINI_3_8_FLASH', thinkingBudget: null as number | null, thinkingLevel: 'LOW' as const};
    expect(validateThinking(values, original)).toBeNull();
    expect(buildPromptPatch(values, original)).toEqual({model: 'GEMINI_3_8_FLASH', thinkingBudget: null as number | null, thinkingLevel: 'LOW'});
  });
});
