import React from 'react';
import {Button, Modal} from 'react-bootstrap';

export interface ConfirmOptions {
  /** 모달 제목 */
  title?: string;
  /** 본문 메시지. 줄바꿈(\n)은 그대로 렌더링됩니다. */
  message: string;
  /** 강조해서 보여줄 상세 항목 (예: 작성자, 등록일) */
  details?: { label: string; value: string }[];
  /** 되돌릴 수 없는 작업임을 알리는 경고 문구 노출 여부 */
  irreversible?: boolean;
  /** 확인 버튼 라벨 */
  confirmLabel?: string;
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 확인 버튼 스타일. 파괴적 작업은 'danger'를 사용하세요. */
  variant?: 'primary' | 'danger' | 'warning';
}

interface ConfirmModalProps extends ConfirmOptions {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 확인 모달
 *
 * `useConfirm` 훅을 통해 사용하세요. 직접 렌더링할 필요는 없습니다.
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                     show,
                                                     title = '확인',
                                                     message,
                                                     details,
                                                     irreversible = false,
                                                     confirmLabel = '확인',
                                                     cancelLabel = '취소',
                                                     variant = 'primary',
                                                     onConfirm,
                                                     onCancel
                                                   }) => {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title as="h5">
          {variant === 'danger' && <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>}
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-0" style={{whiteSpace: 'pre-line'}}>{message}</p>

        {details && details.length > 0 && (
          <dl className="row bg-light rounded p-3 mt-3 mb-0 small">
            {details.map(({label, value}) => (
              <React.Fragment key={label}>
                <dt className="col-4 text-muted fw-normal">{label}</dt>
                <dd className="col-8 mb-1 text-break">{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        )}

        {irreversible && (
          <p className="text-danger small mb-0 mt-3">
            <i className="bi bi-info-circle me-1"></i>
            이 작업은 되돌릴 수 없습니다.
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
