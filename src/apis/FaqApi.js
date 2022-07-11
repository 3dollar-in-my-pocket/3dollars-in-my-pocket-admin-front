import axios from 'axios';
import { AUTH_TOKEN, AUTH_KEY } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
  addFaq: async (req) => {
    return await axios.post(
      `${AUTH_KEY.apiUrl}/admin/v1/faq`,
      req,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  updateFaq: async (faqId, req) => {
    return await axios.put(
      `${AUTH_KEY.apiUrl}/admin/v1/faq/${faqId}`,
      req,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  deleteFaq: async (faqId) => {
    return await axios.delete(
      `${AUTH_KEY.apiUrl}/admin/v1/faq/${faqId}`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  getFaqs: async () => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/faqs`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  getFaqCategories: async (applicationType) => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/faq/categories?applicationType=${applicationType}`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
