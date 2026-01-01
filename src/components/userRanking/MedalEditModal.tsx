import {useState, useEffect} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import {toast} from 'react-toastify';
import medalApi from '../../api/medalApi';
import {Medal, getAcquisitionDescription} from '../../types/medal';

interface MedalEditModalProps {
  show: boolean;
  onHide: () => void;
  medal: Medal | null;
  onUpdate: () => void;
}

const MedalEditModal = ({show, onHide, medal, onUpdate}: MedalEditModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    introduction: '',
    activationIconUrl: '',
    disableIconUrl: '',
    acquisitionDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medal) {
      setFormData({
        name: medal.name || '',
        introduction: medal.introduction || '',
        activationIconUrl: medal.iconUrl || '',
        disableIconUrl: medal.disableIconUrl || '',
        acquisitionDescription: getAcquisitionDescription(medal) || ''
      });
    }
  }, [medal]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!medal) return;

    if (!formData.name.trim()) {
      toast.warning('메달 이름을 입력해주세요.');
      return;
    }

    if (!formData.introduction.trim()) {
      toast.warning('메달 소개를 입력해주세요.');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await medalApi.updateMedal(medal.medalId, {
        name: formData.name,
        introduction: formData.introduction,
        activationIconUrl: formData.activationIconUrl,
        disableIconUrl: formData.disableIconUrl,
        acquisitionDescription: formData.acquisitionDescription || undefined
      });

      if (response.ok) {
        toast.success('메달 정보가 수정되었습니다.');
        onUpdate();
        onHide();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-pencil-square me-2 text-primary"></i>
          메달 정보 수정
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {medal && (
            <div className="mb-4 p-3 bg-light rounded d-flex align-items-center gap-3">
              <img
                src={medal.iconUrl}
                alt={medal.name}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain'
                }}
              />
              <div>
                <h6 className="mb-1 fw-bold">{medal.name}</h6>
                <small className="text-muted">메달 ID: {medal.medalId}</small>
              </div>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              메달 이름 <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="메달 이름을 입력하세요"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              메달 소개 <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="메달 소개를 입력하세요"
              value={formData.introduction}
              onChange={(e) => handleChange('introduction', e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              획득 조건 설명
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="메달 획득 조건을 입력하세요 (선택사항)"
              value={formData.acquisitionDescription}
              onChange={(e) => handleChange('acquisitionDescription', e.target.value)}
              disabled={isSubmitting}
            />
            <Form.Text className="text-muted">
              유저가 메달을 획득하기 위한 조건을 설명합니다.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">활성 아이콘 URL</Form.Label>
            <Form.Control
              type="text"
              placeholder="활성 아이콘 URL을 입력하세요"
              value={formData.activationIconUrl}
              onChange={(e) => handleChange('activationIconUrl', e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">비활성 아이콘 URL</Form.Label>
            <Form.Control
              type="text"
              placeholder="비활성 아이콘 URL을 입력하세요"
              value={formData.disableIconUrl}
              onChange={(e) => handleChange('disableIconUrl', e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          취소
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              저장 중...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              저장
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedalEditModal;
