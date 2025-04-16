import {Button, Form, Modal} from "react-bootstrap";
import registrationApi from "../../api/registrationApi";
import {useEffect, useState} from "react";
import enumApi from "../../api/enumApi";
import {toast} from "react-toastify";

const RegistrationModal = ({show, onHide, registration}) => {
    const [rejectReasons, setRejectReasons] = useState([]);
    const [selectedRejectReason, setSelectedRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);

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

    const {boss, store, createdAt} = registration;

    const handleApprove = async () => {
        await registrationApi.approveRegistration({id: registration.registrationId})
            .then(response => {
                if (!response.ok) {
                    return
                }
                toast.info("가입 신청이 승인되었습니다.");
                onHide();
                setShowRejectModal(false);
            });
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        if (!selectedRejectReason) {
            toast.warn("거절 사유를 선택해주세요.");
            return;
        }

        registrationApi.denyRegistration({
            id: registration.registrationId,
            rejectReason: selectedRejectReason,
        }).then(response => {
            if (!response.ok) {
                return
            }
            toast.info("가입 신청이 거절되었습니다.");
            onHide();
            setShowRejectModal(false);
        });
    };

    const confirmApprove = () => {
        setShowApproveModal(true);
    };

    const handleConfirmApprove = async () => {
        await handleApprove();
        setShowApproveModal(false);
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString("ko-KR");

    return (
        <>
            <Modal show={show} onHide={onHide} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>📋 가입 신청 상세</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <section className="mb-4">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">👤 대표자 정보</h5>
                        <ul className="list-unstyled ps-1">
                            <li>
                                <strong>이름:</strong> {boss.name}
                            </li>
                            <li>
                                <strong>소셜 타입:</strong> {boss.socialType}
                            </li>
                            <li>
                                <strong>사업자 번호:</strong> {boss.businessNumber}
                            </li>
                        </ul>
                    </section>

                    <section className="mb-4">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">🏪 가게 정보</h5>
                        <ul className="list-unstyled ps-1">
                            <li>
                                <strong>가게명:</strong> {store.name}
                            </li>
                            <li>
                                <strong>카테고리:</strong> {store.categories.join(", ")}
                            </li>
                            <li className="mt-3">
                                <strong>인증 사진:</strong>
                                <br/>
                                <img
                                    src={store.certificationPhotoUrl}
                                    alt="인증 사진"
                                    className="img-fluid rounded shadow-sm mt-2"
                                    style={{maxHeight: "300px"}}
                                />
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h6 className="fw-bold border-bottom pb-2 mb-3">🕒 신청 정보</h6>
                        <ul className="list-unstyled ps-1">
                            <li>
                                <strong>신청일:</strong> {formatDate(createdAt)}
                            </li>
                        </ul>
                    </section>
                </Modal.Body>

                <Modal.Footer>
                    <div className="me-auto">
                        <Button variant="success" onClick={confirmApprove} className="me-2" size="lg">
                            ✅ 승인
                        </Button>
                        <Button variant="danger" onClick={handleReject} size="lg">
                            ❌ 거절
                        </Button>
                    </div>
                    <Button variant="secondary" onClick={onHide} size="lg">
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>거절 사유 선택</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Select
                        value={selectedRejectReason}
                        onChange={(e) => setSelectedRejectReason(e.target.value)}
                        aria-label="거절 사유 선택"
                        size="lg"
                    >
                        <option value="">거절 사유를 선택하세요</option>
                        {rejectReasons.map((reason) => (
                            <option key={reason.key} value={reason.key}>
                                {reason.description}
                            </option>
                        ))}
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)} size="lg">
                        취소
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmReject}
                        size="lg"
                        disabled={!selectedRejectReason}
                    >
                        거절 확정
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>승인 확인</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>정말로 이 가입 신청을 승인하시겠습니까?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApproveModal(false)} size="lg">
                        취소
                    </Button>
                    <Button variant="success" onClick={handleConfirmApprove} size="lg">
                        승인 확정
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default RegistrationModal;
