import { ApiResponse, CursorPaginationParams, PaginatedResponse } from '../types/api';
import { PromptFormRequest, PromptResponse, PromptUpdateRequest } from '../types/prompt';
import { apiDelete, apiGetPaginated, apiPatch, apiPost } from './apiHelpers';

const promptApi = {
  listPrompts: async (
    promptType: string,
    paginationParams: CursorPaginationParams
  ): Promise<ApiResponse<PaginatedResponse<PromptResponse>>> => {
    return apiGetPaginated<PromptResponse>(
      `/v1/prompt-type/${promptType}/prompts`,
      paginationParams
    );
  },

  createPrompt: async (
    promptType: string,
    data: PromptFormRequest
  ): Promise<ApiResponse<PromptResponse>> => {
    return apiPost<PromptResponse>(`/v1/prompt-type/${promptType}/prompt`, data);
  },

  updatePrompt: async (
    promptType: string,
    promptId: number,
    data: PromptUpdateRequest
  ): Promise<ApiResponse<PromptResponse>> => {
    return apiPatch<PromptResponse>(`/v1/prompt-type/${promptType}/prompt/${promptId}`, data);
  },

  deletePrompt: async (
    promptType: string,
    promptId: number
  ): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/v1/prompt-type/${promptType}/prompt/${promptId}`);
  }
};

export default promptApi;
