import {apiPostFormData} from './apiHelpers';
import {
  StoreSnsPostImportSaveResponse,
  StoreSnsPostImportValidationResponse
} from '@/types/storeSnsPostImport';

const buildImportFormData = (snsPostsFile: File): FormData => {
  const formData = new FormData();
  // 서버 multipart 필드명은 기존 이름을 유지한다.
  formData.append('threadPostsFile', snsPostsFile);
  return formData;
};

const storeSnsPostImportApi = {
  validate: (snsPostsFile: File) => apiPostFormData<StoreSnsPostImportValidationResponse>(
    '/v1/store-thread-posts/upload/validate',
    buildImportFormData(snsPostsFile),
    {timeout: 120000}
  ),

  save: (snsPostsFile: File) => apiPostFormData<StoreSnsPostImportSaveResponse>(
    '/v1/store-thread-posts/upload',
    buildImportFormData(snsPostsFile),
    {timeout: 120000}
  ),
};

export default storeSnsPostImportApi;
