import axiosInstance from "./apiBase";

export default {
  listFaqs: async ({application, category}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/application/${application}/faqs`,
          params: {
            ...(category && {category})
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
  listFaqCategories: async ({application}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/application/${application}/faq/categories`,
        }
      );
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
  createFaq: async ({application, question, answer, category, nonce}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "POST",
          url: `/v1/application/${application}/faq`,
          data: {
            question,
            answer,
            category
          },
          headers: nonce ? {
            'X-Nonce-Token': nonce,
          } : {},
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
  updateFaq: async ({application, faqId, question, answer, category}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "PUT",
          url: `/v1/application/${application}/faq/${faqId}`,
          data: {
            question,
            answer,
            category
          }
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
  deleteFaq: async ({application, faqId}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "DELETE",
          url: `/v1/application/${application}/faq/${faqId}`,
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
}
