import {Alert, Button, Card, Container, Form, Modal, Nav, Tab} from "react-bootstrap";
import { usePushForm } from "../../hooks/usePushForm";
import PushPreview from "../../components/push/PushPreview";
import UserSearch from "../../components/push/UserSearch";

const PushManage = () => {
  const {
    formData,
    searchState,
    selectedUsers,
    uiState,
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
    canSend
  } = usePushForm();

  const handleUserToggle = (userId, nickname) => {
    if (isUserSelected(userId)) {
      handleRemoveUser(userId);
    } else {
      handleAddUser(userId, nickname);
    }
  };

  return (
    <Container className="py-4">
      <style>{`
        @media (max-width: 767px) {
          .push-preview-phone {
            width: 280px !important;
            height: 500px !important;
            padding-top: 20px !important;
          }
          .push-form-card {
            margin-bottom: 2rem;
          }
          .mobile-full-width {
            width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* 모바일 헤더 */}
      <div className="d-md-none mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-0">📣 푸시 발송</h2>
      </div>

      <div className="row h-100">
        {/* Mobile Preview */}
        <PushPreview
          title={formData.title}
          body={formData.body}
          path={formData.path}
          pushType={formData.pushType}
        />

        {/* Edit Form */}
        <div className="col-12 col-lg-7">
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="fw-bold text-dark mb-0 d-none d-md-block">📣 푸시 발송</h3>
              </div>

              <Form className="flex-grow-1 d-flex flex-column">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-tag me-2"></i>푸시 타입
                  </Form.Label>
                  <Form.Select
                    value={formData.pushType}
                    onChange={(e) => updateFormData("pushType", e.target.value)}
                    className="border-2"
                  >
                    <option value="SIMPLE">📢 기본 푸시</option>
                    <option value="SIMPLE_MARKETING">🎯 기본 마케팅 푸시</option>
                  </Form.Select>
                  <Form.Text className="text-muted small">
                    푸시 알림의 유형을 선택하세요
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-people me-2"></i>발송 대상
                  </Form.Label>
                  <Tab.Container activeKey={formData.targetType} onSelect={(key) => updateFormData("targetType", key)}>
                    <Nav variant="pills" className="mb-3">
                      <Nav.Item>
                        <Nav.Link eventKey="USER" className="px-4">
                          <i className="bi bi-person me-2"></i>유저
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="BOSS" className="px-4" disabled>
                          <i className="bi bi-briefcase me-2"></i>사장님 (준비중)
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content>
                      <Tab.Pane eventKey="USER">
                        <Form.Text className="text-muted small d-block mb-3">
                          일반 사용자에게 푸시를 발송합니다
                        </Form.Text>
                      </Tab.Pane>
                      <Tab.Pane eventKey="BOSS">
                        <Form.Text className="text-muted small d-block mb-3">
                          사장님 계정에게 푸시를 발송합니다 (준비중)
                        </Form.Text>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </Form.Group>

                {formData.targetType === "USER" && (
                  <UserSearch
                    nicknameSearch={searchState.nicknameSearch}
                    onNicknameChange={updateNicknameSearch}
                    onSearch={searchUserByNickname}
                    searchLoading={searchState.searchLoading}
                    searchResults={searchState.searchResults}
                    isUserSelected={isUserSelected}
                    onUserToggle={handleUserToggle}
                    selectedUsers={selectedUsers}
                    onUserRemove={handleRemoveUser}
                  />
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-people me-2"></i>대상 {formData.targetType === "USER" ? "사용자" : "사장님"} ID
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={formData.targetType === "USER"
                      ? "사용자 ID를 쉼표로 구분하여 입력하거나, 위에서 검색하여 추가하세요"
                      : "사장님 ID를 쉼표로 구분하여 입력하세요"
                    }
                    value={formData.accountIdsInput}
                    onChange={(e) => updateFormData("accountIdsInput", e.target.value)}
                    className="border-2"
                  />
                  <Form.Text className="text-muted small">
                    여러 {formData.targetType === "USER" ? "사용자" : "사장님"}에게 발송하려면 쉼표로 구분해주세요
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-type me-2"></i>제목 (선택)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="푸시 제목을 입력하세요"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    className="border-2"
                    maxLength={50}
                  />
                  <Form.Text className="text-muted small">
                    {formData.title.length}/50자 (제목과 내용 중 하나는 필수입니다)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-chat-text me-2"></i>내용 (선택)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="푸시 메시지 내용을 입력하세요"
                    value={formData.body}
                    onChange={(e) => updateFormData("body", e.target.value)}
                    className="border-2"
                    maxLength={200}
                  />
                  <Form.Text className="text-muted small">
                    {formData.body.length}/200자 (제목과 내용 중 하나는 필수입니다)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-image me-2"></i>푸시 이미지 (선택)
                  </Form.Label>
                  {formData.imageUrl ? (
                    <div className="border rounded p-3 bg-light">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <small className="text-success fw-medium">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          이미지가 업로드되었습니다
                        </small>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={removeImage}
                        >
                          <i className="bi bi-trash me-1"></i>제거
                        </Button>
                      </div>
                      <div className="text-center">
                        <img
                          src={formData.imageUrl}
                          alt="푸시 이미지 미리보기"
                          className="img-fluid rounded"
                          style={{ maxHeight: '200px', maxWidth: '100%' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) uploadImage(file);
                      }}
                      className="border-2"
                      disabled={uiState.uploading}
                    />
                  )}
                  <Form.Text className="text-muted small">
                    {uiState.uploading
                      ? "이미지 업로드 중..."
                      : "JPG, PNG 형식의 이미지를 업로드할 수 있습니다"
                    }
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-link-45deg me-2"></i>이동 경로 (선택)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="/home, /event 등"
                    value={formData.path}
                    onChange={(e) => updateFormData("path", e.target.value)}
                    className="border-2"
                  />
                  <Form.Text className="text-muted small">
                    푸시 터치 시 이동할 앱 화면 경로
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={showSendConfirm}
                    disabled={!canSend()}
                    className="py-3 fw-bold"
                  >
                    {uiState.loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        발송 중...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        푸시 발송
                      </>
                    )}
                  </Button>
                </div>

                {uiState.result && (
                  <Alert variant={uiState.result.type} className="mt-3 mb-0">
                    {uiState.result.message}
                  </Alert>
                )}

                <div className="bg-light rounded-3 p-3 mt-auto">
                  <h6 className="fw-semibold text-secondary mb-2">
                    <i className="bi bi-lightbulb me-1"></i>사용 가이드
                  </h6>
                  <ul className="small text-muted mb-0 ps-3">
                    <li><strong>푸시 타입:</strong> 기본 푸시 vs 마케팅 푸시 선택</li>
                    <li><strong>사용자 검색:</strong> 닉네임으로 검색하여 대상에 추가</li>
                    <li><strong>미리보기:</strong> 왼쪽에서 실시간으로 푸시 알림 모습 확인</li>
                    <li><strong>제한사항:</strong> 제목 50자, 내용 200자까지 입력 가능</li>
                  </ul>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* 푸시 발송 확인 모달 */}
      <Modal show={uiState.showConfirm} onHide={hideSendConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-send-check me-2 text-primary"></i>
            푸시 발송 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                <strong>푸시 타입:</strong> {formData.pushType === 'SIMPLE' ? '기본 푸시' : '기본 마케팅 푸시'}
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
              <div>
                <strong>발송 대상:</strong> {formData.targetType === "USER" ? "유저" : "사장님"} - {selectedUsers.length > 0 ? `${selectedUsers.length}명 선택됨` : '직접 입력된 ID'}
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
            onClick={confirmSendPush}
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

    </Container>
  );
};

export default PushManage;
