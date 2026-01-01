/**
 * FAQ 관련 타입 정의
 */

export interface Faq {
  faqId: string;
  question: string;
  answer: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqCategory {
  category: string;
  displayName?: string;
}

export interface ListFaqsParams {
  application: string;
  category?: string;
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
  category: string;
}

export interface UpdateFaqRequest {
  question: string;
  answer: string;
  category: string;
}
