import { apiGetBlob, apiPostFormData } from './apiHelpers';
import { StoreImportSaveResponse, StoreImportValidationResponse } from '@/types/storeImport';

const buildImportFormData = (storesFile: File, menusFile: File): FormData => {
  const formData = new FormData();
  formData.append('storesFile', storesFile);
  formData.append('menusFile', menusFile);
  return formData;
};

const storeImportApi = {
  downloadSample: () => apiGetBlob(
    '/v1/stores/upload/sample-files',
    { timeout: 120000, accept: 'application/zip' }
  ),

  validate: (storesFile: File, menusFile: File) => apiPostFormData<StoreImportValidationResponse>(
    '/v1/stores/upload/validate',
    buildImportFormData(storesFile, menusFile),
    { timeout: 120000 }
  ),

  save: (storesFile: File, menusFile: File) => apiPostFormData<StoreImportSaveResponse>(
    '/v1/stores/upload',
    buildImportFormData(storesFile, menusFile),
    { timeout: 120000 }
  ),
};

export default storeImportApi;
