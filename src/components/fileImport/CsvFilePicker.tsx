import {ChangeEvent} from 'react';

export const isCsvFile = (file: File): boolean => file.name.toLowerCase().endsWith('.csv');

const formatFileSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

interface CsvFilePickerProps {
  id: string;
  title: string;
  expectedName: string;
  file: File | null;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const CsvFilePicker = ({id, title, expectedName, file, disabled, onChange}: CsvFilePickerProps) => (
  <label htmlFor={id} className={`d-flex flex-column align-items-center justify-content-center text-center border border-2 border-dashed rounded-3 p-4 h-100 ${file ? 'border-success bg-success-subtle' : 'bg-body-tertiary'} ${disabled ? 'opacity-50' : ''}`} style={{cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 190}}>
    <i className={`bi ${file ? 'bi-file-earmark-check-fill text-success' : 'bi-cloud-arrow-up text-primary'} fs-1 mb-2`}/>
    <strong>{title}</strong><span className="small text-body-secondary font-monospace">{expectedName}</span>
    {file ? <span className="badge text-bg-success mt-3 store-import-file-name">{file.name} · {formatFileSize(file.size)}</span> : <span className="btn btn-sm btn-outline-primary mt-3">CSV 파일 선택</span>}
    <input id={id} type="file" accept=".csv,text/csv" hidden disabled={disabled} onChange={onChange}/>
  </label>
);

export default CsvFilePicker;
