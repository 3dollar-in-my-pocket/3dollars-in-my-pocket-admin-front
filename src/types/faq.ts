/**
 * FAQ 관련 타입 정의
 */

/** FaqCategoryResponse */
export interface FaqCategory {
  category: string;
  description: string;
}

/** FaqResponse */
export interface Faq {
  faqId: string;
  application: string;
  question: string;
  answer: string;
  category: FaqCategory;
  createdAt?: string;
  updatedAt?: string;
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
