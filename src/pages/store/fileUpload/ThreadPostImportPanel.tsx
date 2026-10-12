import {ChangeEvent, useState} from 'react';
import {toast} from 'react-toastify';
import storeThreadPostImportApi from '@/api/storeThreadPostImportApi';
import {
  StoreFileImportError,
  StoreThreadPostImportSaveResponse,
  StoreThreadPostImportSaveStatus,
  StoreThreadPostImportValidationResponse,
  StoreThreadPostImportValidationStatus,
} from '@/types/storeThreadPostImport';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import CsvFilePicker, {isCsvFile} from '@/components/fileImport/CsvFilePicker';
import ImportResultMetric from '@/components/fileImport/ImportResultMetric';
import ImportSteps from '@/components/fileImport/ImportSteps';
import useConfirm from '@/hooks/useConfirm';

const SAMPLE_FILE_NAME = 'store_thread_posts.csv';
const SAMPLE_CSV = 'import_key,perma_link\nSTORE-001,https://www.threads.com/@three/post/C1a2B3c4D5e\n';

const VALIDATION_STATUS: Record<StoreThreadPostImportValidationStatus, { label: string; badge: string }> = {
  READY_TO_CREATE: {label: '등록 예정', badge: 'text-bg-success'},
  SKIPPED: {label: '건너뜀', badge: 'text-bg-secondary'},
  FAILED: {label: '실패', badge: 'text-bg-danger'},
};

const SAVE_STATUS: Record<StoreThreadPostImportSaveStatus, { label: string; badge: string }> = {
  SAVED: {label: '저장 완료', badge: 'text-bg-success'},
  SKIPPED: {label: '건너뜀', badge: 'text-bg-secondary'},
  FAILED: {label: '실패', badge: 'text-bg-danger'},
};

const formatImportError = (error: StoreFileImportError) => {
  const location = [error.row != null ? `${error.row}행` : null, error.field].filter(Boolean).join(' · ');
  return location ? `[${location}] ${error.message}` : error.message;
};

