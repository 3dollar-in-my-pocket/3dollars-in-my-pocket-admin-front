import {ChangeEvent, useState} from 'react';
import {toast} from 'react-toastify';
import storeImportApi from '@/api/storeImportApi';
import {
  StoreImportSaveResponse,
  StoreImportValidationResponse,
  StoreImportValidationResult,
} from '@/types/storeImport';
import {showConfirm} from '@/utils/confirmDialog';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';

const isCsvFile = (file: File): boolean => file.name.toLowerCase().endsWith('.csv');
const formatFileSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const StoreFileUpload = () => {
  const [storesFile, setStoresFile] = useState<File | null>(null);
  const [menusFile, setMenusFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<StoreImportValidationResponse | null>(null);
  const [saveResult, setSaveResult] = useState<StoreImportSaveResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetResults = () => {
    setValidation(null);
    setSaveResult(null);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = event.target.files?.[0] || null;
    if (file && !isCsvFile(file)) {
      toast.error('CSV 파일만 선택할 수 있습니다.');
      event.target.value = '';
      setter(null);
    } else {
      setter(file);
    }
    resetResults();
  };

  const handleSampleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await storeImportApi.downloadSample();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'store-import-sample.zip';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('CSV 샘플 파일을 다운로드했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleValidate = async () => {
    if (!storesFile || !menusFile || isValidating) return;
    if (storesFile.size === 0 || menusFile.size === 0) {
      toast.error('비어 있는 CSV 파일은 검증할 수 없습니다.');
      return;
    }
    setIsValidating(true);
    setSaveResult(null);
    try {
      const response = await storeImportApi.validate(storesFile, menusFile);
      setValidation(response.data);
      if (response.data.failedCount > 0) {
        toast.warning(
          `등록 가능 ${response.data.readyCount}건, 검증 실패 ${response.data.failedCount}건입니다.`
        );
      } else {
        toast.success(`${response.data.readyCount}건 모두 등록할 수 있습니다.`);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!storesFile || !menusFile || !validation || validation.readyCount === 0 || isSaving) return;
    const failedMessage = validation.failedCount > 0
      ? `\n검증 실패 ${validation.failedCount}건은 저장되지 않을 수 있습니다.`
      : '';
    if (!showConfirm(
      `검증을 통과한 가게 ${validation.readyCount}건을 등록하시겠습니까?${failedMessage}`
    )) return;

    setIsSaving(true);
    try {
      const response = await storeImportApi.save(storesFile, menusFile);
      setSaveResult(response.data);
      if (response.data.failedCount > 0) {
        toast.warning(`${response.data.savedCount}건 저장, ${response.data.failedCount}건 실패했습니다.`);
      } else {
        toast.success(`${response.data.savedCount}건을 모두 등록했습니다.`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderValidatedDetail = (result: StoreImportValidationResult) => {
    if (result.status === 'FAILED' || !result.data) {
      return <span className="text-danger">{result.error || '검증에 실패했습니다.'}</span>;
    }
    const data = result.data;
    return (
      <div className="small">
        <dl className="row mb-3">
          {result.status === 'READY_TO_UPDATE' && (
            <>
              <dt className="col-sm-4 col-lg-3">기존 가게 ID</dt>
              <dd className="col-sm-8 col-lg-9">{result.existingStoreId ?? '-'}</dd>
            </>
          )}
          <dt className="col-sm-4 col-lg-3">가게명</dt>
          <dd className="col-sm-8 col-lg-9">{data.storeName || '-'}</dd>
          <dt className="col-sm-4 col-lg-3">주소</dt>
          <dd className="col-sm-8 col-lg-9 text-break">{data.address || '-'}</dd>
          <dt className="col-sm-4 col-lg-3">위도</dt>
          <dd className="col-sm-8 col-lg-9">{data.latitude ?? '-'}</dd>
          <dt className="col-sm-4 col-lg-3">경도</dt>
          <dd className="col-sm-8 col-lg-9">{data.longitude ?? '-'}</dd>
          <dt className="col-sm-4 col-lg-3">출현 요일</dt>
          <dd className="col-sm-8 col-lg-9">{data.appearanceDays?.join(', ') || '-'}</dd>
          <dt className="col-sm-4 col-lg-3">영업 시작 시간</dt>
          <dd className="col-sm-8 col-lg-9">{data.openingStartTime || '-'}</dd>
          <dt className="col-sm-4 col-lg-3">영업 종료 시간</dt>
          <dd className="col-sm-8 col-lg-9">{data.openingEndTime || '-'}</dd>
          <dt className="col-sm-4 col-lg-3">결제 수단</dt>
          <dd className="col-sm-8 col-lg-9">{data.paymentMethods?.join(', ') || '-'}</dd>
        </dl>
        <div className="fw-semibold mb-2">메뉴 ({data.menus?.length || 0}개)</div>
        <div className="table-responsive">
          <table className="table table-sm table-bordered mb-0">
            <thead className="table-light">
            <tr>
              <th>#</th>
              <th>메뉴명</th>
              <th>수량</th>
              <th>가격</th>
              <th>카테고리</th>
            </tr>
            </thead>
            <tbody>
            {data.menus?.length ? data.menus.map((menu, index) => (
              <tr key={`${menu.name}-${index}`}>
                <td>{index + 1}</td>
                <td>{menu.name || '-'}</td>
                <td>{menu.count ?? '-'}</td>
                <td>{menu.price ?? '-'}</td>
                <td>{menu.category || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center text-muted">메뉴 없음</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const canSave = !!validation && validation.readyCount > 0 && !saveResult;
  const currentStep = saveResult ? 3 : validation ? 3 : storesFile && menusFile ? 2 : 1;

  return (
    <div>
      <PageHeader description="CSV 파일을 검증한 뒤 여러 가게와 메뉴를 한 번에 등록합니다."
        actions={<button className="btn btn-outline-primary" onClick={handleSampleDownload} disabled={isDownloading}>
          {isDownloading ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-download me-2"/>}
          샘플 ZIP 다운로드
        </button>}/>

      <div className="row g-2 mb-4 store-import-steps" aria-label="등록 진행 단계">
        {[['1', '파일 준비'], ['2', '사전 검증'], ['3', '가게 등록']].map(([step, label]) => {
          const number = Number(step);
          const active = currentStep >= number;
          return <div className="col" key={step}><div className={`rounded-3 border p-3 h-100 ${active ? 'border-primary bg-primary-subtle' : 'bg-body-tertiary'}`}>
            <div className="d-flex align-items-center gap-2"><span className={`badge rounded-pill ${active ? 'text-bg-primary' : 'text-bg-secondary'}`}>{step}</span><strong className={active ? 'text-primary-emphasis' : 'text-body-secondary'}>{label}</strong></div>
          </div></div>;
        })}
      </div>

      <div className="alert alert-info d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <strong><i className="bi bi-info-circle-fill me-2"/>등록 전 확인해주세요</strong>
          <div className="small mt-1">샘플 ZIP의 <code>stores.csv</code>와 <code>store_menus.csv</code>를 UTF-8로 작성합니다. 동일한 importKey의 가게는 신규 생성 대신 갱신됩니다.</div>
        </div>
      </div>

      <SectionCard title="CSV 파일 선택" icon="bi-file-earmark-spreadsheet-fill">
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <FilePicker id="stores-file" title="가게 파일" expectedName="stores.csv" file={storesFile}
                          disabled={isValidating || isSaving} onChange={event => handleFileChange(event, setStoresFile)}/>
            </div>
            <div className="col-12 col-lg-6">
              <FilePicker id="menus-file" title="메뉴 파일" expectedName="store_menus.csv" file={menusFile}
                          disabled={isValidating || isSaving} onChange={event => handleFileChange(event, setMenusFile)}/>
            </div>
          </div>
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mt-4 pt-3 border-top">
            <span className="form-field__hint mb-0">파일을 변경하면 기존 검증 결과가 초기화됩니다.</span>
            <button className="btn btn-primary" disabled={!storesFile || !menusFile || isValidating || isSaving} onClick={handleValidate}>
            {isValidating && <span className="spinner-border spinner-border-sm me-2"/>}
            {isValidating ? '주소 및 데이터 검증 중...' : <><i className="bi bi-shield-check me-1"/>파일 사전 검증</>}
            </button>
          </div>
      </SectionCard>

      {validation && (
        <SectionCard title="검증 결과" icon="bi-clipboard2-check-fill">
            <div className="row g-3 mb-4">
              <ResultMetric label="전체" value={validation.totalCount} icon="bi-list-check" color="secondary"/>
              <ResultMetric label="등록 가능" value={validation.readyCount} icon="bi-check-circle-fill" color="success"/>
              <ResultMetric label="검증 실패" value={validation.failedCount} icon="bi-exclamation-triangle-fill" color="danger"/>
            </div>
            {validation.failedCount > 0 && (
              <div className="alert alert-warning">
                실패 항목은 저장되지 않을 수 있으며, 등록 가능한 항목은 계속 등록할 수 있습니다.
              </div>
            )}
            <div className="d-grid gap-2">
              {validation.results.map((result, index) => (
                <details className="border rounded-3 bg-body overflow-hidden" key={`${result.importKey}-${index}`} open={result.status === 'FAILED'}>
                  <summary className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3" style={{cursor: 'pointer'}}>
                    <span className="fw-semibold font-monospace">{result.importKey}</span>
                    <span className={`badge ${result.status === 'READY_TO_CREATE'
                          ? 'text-bg-success'
                          : result.status === 'READY_TO_UPDATE' ? 'text-bg-warning' : 'text-bg-danger'}`}>
                          {result.status === 'READY_TO_CREATE'
                            ? '신규 등록 예정'
                            : result.status === 'READY_TO_UPDATE' ? '기존 가게 갱신 예정' : '실패'}
                    </span>
                  </summary>
                  <div className="border-top p-3 bg-body-tertiary">{renderValidatedDetail(result)}</div>
                </details>
              ))}
            </div>
        </SectionCard>
      )}

      <SectionCard title="가게 등록" icon="bi-cloud-arrow-up-fill">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div><strong>{validation ? `등록 가능한 가게 ${validation.readyCount}건` : '사전 검증이 필요합니다'}</strong>
              <p className="form-field__hint mb-0">검증한 파일을 변경하지 않고 등록해주세요.</p></div>
          <button className="btn btn-success btn-lg" disabled={!canSave || isSaving} onClick={handleSave}>
            {isSaving && <span className="spinner-border spinner-border-sm me-2"/>}
            {isSaving ? '가게 등록 중...' : <><i className="bi bi-check2-circle me-1"/>검증 파일 등록</>}
          </button>
          </div>
          {saveResult && (
            <div className={`alert ${saveResult.failedCount > 0 ? 'alert-warning' : 'alert-success'} mt-4 mb-0`}>
              <h6 className="fw-bold mb-2">
                등록 결과: 저장 {saveResult.savedCount}건 / 실패 {saveResult.failedCount}건
              </h6>
              <ul className="mb-0 ps-3">
                {saveResult.results.map((result, index) => (
                  <li key={`${result.importKey}-${index}`}>
                    <strong>{result.importKey}</strong>: {result.status === 'SAVED'
                    ? `저장 완료 (가게 ID: ${result.storeId})`
                    : `실패 - ${result.error || '알 수 없는 오류'}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </SectionCard>
    </div>
  );
};

const FilePicker = ({id, title, expectedName, file, disabled, onChange}: {id: string; title: string; expectedName: string; file: File | null; disabled: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void}) => (
  <label htmlFor={id} className={`d-flex flex-column align-items-center justify-content-center text-center border border-2 border-dashed rounded-3 p-4 h-100 ${file ? 'border-success bg-success-subtle' : 'bg-body-tertiary'} ${disabled ? 'opacity-50' : ''}`} style={{cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 190}}>
    <i className={`bi ${file ? 'bi-file-earmark-check-fill text-success' : 'bi-cloud-arrow-up text-primary'} fs-1 mb-2`}/>
    <strong>{title}</strong><span className="small text-body-secondary font-monospace">{expectedName}</span>
    {file ? <span className="badge text-bg-success mt-3 store-import-file-name">{file.name} · {formatFileSize(file.size)}</span> : <span className="btn btn-sm btn-outline-primary mt-3">CSV 파일 선택</span>}
    <input id={id} type="file" accept=".csv,text/csv" hidden disabled={disabled} onChange={onChange}/>
  </label>
);

const ResultMetric = ({label, value, icon, color}: {label: string; value: number; icon: string; color: string}) => (
  <div className="col-12 col-sm-4"><div className={`rounded-3 border bg-${color}-subtle p-3 h-100`}><div className="d-flex align-items-center justify-content-between"><span className={`text-${color}-emphasis`}><i className={`bi ${icon} me-2`}/>{label}</span><strong className="fs-4">{value.toLocaleString()}</strong></div></div></div>
);

export default StoreFileUpload;
