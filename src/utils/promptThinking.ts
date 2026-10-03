import {AIThinkingLevel, PromptFormRequest, PromptResponse, PromptUpdateRequest} from '@/types/prompt';

export const getThinkingLevels = (model?: string | null): AIThinkingLevel[] => {
  if (model === 'GEMINI_3_8_FLASH') return ['LOW', 'MEDIUM', 'HIGH'];
  if (['GEMINI_3_1_FLASH_LITE', 'GEMINI_3_5_FLASH_LITE', 'GEMINI_3_5_FLASH'].includes(model || '')) {
    return ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'];
  }
  return [];
};

export const ignoresTemperature = (model?: string | null) =>
  ['GEMINI_3_5_FLASH_LITE', 'GEMINI_3_8_FLASH'].includes(model || '');

export const buildPromptPatch = (values: PromptFormRequest, original: PromptResponse): PromptUpdateRequest => {
  const patch: PromptUpdateRequest = Object.fromEntries(Object.entries(values).filter(([key, value]) =>
    value !== undefined && value !== (original[key as keyof PromptResponse] ?? null)
  ));
  if (ignoresTemperature(values.model === undefined ? original.model : values.model)) {
    patch.temperature = null;
  }
  return patch;
};

export const validateThinking = (values: PromptFormRequest, original?: PromptResponse | null): string | null => {
  const {model, thinkingBudget: budget, thinkingLevel: level} = values;
  const patch = original ? buildPromptPatch(values, original) : values;
  const unchanged = original && !['model', 'thinkingBudget', 'thinkingLevel'].some(key => key in patch);
  // 기존 3.x budget은 사고 설정을 수정하지 않는 PATCH에서만 유지할 수 있습니다.
  if (unchanged && getThinkingLevels(model).length && budget != null && Number.isInteger(budget) && budget >= -1) {
    return null;
  }
  if (budget != null && level != null) return '사고 예산과 사고 수준을 동시에 설정할 수 없습니다.';
  if (level != null && !getThinkingLevels(model).includes(level)) return '선택한 모델에서 지원하지 않는 사고 수준입니다.';
  if (budget != null) {
    if (model && !['GEMINI_2_5_FLASH', 'GEMINI_2_5_FLASH_LITE'].includes(model)) {
      return '선택한 모델에서는 사고 예산을 사용할 수 없습니다. 모델 기본 설정으로 초기화해주세요.';
    }
    if (!Number.isInteger(budget) || budget < -1 || budget > 24576 ||
      (model === 'GEMINI_2_5_FLASH_LITE' && budget > 0 && budget < 512)) {
      return model === 'GEMINI_2_5_FLASH_LITE'
        ? '사고 예산은 -1, 0 또는 512~24576 정수여야 합니다.'
        : '사고 예산은 -1~24576 정수여야 합니다.';
    }
  }
  return null;
};
