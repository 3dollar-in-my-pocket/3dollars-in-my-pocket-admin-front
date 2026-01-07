import { ApiResponse, ContentListResponse } from '../types/api';
import { Faq, FaqCategory, CreateFaqRequest, UpdateFaqRequest } from '../types/faq';
import { apiGet, apiPost, apiPut, apiDelete } from './apiHelpers';

export default {
  /**
   * FAQ 목록 조회
   */
  listFaqs: async ({application, category}: {application: string; category?: string}): Promise<ApiResponse<ContentListResponse<Faq>>> => {
    return apiGet<ContentListResponse<Faq>>(
      `/v1/application/${application}/faqs`,
      category ? { category } : undefined
    );
  },

  /**
   * FAQ 카테고리 목록 조회
   */
  listFaqCategories: async ({application}: {application: string}): Promise<ApiResponse<ContentListResponse<FaqCategory>>> => {
    return apiGet<ContentListResponse<FaqCategory>>(`/v1/application/${application}/faq-categories`);
  },

  /**
   * FAQ 생성 (nonce 보호)
   */
  createFaq: async ({
    application,
    question,
    answer,
    category,
    nonce
  }: {
    application: string;
    question: string;
    answer: string;
    category: string;
    nonce?: string;
  }): Promise<ApiResponse<Faq>> => {
    return apiPost<Faq>(
      `/v1/application/${application}/faq`,
      { question, answer, category },
      { nonce }
    );
  },

  /**
   * FAQ 수정
   */
  updateFaq: async ({
    application,
    faqId,
    question,
    answer,
    category
  }: {
    application: string;
    faqId: string;
    question: string;
    answer: string;
    category: string;
  }): Promise<ApiResponse<Faq>> => {
    return apiPut<Faq>(
      `/v1/application/${application}/faq/${faqId}`,
      { question, answer, category }
    );
  },

  /**
   * FAQ 삭제
   */
  deleteFaq: async ({
    application,
    faqId
  }: {
    application: string;
    faqId: string;
  }): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/v1/application/${application}/faq/${faqId}`);
  },
}
