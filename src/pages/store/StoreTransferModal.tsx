import {FormEvent, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeApi from '@/api/storeApi';
import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import useConfirm from '@/hooks/useConfirm';
import {STORE_STATUS, STORE_TYPE, StoreDetail, StoreTransferResult} from '@/types/store';

interface StoreTransferModalProps {
  show: boolean;
  onHide: () => void;
  /** 데이터를 가져올 원본 가게 (현재 상세 모달의 가게) */
  sourceStore: { storeId: number; name: string };
  /** 이관 성공 콜백 (원본 가게 상세 갱신용) */
  onTransferred: () => void;
  /** 이관 후 원본 가게 삭제 요청. warning은 삭제 확인 문구에 덧붙일 안내입니다. */
  onRequestDeleteSource: (warning?: string) => void;
}

/** 대상을 바꿔야 해결되는 실패. 같은 요청을 다시 보내도 결과가 같으므로 재시도를 제공하지 않습니다. */
const NON_RETRYABLE_ERRORS = ['same_store_data_transfer', 'invalid_parameter', 'not_exists_store'];

const TRANSFER_ERROR_MESSAGES: Record<string, string> = {
  // 서버는 원본/대상, 미존재/사장님 가게/삭제 상태를 구분하지 않고 같은 404를 내립니다.
  not_exists_store: '원본 또는 대상 가게를 확인해주세요. (존재하지 않거나, 사장님 가게이거나, 대상 가게가 삭제된 상태)'
};

const RETRYABLE_ERROR_MESSAGE =
  '이관 중 오류가 발생했거나 응답이 지연되었습니다. 일부만 이관되었을 수 있습니다. '
  + '잠시 후 다시 시도하면 원본에 남은 데이터를 이어서 이관합니다.';

const isDeletedStatus = (status: string) =>
  status === STORE_STATUS.DELETED || status === STORE_STATUS.AUTO_DELETED;

/** 대상 가게로 쓸 수 없는 이유를 반환합니다. 서버 404가 사유를 구분하지 않아 미리 안내합니다. */
const getTargetInvalidReason = (target: StoreDetail): string | null => {
  if (target.storeType !== STORE_TYPE.USER_STORE) return '사장님 가게는 대상 가게로 선택할 수 없습니다.';
  if (isDeletedStatus(target.status)) return '삭제된 가게는 대상 가게로 선택할 수 없습니다.';
  return null;
};

const StoreTransferModal = ({
                              show,
                              onHide,
                              sourceStore,
                              onTransferred,
                              onRequestDeleteSource
                            }: StoreTransferModalProps) => {
  const confirm = useConfirm();
  const [targetIdInput, setTargetIdInput] = useState('');
  const [target, setTarget] = useState<StoreDetail | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [result, setResult] = useState<StoreTransferResult | null>(null);

  const targetInvalidReason = target ? getTargetInvalidReason(target) : null;

  const handleClose = () => {
    if (isTransferring) return;
    setTargetIdInput('');
    setTarget(null);
    setLookupError(null);
    setTransferError(null);
    setResult(null);
    onHide();
  };

  const handleTargetInputChange = (value: string) => {
    setTargetIdInput(value.replace(/\D/g, ''));
    // 입력이 바뀌면 이전 조회 결과로 실행되지 않도록 초기화합니다.
    setTarget(null);
    setLookupError(null);
    setTransferError(null);
  };

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!targetIdInput || isLookingUp) return;

    if (Number(targetIdInput) === sourceStore.storeId) {
      setLookupError('원본 가게와 대상 가게가 같습니다.');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    try {
      const response = await storeApi.getStoreDetail(targetIdInput, {suppressToast: true});
      if (!response.ok || !response.data) {
        setLookupError(response.message || '가게를 찾을 수 없습니다.');
        return;
      }
      setTarget(response.data);
    } finally {
      setIsLookingUp(false);
    }
  };

  const runTransfer = async () => {
    if (!target || isTransferring) return;

    setIsTransferring(true);
    setTransferError(null);
    try {
      const response = await storeApi.transferStoreData(String(sourceStore.storeId), target.storeId);
      if (response.ok) {
        setResult(response.data);
        toast.success('가게 데이터 이관이 완료되었습니다.');
        onTransferred();
        return;
      }

      const retryable = !NON_RETRYABLE_ERRORS.includes(response.error);
      setTransferError({
        message: retryable
          ? RETRYABLE_ERROR_MESSAGE
          : TRANSFER_ERROR_MESSAGES[response.error] || response.message || '이관에 실패했습니다.',
        retryable
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleTransfer = async () => {
    if (!target || targetInvalidReason) return;

    const confirmed = await confirm({
      title: '가게 데이터 이관',
      message: '원본 가게의 리뷰·이미지·방문 인증·즐겨찾기를 대상 가게로 이관합니다.\n'
        + '원본 가게는 삭제되지 않으며, 필요하면 이관 후 별도로 삭제해주세요.',
      details: [
        {label: '원본 가게', value: `${sourceStore.name} (#${sourceStore.storeId})`},
        {label: '대상 가게', value: `${target.name} (#${target.storeId})`}
      ],
      confirmLabel: '이관',
      variant: 'danger',
      irreversible: true
    });
    if (!confirmed) return;

    await runTransfer();
  };

  const handleDeleteSource = () => {
    const remainingVisits = result?.visit.skippedCount ?? 0;
    onRequestDeleteSource(
      remainingVisits > 0 ? `원본 가게에 이관되지 않은 방문 기록 ${remainingVisits}건이 남아 있습니다.` : undefined
    );
  };

  const isEmptyResult = result
    && [
      result.review.transferredCount,
      result.image.transferredCount,
      result.visit.transferredCount,
      result.visit.skippedCount,
      result.favorite.transferredCount,
      result.favorite.skippedCount
    ].every(count => count === 0);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="app-modal"
      backdrop={isTransferring ? 'static' : true}
      keyboard={!isTransferring}
    >
      <Modal.Header closeButton={!isTransferring}>
        <Modal.Title>다른 가게로 합치기</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <dl className="row mb-3">
          <dt className="col-4 text-body-secondary fw-normal">원본 가게</dt>
          <dd className="col-8 mb-0 text-truncate">
            {sourceStore.name} <span className="font-monospace text-body-secondary">#{sourceStore.storeId}</span>
          </dd>
        </dl>

        {result ? (
          <>
            {isEmptyResult ? (
              <div className="alert alert-secondary py-2">더 이관할 데이터가 없습니다.</div>
            ) : (
              <table className="table table-sm mb-2">
                <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col" className="text-end">이관</th>
                  <th scope="col">비고</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>리뷰</td>
                  <td className="text-end">{result.review.transferredCount}건</td>
                  <td/>
                </tr>
                <tr>
                  <td>이미지</td>
                  <td className="text-end">{result.image.transferredCount}건</td>
                  <td/>
                </tr>
                <tr>
                  <td>방문 인증</td>
                  <td className="text-end">{result.visit.transferredCount}건</td>
                  <td className="small">
                    {result.visit.skippedCount > 0
                      && `같은 날 중복으로 원본에 남은 방문 ${result.visit.skippedCount}건`}
                  </td>
                </tr>
                <tr>
                  <td>즐겨찾기</td>
                  <td className="text-end">{result.favorite.transferredCount}건</td>
                  <td className="small">
                    {result.favorite.skippedCount > 0
                      && `중복으로 삭제된 원본 즐겨찾기 ${result.favorite.skippedCount}건`}
                  </td>
                </tr>
                </tbody>
              </table>
            )}
            <p className="small text-body-secondary mb-0">
              원본 가게는 삭제되지 않았습니다. 정리하려면 원본 가게를 삭제해주세요.
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleLookup}>
              <label htmlFor="transfer-target-id" className="form-label">대상 가게 ID</label>
              <div className="input-group">
                <input
                  id="transfer-target-id"
                  className={`form-control${lookupError ? ' is-invalid' : ''}`}
                  inputMode="numeric"
                  placeholder="데이터를 받을 가게 ID"
                  value={targetIdInput}
                  onChange={e => handleTargetInputChange(e.target.value)}
                  disabled={isTransferring}
                />
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  disabled={!targetIdInput || isLookingUp || isTransferring}
                >
                  {isLookingUp ? '조회 중...' : '조회'}
                </button>
                {lookupError && <div className="invalid-feedback">{lookupError}</div>}
              </div>
            </form>

            {target && (
              <div className="border rounded p-3 mt-3">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <strong className="text-truncate">{target.name}</strong>
                  <span className="font-monospace text-body-secondary">#{target.storeId}</span>
                  <StoreTypeBadge storeType={target.storeType} size="sm" bordered className="ms-auto"/>
                </div>
                <div className="d-flex align-items-center gap-2 small text-body-secondary">
                  <StoreStatusBadge status={target.status}/>
                  <span className="text-truncate">{target.address?.fullAddress || '주소 정보 없음'}</span>
                </div>
                {targetInvalidReason && (
                  <div className="text-danger small mt-2" role="alert">{targetInvalidReason}</div>
                )}
              </div>
            )}

            {isTransferring && (
              <div className="alert alert-info py-2 mt-3 mb-0 small" role="status">
                <span className="spinner-border spinner-border-sm me-2"/>
                이관 중입니다. 데이터가 많으면 시간이 걸릴 수 있으니 창을 닫지 마세요.
              </div>
            )}

            {transferError && (
              <div className="alert alert-danger py-2 mt-3 mb-0 small" role="alert">{transferError.message}</div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={handleClose} disabled={isTransferring}>
          닫기
        </button>
        {result ? (
          <button type="button" className="btn btn-outline-danger" onClick={handleDeleteSource}>
            <i className="bi bi-trash me-1"/>
            원본 가게 삭제
          </button>
        ) : transferError?.retryable ? (
          <button type="button" className="btn btn-danger" onClick={runTransfer} disabled={isTransferring}>
            {isTransferring ? '이관 중...' : '다시 시도'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleTransfer}
            disabled={!target || Boolean(targetInvalidReason) || isTransferring}
          >
            {isTransferring ? '이관 중...' : '이관 실행'}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default StoreTransferModal;