const ThreadPostImportPanel = () => {
  const confirm = useConfirm();
  const [threadPostsFile, setThreadPostsFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<StoreThreadPostImportValidationResponse | null>(null);
  const [saveResult, setSaveResult] = useState<StoreThreadPostImportSaveResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && !isCsvFile(file)) {
      toast.error('CSV 파일만 선택할 수 있습니다.');
      event.target.value = '';
      setThreadPostsFile(null);
    } else {
      setThreadPostsFile(file);
    }
    setValidation(null);
    setSaveResult(null);
  };

  const handleSampleDownload = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE_CSV], {type: 'text/csv;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = SAMPLE_FILE_NAME;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleValidate = async () => {
    if (!threadPostsFile || isValidating) return;
    if (threadPostsFile.size === 0) {
      toast.error('비어 있는 CSV 파일은 검증할 수 없습니다.');
      return;
    }
    setIsValidating(true);
    setSaveResult(null);
    try {
      const response = await storeThreadPostImportApi.validate(threadPostsFile);
      const data = response.data;
      setValidation(data);
      if (data.failedCount > 0 || data.errors?.length > 0) {
        toast.warning(`등록 가능 ${data.readyCount}건, 검증 실패 ${data.failedCount}건입니다.`);
      } else if (data.readyCount === 0) {
        toast.info('새로 등록할 쓰레드 포스트가 없습니다.');
      } else {
        toast.success(`${data.readyCount}건 모두 등록할 수 있습니다.`);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!threadPostsFile || !validation || validation.readyCount === 0 || isSaving) return;
    const failedMessage = validation.failedCount > 0
      ? `\n검증 실패 ${validation.failedCount}건은 저장되지 않습니다.`
      : '';
    if (!await confirm({
      title: '쓰레드 포스트 일괄 등록',
      message: `검증을 통과한 쓰레드 포스트 ${validation.readyCount}건을 등록하시겠습니까?${failedMessage}`,
      confirmLabel: '등록'
    })) return;

    setIsSaving(true);
    try {
      const response = await storeThreadPostImportApi.save(threadPostsFile);
      setSaveResult(response.data);
      if (response.data.failedCount > 0) {
        toast.warning(`${response.data.savedCount}건 저장, ${response.data.failedCount}건 실패했습니다.`);
      } else {
        toast.success(`${response.data.savedCount}건을 등록했습니다.`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = !!validation && validation.readyCount > 0 && !saveResult;
  const currentStep = validation || saveResult ? 3 : threadPostsFile ? 2 : 1;

  return (
    <div>
      <PageHeader description="CSV 파일을 검증한 뒤 여러 가게의 Threads 포스트를 한 번에 등록합니다."
        actions={<button className="btn btn-outline-primary" onClick={handleSampleDownload}>
          <i className="bi bi-download me-2"/>샘플 CSV 다운로드
        </button>}/>

      <ImportSteps labels={['파일 준비', '사전 검증', '포스트 등록']} currentStep={currentStep}/>

      <div className="alert alert-info">
        <strong><i className="bi bi-info-circle-fill me-2"/>등록 전 확인해주세요</strong>
        <div className="small mt-1">
          <code>import_key</code>, <code>perma_link</code> 컬럼을 UTF-8로 작성합니다.
          <code>import_key</code>는 가게 탭에서 가게를 등록할 때 사용한 값이며, 이미 등록된 포스트는 건너뜁니다.
        </div>
      </div>

      <SectionCard title="CSV 파일 선택" icon="bi-file-earmark-spreadsheet-fill">
        <div className="row g-3">
          <div className="col-12">
            <CsvFilePicker id="thread-posts-file" title="쓰레드 포스트 파일" expectedName={SAMPLE_FILE_NAME}
                           file={threadPostsFile} disabled={isValidating || isSaving} onChange={handleFileChange}/>
          </div>
        </div>
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mt-4 pt-3 border-top">
          <span className="form-field__hint mb-0">파일을 변경하면 기존 검증 결과가 초기화됩니다.</span>
          <button className="btn btn-primary" disabled={!threadPostsFile || isValidating || isSaving} onClick={handleValidate}>
            {isValidating && <span className="spinner-border spinner-border-sm me-2"/>}
            {isValidating ? '데이터 검증 중...' : <><i className="bi bi-shield-check me-1"/>파일 사전 검증</>}
          </button>
        </div>
      </SectionCard>

      {validation && (
        <SectionCard title="검증 결과" icon="bi-clipboard2-check-fill">
          <div className="row g-3 mb-4">
            <ImportResultMetric colClassName="col-6 col-lg-3" label="전체" value={validation.totalCount} icon="bi-list-check" color="secondary"/>
            <ImportResultMetric colClassName="col-6 col-lg-3" label="등록 가능" value={validation.readyCount} icon="bi-check-circle-fill" color="success"/>
            <ImportResultMetric colClassName="col-6 col-lg-3" label="건너뜀" value={validation.skippedCount} icon="bi-skip-forward-fill" color="secondary"/>
            <ImportResultMetric colClassName="col-6 col-lg-3" label="검증 실패" value={validation.failedCount} icon="bi-exclamation-triangle-fill" color="danger"/>
          </div>
          <ImportErrorList errors={validation.errors}/>
          {validation.failedCount > 0 && (
            <div className="alert alert-warning">
              실패 항목은 저장되지 않으며, 등록 가능한 항목은 계속 등록할 수 있습니다.
            </div>
          )}
          <ResultTable rows={validation.results.map(result => ({
            ...result,
            ...VALIDATION_STATUS[result.status],
          }))}/>
        </SectionCard>
      )}

      <SectionCard title="쓰레드 포스트 등록" icon="bi-cloud-arrow-up-fill">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div><strong>{validation ? `등록 가능한 쓰레드 포스트 ${validation.readyCount}건` : '사전 검증이 필요합니다'}</strong>
            <p className="form-field__hint mb-0">검증한 파일을 변경하지 않고 등록해주세요.</p></div>
          <button className="btn btn-success btn-lg" disabled={!canSave || isSaving} onClick={handleSave}>
            {isSaving && <span className="spinner-border spinner-border-sm me-2"/>}
            {isSaving ? '포스트 등록 중...' : <><i className="bi bi-check2-circle me-1"/>검증 파일 등록</>}
          </button>
        </div>
        {saveResult && (
          <div className="mt-4">
            <div className={`alert ${saveResult.failedCount > 0 ? 'alert-warning' : 'alert-success'}`}>
              <strong>
                등록 결과: 저장 {saveResult.savedCount}건 / 건너뜀 {saveResult.skippedCount}건 / 실패 {saveResult.failedCount}건
              </strong>
            </div>
            <ImportErrorList errors={saveResult.errors}/>
            <ResultTable showPostId rows={saveResult.results.map(result => ({
              ...result,
              ...SAVE_STATUS[result.status],
            }))}/>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

const ImportErrorList = ({errors}: { errors?: StoreFileImportError[] }) => {
  if (!errors?.length) return null;
  return (
    <div className="alert alert-danger">
      <strong className="d-block mb-1"><i className="bi bi-x-octagon-fill me-2"/>파일 오류</strong>
      <ul className="mb-0 ps-3 small">
        {errors.map((error, index) => <li key={`${error.code}-${index}`}>{formatImportError(error)}</li>)}
      </ul>
    </div>
  );
};

interface ResultRow {
  importKey: string;
  row: number;
  storeId: number | null;
  postId?: number | null;
  permaLink: string;
  error: string | null;
  label: string;
  badge: string;
}

const ResultTable = ({rows, showPostId = false}: { rows: ResultRow[]; showPostId?: boolean }) => (
  <div className="table-responsive">
    <table className="table table-sm table-bordered align-middle mb-0 small">
      <thead className="table-light">
      <tr>
        <th className="text-nowrap">행</th>
        <th className="text-nowrap">importKey</th>
        <th className="text-nowrap">상태</th>
        <th className="text-nowrap">가게 ID</th>
        {showPostId && <th className="text-nowrap">포스트 ID</th>}
        <th>Threads 링크</th>
        <th>사유</th>
      </tr>
      </thead>
      <tbody>
      {rows.length ? rows.map((row, index) => (
        <tr key={`${row.importKey}-${row.row}-${index}`}>
          <td>{row.row}</td>
          <td className="font-monospace text-nowrap">{row.importKey || '-'}</td>
          <td><span className={`badge ${row.badge}`}>{row.label}</span></td>
          <td>{row.storeId ?? '-'}</td>
          {showPostId && <td>{row.postId ?? '-'}</td>}
          <td className="text-break">
            {row.permaLink
              ? <a href={row.permaLink} target="_blank" rel="noopener noreferrer">{row.permaLink}</a>
              : '-'}
          </td>
          <td className={row.error ? 'text-danger' : 'text-muted'}>{row.error || '-'}</td>
        </tr>
      )) : (
        <tr>
          <td colSpan={showPostId ? 7 : 6} className="text-center text-muted">결과 없음</td>
        </tr>
      )}
      </tbody>
    </table>
  </div>
);

export default ThreadPostImportPanel;
