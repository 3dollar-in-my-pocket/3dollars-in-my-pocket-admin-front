import {apiPostFormData} from './apiHelpers';
import {
  StoreThreadPostImportSaveResponse,
  StoreThreadPostImportValidationResponse
} from '@/types/storeThreadPostImport';

const buildImportFormData = (threadPostsFile: File): FormData => {
  const formData = new FormData();
  formData.append('threadPostsFile', threadPostsFile);
  return formData;
};

const storeThreadPostImportApi = {
  validate: (threadPostsFile: File) => apiPostFormData<StoreThreadPostImportValidationResponse>(
    '/v1/store-thread-posts/upload/validate',
    buildImportFormData(threadPostsFile),
    {timeout: 120000}
  ),

  save: (threadPostsFile: File) => apiPostFormData<StoreThreadPostImportSaveResponse>(
    '/v1/store-thread-posts/upload',
    buildImportFormData(threadPostsFile),
    {timeout: 120000}
  ),
};

export default storeThreadPostImportApi;
