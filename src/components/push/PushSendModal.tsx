import { useEffect } from 'react';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { usePushForm } from '../../hooks/usePushForm';
import { OS_PLATFORM, getOsPlatformDisplayName } from '../../types/push';
import UserSearch from './UserSearch';

interface PushSendModalProps {
  show: boolean;
  onHide: () => void;
  initialUserIds?: number[];
}

const PushSendModal = ({ show, onHide, initialUserIds = [] }: PushSendModalProps) => {
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

  const handleUserToggle = (userId: string, nickname: string) => {
    if (isUserSelected(userId)) {
      handleRemoveUser(userId);
    } else {
      handleAddUser(userId, nickname);
    }
  };

  const handleSend = async () => {
    if (!canSend()) {
      toast.warning('필수 항목을 모두 입력해주세요.');
      return;
    }

    const success = await confirmSendPush();
    if (success) {
      toast.success('푸시가 성공적으로 발송되었습니다.');
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
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
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="bi bi-tag me-2"></i>푸시 타입
            </Form.Label>
            <Form.Select
              value={formData.pushType}
              onChange={(e) => updateFormData('pushType', e.target.value)}
              className="border-2"
            >
              <option value="SIMPLE">📢 기본 푸시</option>
              <option value="SIMPLE_MARKETING">🎯 기본 마케팅 푸시</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="bi bi-people me-2"></i>발송 대상
            </Form.Label>
            <Tab.Container activeKey={formData.targetType} onSelect={(key) => updateFormData('targetType', key)}>
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
            </Tab.Container>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="bi bi-phone me-2"></i>대상 OS
            </Form.Label>
            <div className="d-flex gap-3">
              {Object.values(OS_PLATFORM).map((platform) => (
                <Form.Check
                  key={platform}
                  type="checkbox"
                  id={`os-${platform}`}
                  label={
                    <span className="d-flex align-items-center gap-2">
                      <i className={`bi ${platform === 'AOS' ? 'bi-android2' : 'bi-apple'}`}></i>
                      {getOsPlatformDisplayName(platform)}
                    </span>
                  }
                  checked={targetOsPlatforms.has(platform)}
                  onChange={() => toggleOsPlatform(platform)}
                  className="user-select-none"
                />
              ))}
            </div>
            <Form.Text className="text-muted small">
              {targetOsPlatforms.size === 0
                ? '최소 하나의 OS를 선택해야 합니다'
                : `${Array.from(targetOsPlatforms).map(p => getOsPlatformDisplayName(p)).join(', ')}에 발송됩니다`
              }
            </Form.Text>
          </Form.Group>

          {formData.targetType === 'USER' && (
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
              <i className="bi bi-people me-2"></i>대상 {formData.targetType === 'USER' ? '사용자' : '사장님'} ID
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={formData.targetType === 'USER'
                ? '사용자 ID를 쉼표로 구분하여 입력하거나, 위에서 검색하여 추가하세요'
                : '사장님 ID를 쉼표로 구분하여 입력하세요'
              }
              value={formData.accountIdsInput}
              onChange={(e) => updateFormData('accountIdsInput', e.target.value)}
              className="border-2"
            />
            <Form.Text className="text-muted small">
              여러 {formData.targetType === 'USER' ? '사용자' : '사장님'}에게 발송하려면 쉼표로 구분해주세요
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
              onChange={(e) => updateFormData('title', e.target.value)}
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
              onChange={(e) => updateFormData('body', e.target.value)}
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
                onChange={(e: any) => {
                  const file = e.target.files[0];
                  if (file) uploadImage(file);
                }}
                className="border-2"
                disabled={uiState.uploading}
              />
            )}
            <Form.Text className="text-muted small">
              {uiState.uploading
                ? '이미지 업로드 중...'
                : 'JPG, PNG 형식의 이미지를 업로드할 수 있습니다'
              }
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="bi bi-link-45deg me-2"></i>이동 경로 (선택)
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="/home, /event 등"
              value={formData.path}
              onChange={(e) => updateFormData('path', e.target.value)}
              className="border-2"
            />
            <Form.Text className="text-muted small">
              푸시 클릭 시 이동할 앱 내 경로를 입력하세요
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          취소
        </Button>
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={!canSend() || uiState.loading}
        >
          {uiState.loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              발송 중...
            </>
          ) : (
            <>
              <i className="bi bi-send-fill me-2"></i>
              푸시 발송
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PushSendModal;
