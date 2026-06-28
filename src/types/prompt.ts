export interface PromptResponse {
  promptId: number;
  promptType: string;
  version: number;
  description: string;
  content: string;
  systemInstruction?: string | null;
  model?: AIModel | null;
  maxOutputTokens?: number | null;
  temperature?: number | null;
  thinkingBudget?: number | null;
  status: PromptStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type PromptStatus = 'DRAFT' | 'ACTIVE' | string;
export type AIModel = string;

export interface PromptFormRequest {
  description: string;
  content: string;
  systemInstruction?: string | null;
  model?: AIModel | null;
  maxOutputTokens?: number | null;
  temperature?: number | null;
  thinkingBudget?: number | null;
  status?: PromptStatus;
}

export interface PromptUpdateRequest {
  description?: string | null;
  content?: string | null;
  systemInstruction?: string | null;
  model?: AIModel | null;
  maxOutputTokens?: number | null;
  temperature?: number | null;
  thinkingBudget?: number | null;
  status?: PromptStatus | null;
}

export interface EnumOption {
  type?: string;
  key?: string;
  value?: string;
  name?: string;
  description?: string;
  displayName?: string;
}
