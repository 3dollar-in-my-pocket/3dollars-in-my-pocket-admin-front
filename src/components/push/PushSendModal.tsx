import {useEffect, useState} from 'react';
import {Modal, Button, Form, Alert} from 'react-bootstrap';
import {toast} from 'react-toastify';
import {usePushForm} from '../../hooks/usePushForm';
import PushFormFields from './PushFormFields';
import PushPreview from './PushPreview';
import {getOsPlatformDisplayName} from '../../types/push';

interface PushSendModalProps {
  show: boolean;
  onHide: () => void;
  initialUserIds?: number[];
}

const PushSendModal = ({show, onHide, initialUserIds = []}: PushSendModalProps) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const {
    formData,
    searchState,
    selectedUsers,
    uiState,
    targetOsPlatforms,
    updateFormData,
    updateNicknameSearch,
    searchUserByNickname,
    handleAddUser,
    handleRemoveUser,
    isUserSelected,
    uploadImage,
    removeImage,
    showSendConfirm,
    hideSendConfirm,
    confirmSendPush,
    canSend,
    toggleOsPlatform,
    resetForm
  } = usePushForm();

  useEffect(() => {
    if (show && initialUserIds.length > 0) {
      updateFormData('accountIdsInput', initialUserIds.join(', '));
    }
  }, [show, initialUserIds]);

  const handleConfirmSend = async () => {
    const success = await confirmSendPush();
    if (success) {
      toast.success('푸시가 성공적으로 발송되었습니다.');
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
    setShowPreviewModal(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-send-fill me-2"></i>
          푸시 발송
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <PushFormFields
            formData={formData}
            searchState={searchState}
            selectedUsers={selectedUsers}
            uiState={uiState}
            targetOsPlatforms={targetOsPlatforms}
            updateFormData={updateFormData}
            updateNicknameSearch={updateNicknameSearch}
            searchUserByNickname={searchUserByNickname}
            handleAddUser={handleAddUser}
            handleRemoveUser={handleRemoveUser}
            isUserSelected={isUserSelected}
            uploadImage={uploadImage}
            removeImage={removeImage}
            toggleOsPlatform={toggleOsPlatform}
          />

          <div className="d-grid gap-2 mt-3">
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => setShowPreviewModal(true)}
              className="py-2 fw-semibold"
            >
              <i className="bi bi-eye me-2"></i>
              미리보기
            </Button>
          </div>

          {uiState.result && (
            <Alert variant={uiState.result.type} className="mt-3 mb-0">
              {uiState.result.message}
            </Alert>
          )}

          <div className="bg-light rounded-3 p-3 mt-3">
            <h6 className="fw-semibold text-secondary mb-2">
              <i className="bi bi-lightbulb me-1"></i>사용 가이드
            </h6>
            <ul className="small text-muted mb-0 ps-3">
              <li><strong>푸시 타입:</strong> 정보성 푸시 vs 마케팅 푸시 선택</li>
              <li><strong>사용자 검색:</strong> 닉네임으로 검색하여 대상에 추가</li>
              <li><strong>미리보기:</strong> 미리보기 버튼을 클릭하여 푸시 알림 모습 확인</li>
              <li><strong>제한사항:</strong> 제목 50자, 내용 200자까지 입력 가능</li>
            </ul>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          <i className="bi bi-x-lg me-1"></i>
          취소
        </Button>
        <Button
          variant="primary"
          onClick={showSendConfirm}
          disabled={!canSend()}
        >
          <i className="bi bi-send me-2"></i>
          푸시 발송
        </Button>
      </Modal.Footer>

      {/* 미리보기 모달 */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-phone me-2 text-primary"></i>
            푸시 알림 미리보기
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center py-4">
          <PushPreview
            title={formData.title}
            body={formData.body}
            path={formData.path}
            pushType={formData.pushType}
            imageUrl={formData.imageUrl}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            <i className="bi bi-x-lg me-1"></i>
            닫기
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowPreviewModal(false);
              showSendConfirm();
            }}
            disabled={!canSend()}
          >
            <i className="bi bi-send me-1"></i>
            발송하기
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 푸시 발송 확인 모달 */}
      <Modal show={uiState.showConfirm} onHide={hideSendConfirm} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-send-check me-2 text-primary"></i>
            푸시 발송 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <div className="text-center mb-4">
                <div className="text-warning fs-1 mb-3">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <h5 className="text-dark mb-3">정말로 푸시를 발송하시겠습니까?</h5>
                <p className="text-muted mb-0">발송된 푸시는 취소할 수 없습니다.</p>
              </div>

              <div className="bg-light rounded p-3 mb-3">
                <h6 className="fw-semibold mb-2 text-dark">발송 정보</h6>
                <div className="small">
                  <div className="mb-1">
                    <strong>푸시
                      타입:</strong> {formData.pushType === 'SIMPLE' ? '정보성 푸시' : formData.pushType === 'SIMPLE_MARKETING' ? '광고성 푸시' : '미선택'}
                  </div>
                  <div className="mb-1">
                    <strong>제목:</strong> {formData.title || '(제목 없음)'}
                  </div>
                  <div className="mb-1">
                    <strong>내용:</strong> {formData.body || '(내용 없음)'}
                  </div>
                  <div className="mb-1">
                    <strong>이동 경로:</strong> {formData.path || '(없음)'}
                  </div>
                  <div className="mb-1">
                    <strong>이미지:</strong> {formData.imageUrl ? '첨부됨' : '(없음)'}
                  </div>
                  <div className="mb-1">
                    <strong>발송
                      대상:</strong> {formData.targetType === "USER" ? "유저" : "사장님"} - {selectedUsers.length > 0 ? `${selectedUsers.length}명 선택됨` : '직접 입력된 ID'}
                  </div>
                  <div>
                    <strong>대상
                      OS:</strong> {Array.from(targetOsPlatforms).map(p => getOsPlatformDisplayName(p)).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <div>
                <h6 className="text-center mb-3 text-dark fw-semibold">미리보기</h6>
                <div style={{
                  width: "200px",
                  height: "350px",
                  backgroundColor: "#000",
                  borderRadius: "15px",
                  padding: "5px",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
                }}>
                  <div style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <div style={{
                      height: "20px",
                      backgroundColor: "#000",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 10px",
                      fontSize: "8px",
                      color: "#fff",
                      fontWeight: "500"
                    }}>
                      <span>9:41</span>
                      <span>🔋 100%</span>
                    </div>

                    <div style={{
                      backgroundColor: formData.pushType === 'SIMPLE' ? '#1e1e20' : '#2d2d30',
                      margin: "8px",
                      borderRadius: "8px",
                      padding: "10px",
                      border: formData.pushType === 'SIMPLE' ? '1px solid #2d2d30' : '1px solid #3d3d40',
                      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.3)"
                    }}>
                      <div className="d-flex align-items-center mb-2">
                        <div style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: "#007AFF",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "6px"
                        }}>
                          <span style={{color: "white", fontSize: "8px", fontWeight: "bold"}}>3</span>
                        </div>
                        <span style={{color: "#fff", fontSize: "9px", fontWeight: "500"}}>
                          가슴속 3천원{formData.pushType === 'SIMPLE_MARKETING' ? ' (마케팅)' : ''}
                        </span>
                        <span style={{color: "#8e8e93", fontSize: "8px", marginLeft: "auto"}}>
                          지금
                        </span>
                      </div>

                      <div style={{color: "#fff"}}>
                        {formData.imageUrl && (
                          <div style={{
                            marginBottom: "8px",
                            borderRadius: "5px",
                            overflow: "hidden"
                          }}>
                            <img
                              src={formData.imageUrl}
                              alt="푸시 이미지"
                              style={{
                                width: "100%",
                                height: "60px",
                                objectFit: "cover",
                                display: "block"
                              }}
                            />
                          </div>
                        )}

                        <div style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          marginBottom: "3px",
                          lineHeight: "1.3"
                        }}>
                          {formData.title || "푸시 제목이 여기에 표시됩니다"}
                        </div>
                        <div style={{
                          fontSize: "9px",
                          color: "#d1d1d6",
                          lineHeight: "1.4"
                        }}>
                          {formData.body || "푸시 메시지 내용이 여기에 표시됩니다."}
                        </div>
                        {formData.path && (
                          <div style={{
                            fontSize: "8px",
                            color: "#007AFF",
                            marginTop: "5px",
                            padding: "2px 5px",
                            backgroundColor: "rgba(0, 122, 255, 0.1)",
                            borderRadius: "3px",
                            display: "inline-block"
                          }}>
                            📱 {formData.path}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{
                      position: "absolute",
                      bottom: "15px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: "#8e8e93",
                      fontSize: "7px",
                      textAlign: "center"
                    }}>
                      탭하여 앱에서 보기
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="bg-success-subtle rounded p-3">
              <h6 className="fw-semibold mb-2 text-success">선택된 사용자</h6>
              <div className="d-flex flex-wrap gap-1">
                {selectedUsers.slice(0, 5).map((user) => (
                  <span key={user.id} className="badge bg-success-subtle text-success border border-success">
                    {user.nickname}
                  </span>
                ))}
                {selectedUsers.length > 5 && (
                  <span className="badge bg-secondary">+{selectedUsers.length - 5}명 더</span>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideSendConfirm}>
            <i className="bi bi-x-lg me-1"></i>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmSend}
            disabled={uiState.loading}
          >
            {uiState.loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                발송 중...
              </>
            ) : (
              <>
                <i className="bi bi-send me-1"></i>
                발송 확인
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default PushSendModal;
