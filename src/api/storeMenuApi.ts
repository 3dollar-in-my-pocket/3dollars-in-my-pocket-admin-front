import { apiPostFormData } from './apiHelpers';
import { StoreMenuExtractResponse } from '../types/storeMenu';

const storeMenuApi = {
  extractMenus: async (file: File, nonce?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiPostFormData<StoreMenuExtractResponse[]>(
      '/v1/store-menu/extract',
      formData,
      {
        nonce,
        timeout: 60000,
      }
    );
  }
};

export default storeMenuApi;
