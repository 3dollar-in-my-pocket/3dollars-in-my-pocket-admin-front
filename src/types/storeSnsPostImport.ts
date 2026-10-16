export type StoreSnsPostImportValidationStatus = 'READY_TO_CREATE' | 'SKIPPED' | 'FAILED';
export type StoreSnsPostImportSaveStatus = 'SAVED' | 'SKIPPED' | 'FAILED';

export interface StoreFileImportError {
  code: string;
  file: string;
  row: number | null;
  field: string | null;
  message: string;
}

export interface StoreSnsPostImportValidationResult {
  importKey: string;
  row: number;
  status: StoreSnsPostImportValidationStatus;
  storeId: number | null;
  permaLink: string;
  error: string | null;
  errors: StoreFileImportError[];
}

export interface StoreSnsPostImportValidationResponse {
  totalCount: number;
  readyCount: number;
  skippedCount: number;
  failedCount: number;
  results: StoreSnsPostImportValidationResult[];
  errors: StoreFileImportError[];
}

export interface StoreSnsPostImportSaveResult {
  importKey: string;
  row: number;
  status: StoreSnsPostImportSaveStatus;
  storeId: number | null;
  postId: number | null;
  permaLink: string;
  error: string | null;
  errors: StoreFileImportError[];
}

export interface StoreSnsPostImportSaveResponse {
  totalCount: number;
  savedCount: number;
  skippedCount: number;
  failedCount: number;
  results: StoreSnsPostImportSaveResult[];
  errors: StoreFileImportError[];
}
