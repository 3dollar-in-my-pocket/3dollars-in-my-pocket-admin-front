import {getOsPlatformBadgeClass, getOsPlatformDisplayName, getOsPlatformIcon} from '@/utils/display/deviceDisplay';
import {Form, Modal} from "react-bootstrap";
import registrationApi from "@/api/registrationApi";
import {useEffect, useState} from "react";
import enumApi from "@/api/enumApi";
import {toast} from "react-toastify";
import DetailField from "@/components/common/DetailField";
import {BossRegistration} from "@/types/registration";
import {formatDateTimeKo as formatDateTime} from "@/utils/dateUtils";

/** enum API(BossRegistrationRejectReason) 응답 항목 */
interface RejectReasonOption {
  key: string;
  description: string;
}

interface RegistrationModalProps {
  show: boolean;
  onHide: () => void;
  registration: BossRegistration | null;
}

const RegistrationModal = ({show, onHide, registration}: RegistrationModalProps) => {
  const [rejectReasons, setRejectReasons] = useState<RejectReasonOption[]>([]);
  const [selectedRejectReason, setSelectedRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    enumApi.getEnum().then(response => {
        if (!response.ok) {
          return
        }
        setRejectReasons(response.data["BossRegistrationRejectReason"])
      }
    );
  }, [registration]);

  if (!registration) return null;

  const {boss, store, context, createdAt} = registration;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const response = await registrationApi.approveRegistration({id: registration.registrationId});
      if (!response.ok) {
        return;
      }
      toast.info("가입 신청이 승인되었습니다.");
      setShowApproveModal(false);
      onHide();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRejectReason) {
      toast.warn("거절 사유를 선택해주세요.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await registrationApi.denyRegistration({
        id: registration.registrationId,
        rejectReason: selectedRejectReason,
      });
      if (!response.ok) {
        return;
      }
      toast.info("가입 신청이 거절되었습니다.");
      setShowRejectModal(false);
      onHide();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg" className="app-modal" scrollable>
        <Modal.Header closeButton>
          <div className="min-w-0">
            <Modal.Title as="h2">
              <i className="bi bi-clipboard-check"/>
              가입 신청 상세
            </Modal.Title>
            <p className="app-modal__subtitle font-monospace">{registration.registrationId}</p>
          </div>
        </Modal.Header>

        <Modal.Body>
          {/* 대표자 정보 */}
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-person-vcard"/>
              대표자 정보
            </h3>
            <div className="row g-3">
              <DetailField label="이름" className="col-6 col-md-4">
                {boss.name}
              </DetailField>
              <DetailField label="소셜 타입" className="col-6 col-md-4">
                {boss.socialType}
              </DetailField>
              <DetailField label="사업자 번호" className="col-12 col-md-4" monospace>
                {boss.businessNumber}
              </DetailField>
            </div>
          </div>

          {/* 가게 정보 */}
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-shop"/>
              가게 정보
            </h3>
            <div className="row g-3">
              <DetailField label="가게명" className="col-12 col-md-6">
                {store.name}
              </DetailField>
              <DetailField label="카테고리" className="col-12 col-md-6">
                {store.categories.length > 0 ? (
                  <span className="d-flex flex-wrap gap-1">
                    {store.categories.map((category) => (
                      <span key={category} className="badge text-bg-light">{category}</span>
                    ))}
                  </span>
                ) : null}
              </DetailField>
              <DetailField label="인증 사진" className="col-12" placeholder="사진 없음">
                {store.certificationPhotoUrl ? (
                  <a
                    href={store.certificationPhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-block mt-1"
                    title="새 창에서 원본 보기"
                  >
                    <img
                      src={store.certificationPhotoUrl}
                      alt="인증 사진"
                      className="registration-photo"
                    />
                  </a>
                ) : null}
              </DetailField>
            </div>
          </div>

          {/* 신청 정보 */}
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-clock-history"/>
              신청 정보
            </h3>
            <div className="row g-3">
              <DetailField label="신청일" className="col-12 col-md-4">
                {formatDateTime(createdAt)}
              </DetailField>
              <DetailField label="OS" className="col-6 col-md-4">
                {context?.osPlatform ? (
                  <span className={`badge ${getOsPlatformBadgeClass(context.osPlatform)}`}>
                    <i className={`bi ${getOsPlatformIcon(context.osPlatform)} me-1`}/>
                    {getOsPlatformDisplayName(context.osPlatform)}
                  </span>
                ) : null}
              </DetailField>
              <DetailField label="앱 버전" className="col-6 col-md-4" monospace>
                {context?.appVersion ? `v${context.appVersion}` : null}
              </DetailField>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-outline-secondary me-auto" onClick={onHide}>
            닫기
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
          >
            <i className="bi bi-x-circle me-1"/>
            거절
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowApproveModal(true)}
            disabled={isProcessing}
          >
            <i className="bi bi-check2-circle me-1"/>
            승인
          </button>
        </Modal.Footer>
      </Modal>

      {/* 거절 사유 선택 */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered className="app-modal">
        <Modal.Header closeButton>
          <Modal.Title as="h2">
            <i className="bi bi-x-circle"/>
            거절 사유 선택
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="form-label" htmlFor="reject-reason">거절 사유</label>
          <Form.Select
            id="reject-reason"
            value={selectedRejectReason}
            onChange={(e) => setSelectedRejectReason(e.target.value)}
          >
            <option value="">거절 사유를 선택하세요</option>
            {rejectReasons.map((reason) => (
              <option key={reason.key} value={reason.key}>
                {reason.description}
              </option>
            ))}
          </Form.Select>
          <p className="form-text mt-2">
            <strong>{store.name}</strong>의 가입 신청을 거절합니다. 거절 후에는 되돌릴 수 없습니다.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowRejectModal(false)}
            disabled={isProcessing}
          >
            취소
          </button>
          <button
            className="btn btn-danger"
            onClick={handleConfirmReject}
            disabled={!selectedRejectReason || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
                처리 중...
              </>
            ) : '거절 확정'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 승인 확인 */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered className="app-modal">
        <Modal.Header closeButton>
          <Modal.Title as="h2">
            <i className="bi bi-check2-circle"/>
            승인 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            <strong>{store.name}</strong>({boss.name})의 가입 신청을 승인하시겠습니까?
          </p>
          <p className="form-text mt-2 mb-0">승인 후에는 되돌릴 수 없습니다.</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowApproveModal(false)}
            disabled={isProcessing}
          >
            취소
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
                처리 중...
              </>
            ) : '승인 확정'}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RegistrationModal;
