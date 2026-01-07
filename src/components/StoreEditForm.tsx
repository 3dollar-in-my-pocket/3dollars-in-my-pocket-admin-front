import {useState, useEffect} from 'react';
import {Form, Button, Badge, Spinner} from 'react-bootstrap';
import {toast} from 'react-toastify';
import enumApi from '../api/enumApi';
import storeApi from '../api/storeApi';

interface StoreEditFormProps {
  storeId: string;
  initialName: string;
  initialLabels: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface LabelOption {
  key: string;
  description: string;
}

const StoreEditForm = ({storeId, initialName, initialLabels, onSuccess, onCancel}: StoreEditFormProps) => {
  const [name, setName] = useState(initialName);
  const [labels, setLabels] = useState<string[]>(initialLabels || []);
  const [customLabelInput, setCustomLabelInput] = useState('');
  const [availableLabels, setAvailableLabels] = useState<LabelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEnums, setIsFetchingEnums] = useState(false);

  useEffect(() => {
    fetchEnums();
  }, []);

  const fetchEnums = async () => {
    setIsFetchingEnums(true);
    try {
      console.log('Enum API 호출 시작');
      const response = await enumApi.getEnum();
      console.log('Enum API 응답:', response);

      if (response.ok && response.data?.StoreLabel) {
        console.log('StoreLabel:', response.data.StoreLabel);
        setAvailableLabels(response.data.StoreLabel);
      } else {
        console.warn('StoreLabel이 없거나 응답이 실패:', response);
      }
    } finally {
      setIsFetchingEnums(false);
    }
  };

  const handleAddLabel = (label: string) => {
    if (!label.trim()) {
      toast.warning('라벨을 입력해주세요.');
      return;
    }

    if (labels.includes(label)) {
      toast.warning('이미 추가된 라벨입니다.');
      return;
    }

    setLabels([...labels, label]);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleAddCustomLabel = () => {
    if (!customLabelInput.trim()) {
      toast.warning('커스텀 라벨을 입력해주세요.');
      return;
    }

    handleAddLabel(customLabelInput);
    setCustomLabelInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning('가게명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await storeApi.updateStore(storeId, {
        name: name.trim(),
        labels
      });

      if (response.ok) {
        toast.success('가게 정보가 수정되었습니다.');
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="p-4">
        {/* 가게명 입력 */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            <i className="bi bi-shop me-2 text-primary"></i>
            가게명
          </Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="가게명을 입력하세요"
            disabled={isLoading}
          />
        </Form.Group>

        {/* 라벨 관리 */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            <i className="bi bi-tags me-2 text-success"></i>
            라벨
          </Form.Label>

          {/* 현재 선택된 라벨 표시 */}
          <div className="mb-3">
            {labels.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {labels.map((label, index) => (
                  <Badge
                    key={index}
                    bg="success"
                    className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{fontSize: '0.9rem'}}
                  >
                    <span>{label}</span>
                    <i
                      className="bi bi-x-circle"
                      role="button"
                      onClick={() => handleRemoveLabel(label)}
                      style={{cursor: 'pointer'}}
                    ></i>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0">선택된 라벨이 없습니다.</p>
            )}
          </div>

          {/* 라벨 추가 섹션 */}
          <div className="border rounded p-3 bg-white">
            <p className="fw-semibold mb-3 small d-flex align-items-center">
              <i className="bi bi-plus-circle-fill text-primary me-2"></i>
              라벨 추가하기
            </p>

            {/* Enum 라벨 빠른 선택 */}
            {availableLabels.length > 0 && (
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-2">
                  <i className="bi bi-list-ul me-1"></i>
                  목록에서 선택
                </label>
                <Form.Select
                  size="sm"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddLabel(e.target.value);
                    }
                  }}
                  disabled={isLoading}
                  className="form-select-sm"
                >
                  <option value="">라벨을 선택하세요...</option>
                  {availableLabels.map((labelOption, index) => (
                    <option
                      key={index}
                      value={labelOption.key}
                      disabled={labels.includes(labelOption.key)}
                    >
                      {labelOption.description} ({labelOption.key})
                      {labels.includes(labelOption.key) ? ' ✓ 이미 추가됨' : ''}
                    </option>
                  ))}
                </Form.Select>
              </div>
            )}

            {/* 구분선 */}
            {availableLabels.length > 0 && (
              <div className="position-relative mb-3">
                <hr className="my-0"/>
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">
                  또는
                </span>
              </div>
            )}

            {/* 직접 입력 */}
            <div>
              <label className="form-label small fw-semibold mb-2">
                <i className="bi bi-pencil me-1"></i>
                직접 입력
              </label>
              <div className="d-flex gap-2">
                <div className="flex-grow-1">
                  <Form.Control
                    type="text"
                    value={customLabelInput}
                    onChange={(e) => setCustomLabelInput(e.target.value)}
                    placeholder="커스텀 라벨 입력 (예: MY_CUSTOM_LABEL)"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomLabel();
                      }
                    }}
                  />
                  <small className="text-muted d-block mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    Enum에 없는 새로운 라벨을 직접 입력할 수 있습니다
                  </small>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddCustomLabel}
                  disabled={isLoading || !customLabelInput.trim()}
                  style={{height: 'fit-content'}}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  추가
                </Button>
              </div>
            </div>
          </div>
        </Form.Group>

        {/* 액션 버튼 */}
        <div className="d-flex gap-2 justify-content-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            <i className="bi bi-x-lg me-2"></i>
            취소
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
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
        </div>
      </div>
    </Form>
  );
};

export default StoreEditForm;
