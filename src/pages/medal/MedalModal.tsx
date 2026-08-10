import {useEffect, useRef, useState} from 'react';
import {Form, Modal} from 'react-bootstrap';
import medalApi from '@/api/medalApi';
import uploadApi from '@/api/uploadApi';
import {getAcquisitionDescription, Medal} from '@/types/medal';
import {toast} from 'react-toastify';
import DetailField from '@/components/common/DetailField';

interface MedalModalProps {
  show: boolean;
  onHide: () => void;
  medal: Medal | null;
  onUpdate: () => void;
}

interface MedalFormData {
  name: string;
  introduction: string;
  activationIconUrl: string;
  disableIconUrl: string;
  acquisitionDescription: string;
}

/** 아이콘 미리보기 */
const IconPreview = ({label, src, muted = false}: { label: string; src: string; muted?: boolean }) => (
  <div className={`medal-icon-preview ${muted ? 'medal-icon-preview--muted' : ''}`}>
    <span className="item-card__label">{label}</span>
    <img
      src={src}
      alt=""
      onError={(e: any) => {
        e.target.style.visibility = 'hidden';
      }}
    />
  </div>
);

const MedalModal = ({show, onHide, medal, onUpdate}: MedalModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  /** 업로드 중인 아이콘 종류 (null이면 업로드 중이 아님) */
  const [uploadingIcon, setUploadingIcon] = useState<'activation' | 'disable' | null>(null);

  const activationFileInputRef = useRef<HTMLInputElement>(null);
  const disableFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<MedalFormData>({
    name: '',
    introduction: '',
    activationIconUrl: '',
    disableIconUrl: '',
    acquisitionDescription: ''
  });

  const buildFormData = (target: Medal): MedalFormData => ({
    name: target.name,
    introduction: target.introduction,
    activationIconUrl: target.iconUrl,
    disableIconUrl: target.disableIconUrl,
    acquisitionDescription: getAcquisitionDescription(target) || ''
  });

  useEffect(() => {
    if (medal) {
      setFormData(buildFormData(medal));
      setIsEditing(false);
      setErrorMessage('');
    }
  }, [medal]);

  if (!medal) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  /** 활성화/비활성화 아이콘 업로드 공통 처리 */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'activation' | 'disable'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const field = kind === 'activation' ? 'activationIconUrl' : 'disableIconUrl';
    const inputRef = kind === 'activation' ? activationFileInputRef : disableFileInputRef;
    const label = kind === 'activation' ? '활성화' : '비활성화';

    setUploadingIcon(kind);
    setErrorMessage('');

    try {
      const response = await uploadApi.uploadImage('MEDAL_IMAGE', file);

      if (response.ok) {
        setFormData(prev => ({...prev, [field]: response.data}));
        toast.success(`${label} 아이콘이 업로드되었습니다`);
      } else {
        setErrorMessage('이미지 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      setErrorMessage('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingIcon(null);
      if (inputRef.current) {
        inputRef.current.value = '';
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
    setFormData(buildFormData(medal));
    setIsEditing(false);
    setErrorMessage('');
  };

  const isBusy = isProcessing || uploadingIcon !== null;

  /** 아이콘 URL 입력 + 업로드 버튼 */
  const renderIconUrlField = (kind: 'activation' | 'disable') => {
    const isActivation = kind === 'activation';
    const field = isActivation ? 'activationIconUrl' : 'disableIconUrl';
    const inputRef = isActivation ? activationFileInputRef : disableFileInputRef;
    const label = isActivation ? '활성화 아이콘 URL' : '비활성화 아이콘 URL';

    return (
      <Form.Group className="col-12">
        <Form.Label htmlFor={`medal-${field}`}>
          {label} <span className="text-danger">*</span>
        </Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            id={`medal-${field}`}
            type="text"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            disabled={isBusy}
            placeholder="https://example.com/icon.png"
          />
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            style={{display: 'none'}}
            onChange={(e) => handleFileChange(e, kind)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary flex-shrink-0"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
          >
            {uploadingIcon === kind ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
            ) : (
              <i className="bi bi-cloud-upload"/>
            )}
          </button>
        </div>
      </Form.Group>
    );
  };

  return (
    <Modal
      show={show}
      onHide={isBusy ? undefined : onHide}
      size="lg"
      centered
      className="app-modal"
      backdrop={isBusy ? "static" : true}
    >
      <Modal.Header closeButton={!isBusy}>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-award-fill'}`}/>
            {isEditing ? '메달 수정' : '메달 상세'}
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">{medal.medalId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        {errorMessage && (
          <div className="alert alert-danger py-2 px-3 small" role="alert">
            <i className="bi bi-exclamation-triangle me-1"/>
            {errorMessage}
          </div>
        )}

        {/* 아이콘 미리보기 */}
        <div className="row g-3 mb-1">
          <div className="col-6">
            <IconPreview
              label="활성화 (획득)"
              src={isEditing ? formData.activationIconUrl : medal.iconUrl}
            />
          </div>
          <div className="col-6">
            <IconPreview
              label="비활성화 (미획득)"
              src={isEditing ? formData.disableIconUrl : medal.disableIconUrl}
              muted
            />
          </div>
        </div>

        {isEditing ? (
          <Form onSubmit={handleSubmit} className="modal-section row g-3">
            <Form.Group className="col-12">
              <Form.Label htmlFor="medal-name">
                메달 이름 <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="medal-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isBusy}
                placeholder="메달 이름을 입력하세요"
              />
            </Form.Group>

            <Form.Group className="col-12">
              <Form.Label htmlFor="medal-introduction">
                메달 설명 <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="medal-introduction"
                as="textarea"
                rows={3}
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                disabled={isBusy}
                placeholder="메달 설명을 입력하세요"
              />
            </Form.Group>

            {renderIconUrlField('activation')}
            {renderIconUrlField('disable')}

            <Form.Group className="col-12">
              <Form.Label htmlFor="medal-acquisition">획득 조건 설명</Form.Label>
              <Form.Control
                id="medal-acquisition"
                as="textarea"
                rows={3}
                name="acquisitionDescription"
                value={formData.acquisitionDescription}
                onChange={handleChange}
                disabled={isBusy}
                placeholder="메달 획득 조건을 입력하세요 (선택사항)"
              />
              <Form.Text>유저가 메달을 획득하기 위한 조건을 설명합니다.</Form.Text>
            </Form.Group>
          </Form>
        ) : (
          <div className="modal-section row g-3">
            <DetailField label="메달 이름" className="col-12">
              {medal.name}
            </DetailField>
            <DetailField label="메달 설명" className="col-12">
              {medal.introduction}
            </DetailField>
            <DetailField label="획득 조건" className="col-12" placeholder="기본 메달 (획득 조건 없음)">
              {getAcquisitionDescription(medal)}
            </DetailField>
            <DetailField label="활성화 아이콘 URL" className="col-12" monospace>
              {medal.iconUrl}
            </DetailField>
            <DetailField label="비활성화 아이콘 URL" className="col-12" monospace>
              {medal.disableIconUrl}
            </DetailField>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {isEditing ? (
          <>
            <button className="btn btn-outline-secondary" onClick={handleCancel} disabled={isBusy}>
              취소
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isBusy}>
              {isProcessing && (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
              )}
              {isProcessing ? '저장 중...' : '저장'}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline-secondary" onClick={onHide}>
              닫기
            </button>
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <i className="bi bi-pencil me-1"/>
              수정
            </button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MedalModal;
