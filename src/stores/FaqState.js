import { atom } from 'recoil';

export const FaqsState = atom({
  key: 'faqs',
  default: [],
});

export const FaqCategoriesState = atom({
  key: 'faqCategories',
  default: [],
});

export const CurrentFaqCategory = atom({
  key: 'currentFaqCategory',
  default: '',
});
