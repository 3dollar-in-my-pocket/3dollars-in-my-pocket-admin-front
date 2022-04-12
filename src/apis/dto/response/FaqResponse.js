export const FaqResponse = (data) => {
  return {
    faqId: data.faqId,
    category: data.category,
    question: data.question,
    answer: data.answer,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const FaqCategoryResponse = (data) => {
  return {
    category: data.category,
    description: data.description,
    displayOrder: data.displayOrder,
  };
};
