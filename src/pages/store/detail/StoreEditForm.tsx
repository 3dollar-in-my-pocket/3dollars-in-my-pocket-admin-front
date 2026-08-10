import {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import enumApi from '@/api/enumApi';
import storeApi from '@/api/storeApi';

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
    } catch (error) {
      console.error('Enum 조회 실패:', error);
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
    <form onSubmit={handleSubmit}>
      {/* 가게명 입력 */}
      <div className="form-field">
        <label className="form-field__label" htmlFor="store-edit-name">
          <i className="bi bi-shop"/>
          가게명
        </label>
        <input
          id="store-edit-name"
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="가게명을 입력하세요"
          disabled={isLoading}
        />
      </div>

      {/* 라벨 관리 */}
      <div className="form-field">
        <span className="form-field__label">
          <i className="bi bi-tags"/>
          라벨
        </span>

        {/* 현재 선택된 라벨 표시 */}
        {labels.length > 0 ? (
          <div className="form-chips">
            {labels.map((label, index) => (
              <span key={index} className="form-chip form-chip--selected">
                <i className="bi bi-tag-fill"/>
                <span>{label}</span>
                <button
                  type="button"
                  className="form-chip__remove"
                  onClick={() => handleRemoveLabel(label)}
                  aria-label={`${label} 라벨 삭제`}
                  title="라벨 삭제"
                >
                  <i className="bi bi-x-lg"/>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="form-field__hint">선택된 라벨이 없습니다.</p>
        )}

        {/* 라벨 추가 섹션 */}
        <div className="form-params">
          <p className="form-params__head">라벨 추가하기</p>

          {/* Enum 라벨 빠른 선택 */}
          {availableLabels.length > 0 && (
            <div className="form-field">
              <label className="form-field__label" htmlFor="store-edit-label-select">
                <i className="bi bi-list-ul"/>
                목록에서 선택
              </label>
              <select
                id="store-edit-label-select"
                className="form-select form-select-sm"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddLabel(e.target.value);
                  }
                }}
                disabled={isLoading}
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
              </select>
            </div>
          )}

          {/* 직접 입력 */}
          <div className="form-field">
            <label className="form-field__label" htmlFor="store-edit-custom-label">
              <i className="bi bi-pencil"/>
              직접 입력
            </label>
            <div className="form-inline-search">
              <input
                id="store-edit-custom-label"
                type="text"
                className="form-control"
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
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddCustomLabel}
                disabled={isLoading || !customLabelInput.trim()}
              >
                <i className="bi bi-plus-lg me-1"/>
                추가
              </button>
            </div>
            <p className="form-field__hint">
              <i className="bi bi-info-circle me-1"/>
              Enum에 없는 새로운 라벨을 직접 입력할 수 있습니다
            </p>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          <i className="bi bi-x-lg me-1"/>
          취소
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
              저장 중...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-1"/>
              저장
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StoreEditForm;
