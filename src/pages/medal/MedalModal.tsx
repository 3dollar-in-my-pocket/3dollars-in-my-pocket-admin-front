import {useState, useEffect, useRef} from 'react';
import {Modal, Button, Form, Row, Col, Card, Alert, Spinner} from 'react-bootstrap';
import medalApi from '@/api/medalApi';
import uploadApi from '@/api/uploadApi';
import {Medal, getAcquisitionDescription} from '@/types/medal';
import {toast} from 'react-toastify';

interface MedalModalProps {
  show: boolean;
  onHide: () => void;
  medal: Medal | null;
  onUpdate: () => void;
}

const MedalModal = ({show, onHide, medal, onUpdate}: MedalModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingActivation, setIsUploadingActivation] = useState(false);
  const [isUploadingDisable, setIsUploadingDisable] = useState(false);

  const activationFileInputRef = useRef<HTMLInputElement>(null);
  const disableFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    introduction: '',
    activationIconUrl: '',
    disableIconUrl: '',
    acquisitionDescription: ''
  });

  useEffect(() => {
    if (medal) {
      setFormData({
        name: medal.name,
        introduction: medal.introduction,
        activationIconUrl: medal.iconUrl,
        disableIconUrl: medal.disableIconUrl,
        acquisitionDescription: getAcquisitionDescription(medal) || ''
      });
      setIsEditing(false);
      setErrorMessage('');
    }
  }, [medal]);

  if (!medal) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleActivationIconUpload = () => {
    activationFileInputRef.current?.click();
  };

  const handleDisableIconUpload = () => {
    disableFileInputRef.current?.click();
  };

  const handleActivationFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingActivation(true);
    setErrorMessage('');

    try {
      const response = await uploadApi.uploadImage('MEDAL_IMAGE', file);

      if (response.ok) {
        setFormData({
          ...formData,
          activationIconUrl: response.data
        });
        toast.success('활성화 아이콘이 업로드되었습니다');
      } else {
        setErrorMessage('이미지 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      setErrorMessage('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingActivation(false);
      if (activationFileInputRef.current) {
        activationFileInputRef.current.value = '';
      }
    }
  };

  const handleDisableFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDisable(true);
    setErrorMessage('');

    try {
      const response = await uploadApi.uploadImage('MEDAL_IMAGE', file);

      if (response.ok) {
        setFormData({
          ...formData,
          disableIconUrl: response.data
        });
        toast.success('비활성화 아이콘이 업로드되었습니다');
      } else {
        setErrorMessage('이미지 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      setErrorMessage('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingDisable(false);
      if (disableFileInputRef.current) {
        disableFileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('메달 이름을 입력해주세요.');
      return;
    }

    if (!formData.introduction.trim()) {
      setErrorMessage('메달 설명을 입력해주세요.');
      return;
    }

    if (!formData.activationIconUrl.trim()) {
      setErrorMessage('활성화 아이콘 URL을 입력해주세요.');
      return;
    }

    if (!formData.disableIconUrl.trim()) {
      setErrorMessage('비활성화 아이콘 URL을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const response = await medalApi.updateMedal(medal.medalId, {
        name: formData.name,
        introduction: formData.introduction,
        activationIconUrl: formData.activationIconUrl,
        disableIconUrl: formData.disableIconUrl,
        acquisitionDescription: formData.acquisitionDescription || undefined
      });

      if (response.ok) {
        toast.success('메달이 성공적으로 수정되었습니다');
        setIsEditing(false);
        onUpdate();
      } else {
        setErrorMessage(response.message || '메달 수정에 실패했습니다.');
      }
    } catch (error: any) {
      if (!error.response) {
        setErrorMessage('서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage(error.response.data?.message || '예상치 못한 오류가 발생했습니다.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: medal.name,
      introduction: medal.introduction,
      activationIconUrl: medal.iconUrl,
      disableIconUrl: medal.disableIconUrl,
      acquisitionDescription: getAcquisitionDescription(medal) || ''
    });
    setIsEditing(false);
    setErrorMessage('');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🏅 메달 상세 정보</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {errorMessage && (
          <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
            {errorMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* 메달 아이콘 표시 */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="text-center p-3">
                <Card.Body>
                  <p className="text-muted small mb-2">활성화 아이콘</p>
                  <img
                    src={isEditing ? formData.activationIconUrl : medal.iconUrl}
                    alt={medal.name}
                    className="img-fluid mb-2"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain'
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="text-center p-3 bg-light">
                <Card.Body>
                  <p className="text-muted small mb-2">비활성화 아이콘 (미획득)</p>
                  <img
                    src={isEditing ? formData.disableIconUrl : medal.disableIconUrl}
                    alt={`${medal.name} - 비활성화`}
                    className="img-fluid mb-2"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain'
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 메달 ID */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">메달 ID</Form.Label>
            <Form.Control
              type="text"
              value={medal.medalId}
              disabled
              className="bg-light"
            />
          </Form.Group>

          {/* 메달 이름 */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">메달 이름</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing || isProcessing}
              placeholder="메달 이름을 입력하세요"
            />
          </Form.Group>

          {/* 메달 설명 */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">메달 설명</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              disabled={!isEditing || isProcessing}
              placeholder="메달 설명을 입력하세요"
            />
          </Form.Group>

          {/* 활성화 아이콘 URL */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">활성화 아이콘 URL</Form.Label>
            <Form.Control
              type="text"
              name="activationIconUrl"
              value={formData.activationIconUrl}
              onChange={handleChange}
              disabled={!isEditing || isProcessing}
              placeholder="https://example.com/icon.png"
            />
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={activationFileInputRef}
                  style={{display: 'none'}}
                  onChange={handleActivationFileChange}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={handleActivationIconUpload}
                  disabled={isProcessing || isUploadingActivation || isUploadingDisable}
                >
                  {isUploadingActivation ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2"/>
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2"></i>
                      이미지 업로드
                    </>
                  )}
                </Button>
              </>
            )}
          </Form.Group>

          {/* 비활성화 아이콘 URL */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">비활성화 아이콘 URL</Form.Label>
            <Form.Control
              type="text"
              name="disableIconUrl"
              value={formData.disableIconUrl}
              onChange={handleChange}
              disabled={!isEditing || isProcessing}
              placeholder="https://example.com/disabled-icon.png"
            />
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={disableFileInputRef}
                  style={{display: 'none'}}
                  onChange={handleDisableFileChange}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={handleDisableIconUpload}
                  disabled={isProcessing || isUploadingActivation || isUploadingDisable}
                >
                  {isUploadingDisable ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2"/>
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2"></i>
                      이미지 업로드
                    </>
                  )}
                </Button>
              </>
            )}
          </Form.Group>

          {/* 획득 조건 설명 */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">획득 조건 설명</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="acquisitionDescription"
              value={formData.acquisitionDescription}
              onChange={handleChange}
              disabled={!isEditing || isProcessing}
              placeholder="메달 획득 조건을 입력하세요 (선택사항)"
            />
            <Form.Text className="text-muted">
              유저가 메달을 획득하기 위한 조건을 설명합니다.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        {!isEditing ? (
          <>
            <Button variant="secondary" onClick={onHide}>
              닫기
            </Button>
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <i className="bi bi-pencil me-2"></i>
              수정하기
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isProcessing || isUploadingActivation || isUploadingDisable}
            >
              취소
            </Button>
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={isProcessing || isUploadingActivation || isUploadingDisable}
            >
              {isProcessing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2"/>
                  저장 중...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  저장
                </>
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MedalModal;
