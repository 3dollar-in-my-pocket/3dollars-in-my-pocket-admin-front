import {ChangeEvent, useState} from 'react';
import {toast} from 'react-toastify';
import storeImportApi from '@/api/storeImportApi';
import {
  StoreImportSaveResponse,
  StoreImportValidationResponse,
  StoreImportValidationResult,
} from '@/types/storeImport';
import {showConfirm} from '@/utils/confirmDialog';

const isCsvFile = (file: File): boolean => file.name.toLowerCase().endsWith('.csv');

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
          <dd className="col-sm-8 col-lg-9">{data.address || '-'}</dd>
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

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1">신규 가게 등록</h2>
        <p className="text-muted mb-0">CSV 두 개를 먼저 검증한 뒤 유저 가게로 일괄 등록합니다.</p>
        <p className="text-muted mb-0">동일한 importKey를 가진 가게는 업데이트 됩니다.</p>
      </div>

      <div
        className="alert alert-info d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
      >
        <div>
          <strong>1. CSV 양식 받기</strong>
          <div className="small mt-1">ZIP 안의 stores.csv와 store_menus.csv를 UTF-8로 작성해주세요.</div>
        </div>
        <button
          className="btn btn-outline-primary flex-shrink-0"
          onClick={handleSampleDownload}
          disabled={isDownloading}
        >
          {isDownloading
            ? <span className="spinner-border spinner-border-sm me-2"/>
            : <i className="bi bi-download me-2"/>}
          샘플 ZIP 다운로드
        </button>
      </div>

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">2. 파일 선택 및 사전 검증</h5>
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <label htmlFor="stores-file" className="form-label fw-semibold">가게 파일 (stores.csv)</label>
              <input id="stores-file" type="file" accept=".csv,text/csv" className="form-control"
                     disabled={isValidating || isSaving} onChange={event => handleFileChange(event, setStoresFile)}/>
            </div>
            <div className="col-12 col-lg-6">
              <label htmlFor="menus-file" className="form-label fw-semibold">메뉴 파일 (store_menus.csv)</label>
              <input id="menus-file" type="file" accept=".csv,text/csv" className="form-control"
                     disabled={isValidating || isSaving} onChange={event => handleFileChange(event, setMenusFile)}/>
            </div>
          </div>
          <div className="form-text mt-3">
            파일을 다시 선택하면 기존 검증 결과가 초기화됩니다.
          </div>
          <button className="btn btn-primary mt-3" disabled={!storesFile || !menusFile || isValidating || isSaving}
                  onClick={handleValidate}>
            {isValidating && <span className="spinner-border spinner-border-sm me-2"/>}
            {isValidating ? '주소 및 데이터 검증 중...' : '파일 사전 검증'}
          </button>
        </div>
      </section>

      {validation && (
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title fw-bold">검증 결과</h5>
            <div className="d-flex flex-wrap gap-2 my-3">
              <span className="badge text-bg-secondary fs-6">전체 {validation.totalCount}</span>
              <span className="badge text-bg-success fs-6">등록 가능 {validation.readyCount}</span>
              <span className="badge text-bg-danger fs-6">실패 {validation.failedCount}</span>
            </div>
            {validation.failedCount > 0 && (
              <div className="alert alert-warning">
                실패 항목은 저장되지 않을 수 있으며, 등록 가능한 항목은 계속 등록할 수 있습니다.
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                <tr>
                  <th>가게 연결 키</th>
                  <th>상태</th>
                  <th style={{minWidth: 360}}>검증 내용</th>
                </tr>
                </thead>
                <tbody>
                {validation.results.map((result, index) => (
                  <tr key={`${result.importKey}-${index}`}>
                    <td className="fw-semibold">{result.importKey}</td>
                    <td>
                        <span className={`badge ${result.status === 'READY_TO_CREATE'
                          ? 'text-bg-success'
                          : result.status === 'READY_TO_UPDATE' ? 'text-bg-warning' : 'text-bg-danger'}`}>
                          {result.status === 'READY_TO_CREATE'
                            ? '신규 등록 예정'
                            : result.status === 'READY_TO_UPDATE' ? '기존 가게 갱신 예정' : '실패'}
                        </span>
                    </td>
                    <td>{renderValidatedDetail(result)}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">3. 실제 가게 등록</h5>
          <button className="btn btn-success" disabled={!canSave || isSaving} onClick={handleSave}>
            {isSaving && <span className="spinner-border spinner-border-sm me-2"/>}
            {isSaving ? '가게 등록 중...' : '검증 파일 등록'}
          </button>
          {!validation && (
            <div className="form-text mt-2">먼저 두 CSV 파일의 사전 검증을 완료해주세요.</div>
          )}
          {saveResult && (
            <div className={`alert ${saveResult.failedCount > 0 ? 'alert-warning' : 'alert-success'} mt-4 mb-0`}>
              <h6 className="fw-bold">
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
        </div>
      </section>
    </div>
  );
};

export default StoreFileUpload;
