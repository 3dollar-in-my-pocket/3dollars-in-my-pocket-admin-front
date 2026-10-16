import {apiPostFormData} from './apiHelpers';
import {StoreSnsPostImportSaveResponse, StoreSnsPostImportValidationResponse} from '@/types/storeSnsPostImport';

const buildImportFormData = (snsPostsFile: File): FormData => {
  const formData = new FormData();
  formData.append('snsPostsFile', snsPostsFile);
  return formData;
};

const storeSnsPostImportApi = {
  validate: (snsPostsFile: File) => apiPostFormData<StoreSnsPostImportValidationResponse>(
    '/v1/store-sns-posts/upload/validate',
    buildImportFormData(snsPostsFile),
    {timeout: 120000}
  ),

  save: (snsPostsFile: File) => apiPostFormData<StoreSnsPostImportSaveResponse>(
    '/v1/store-sns-posts/upload',
    buildImportFormData(snsPostsFile),
    {timeout: 120000}
  ),
};

export default storeSnsPostImportApi;
