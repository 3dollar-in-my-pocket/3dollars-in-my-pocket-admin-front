export type StoreThreadPostImportValidationStatus = 'READY_TO_CREATE' | 'SKIPPED' | 'FAILED';
export type StoreThreadPostImportSaveStatus = 'SAVED' | 'SKIPPED' | 'FAILED';

export interface StoreFileImportError {
  code: string;
  file: string;
  row: number | null;
  field: string | null;
  message: string;
}

export interface StoreThreadPostImportValidationResult {
  importKey: string;
  row: number;
  status: StoreThreadPostImportValidationStatus;
  storeId: number | null;
  permaLink: string;
  error: string | null;
  errors: StoreFileImportError[];
}

export interface StoreThreadPostImportValidationResponse {
  totalCount: number;
  readyCount: number;
  skippedCount: number;
  failedCount: number;
  results: StoreThreadPostImportValidationResult[];
  errors: StoreFileImportError[];
}

export interface StoreThreadPostImportSaveResult {
  importKey: string;
  row: number;
  status: StoreThreadPostImportSaveStatus;
  storeId: number | null;
  postId: number | null;
  permaLink: string;
  error: string | null;
  errors: StoreFileImportError[];
}

export interface StoreThreadPostImportSaveResponse {
  totalCount: number;
  savedCount: number;
  skippedCount: number;
  failedCount: number;
  results: StoreThreadPostImportSaveResult[];
  errors: StoreFileImportError[];
}
