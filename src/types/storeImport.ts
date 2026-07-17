export type StoreImportValidationStatus = 'READY_TO_CREATE' | 'READY_TO_UPDATE' | 'FAILED';
export type StoreImportSaveStatus = 'SAVED' | 'FAILED';

export interface StoreImportMenu {
  name: string;
  count: number | null;
  price: number | null;
  category: string;
}

export interface StoreImportValidatedData {
  storeName: string;
  address: string;
  latitude: number;
  longitude: number;
  appearanceDays: string[];
  openingStartTime: string | null;
  openingEndTime: string | null;
  paymentMethods: string[];
  menus: StoreImportMenu[];
}

export interface StoreImportValidationResult {
  importKey: string;
  status: StoreImportValidationStatus;
  existingStoreId?: number | null;
  data: StoreImportValidatedData | null;
  error: string | null;
}

export interface StoreImportValidationResponse {
  totalCount: number;
  readyCount: number;
  failedCount: number;
  results: StoreImportValidationResult[];
}

export interface StoreImportSaveResult {
  importKey: string;
  status: StoreImportSaveStatus;
  storeId: number | null;
  error: string | null;
}

export interface StoreImportSaveResponse {
  totalCount: number;
  savedCount: number;
  failedCount: number;
  results: StoreImportSaveResult[];
}
