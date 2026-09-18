import {FormEvent, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import experimentApi from '@/api/experimentApi';
import {useNonce} from '@/hooks/useNonce';
import {
  EXPERIMENT_ACCOUNT_TYPES,
  ExperimentAccountType,
  ExperimentVariantInfo,
  ExperimentVariantOverride,
  UpdateExperimentVariantOverrideRequest,
} from '@/types/experiment';

const FORM_ID = 'experiment-override-form';

interface FormData {
  experimentKey: string;
  variantKey: string;
  accountType: ExperimentAccountType;
  accountId: string;
  memo: string;
}

const emptyForm = (): FormData => ({
  experimentKey: '',
  variantKey: '',
  accountType: 'USER_ACCOUNT',
  accountId: '',
  memo: '',
});

const fromOverride = (override: ExperimentVariantOverride): FormData => ({
  experimentKey: override.experimentKey,
  variantKey: override.variantKey,
  accountType: override.accountType,
  accountId: override.accountId,
  memo: override.memo ?? '',
});

interface Props {
  show: boolean;
  /** 수정 대상. null이면 신규 등록 */
  override: ExperimentVariantOverride | null;
  /** 4-1 API로 조회한 지정 가능한 실험 목록 */
  experiments: ExperimentVariantInfo[];
  onHide: () => void;
  onSuccess: () => void;
}

/**
 * 실험 Variant 강제 지정 등록·수정 모달
 *
 * 서버가 experimentKey·variantKey의 존재 여부를 검증하지 않으므로
 * 오타를 막기 위해 두 값 모두 드롭다운으로만 선택하게 합니다.
 */
const ExperimentOverrideFormModal = ({show, override, experiments, onHide, onSuccess}: Props) => {
  const {nonce, issueNonce, clearNonce} = useNonce();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!override;

  // 선택된 실험의 Variant만 노출. 실험에서 제거된 낡은 Variant도 선택지에 남겨 의도치 않은 변경을 막습니다.
  const selectedExperiment = experiments.find((experiment) => experiment.experimentKey === form.experimentKey);
  const variantKeys = selectedExperiment?.variantKeys ?? [];
  const variantOptions = form.variantKey && !variantKeys.includes(form.variantKey)
    ? [...variantKeys, form.variantKey]
    : variantKeys;
  const isUnknownVariant = !!form.variantKey && !variantKeys.includes(form.variantKey);

  useEffect(() => {
    if (!show) return;

    if (override) {
      setForm(fromOverride(override));
    } else {
      // 신규 등록은 첫 번째 실험을 기본 선택해 빈 값 전송을 막습니다.
      const first = experiments[0];
      setForm({
        ...emptyForm(),
        experimentKey: first?.experimentKey ?? '',
        variantKey: first?.variantKeys[0] ?? '',
      });
    }
    setErrors({});
  }, [show, override, experiments]);

  // 신규 등록 시에만 nonce를 발급합니다. (중복 등록 방지)
  useEffect(() => {
    if (show && !override) {
      void issueNonce();
    } else if (!show) {
      clearNonce();
    }
  }, [show, override, issueNonce, clearNonce]);

  const setField = (name: keyof FormData, value: string) => {
    setForm((current) => ({...current, [name]: value}));
    setErrors((current) => ({...current, [name]: ''}));
  };

  const handleExperimentChange = (experimentKey: string) => {
    const experiment = experiments.find((item) => item.experimentKey === experimentKey);
    // 실험이 바뀌면 이전 실험의 Variant가 남지 않도록 함께 초기화합니다.
    setForm((current) => ({
      ...current,
      experimentKey,
      variantKey: experiment?.variantKeys[0] ?? '',
    }));
    setErrors((current) => ({...current, experimentKey: '', variantKey: ''}));
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.experimentKey) next.experimentKey = '실험을 선택해주세요.';
    if (!form.variantKey) next.variantKey = 'Variant를 선택해주세요.';
    if (!form.accountId.trim()) {
      next.accountId = '계정 ID를 입력해주세요.';
    } else if (form.accountId.trim().length > 100) {
      next.accountId = '계정 ID는 100자 이하여야 합니다.';
    } else if (form.accountType === 'USER_ACCOUNT' && !/^\d+$/.test(form.accountId.trim())) {
      next.accountId = '유저 계정 ID는 숫자만 입력할 수 있습니다.';
    }
    if (form.memo.length > 200) next.memo = '메모는 200자 이하여야 합니다.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** 수정 시 실제로 변경된 필드만 담습니다. (보내지 않은 필드는 서버에서 유지) */
  const buildUpdateRequest = (target: ExperimentVariantOverride): UpdateExperimentVariantOverrideRequest => {
    const update: UpdateExperimentVariantOverrideRequest = {};

    if (form.variantKey !== target.variantKey) {
      update.variantKey = form.variantKey;
    }

    const memo = form.memo.trim();
    const originalMemo = target.memo ?? '';
    if (memo !== originalMemo) {
      // 빈 문자열은 "메모 삭제"이므로 null을 명시적으로 전달합니다.
      update.memo = memo === '' ? null : memo;
    }

    return update;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    try {
      if (override) {
        const update = buildUpdateRequest(override);
        if (Object.keys(update).length === 0) {
          toast.info('변경된 내용이 없습니다.');
          return;
        }

        const response = await experimentApi.updateOverride(override.overrideId, update);
        if (!response.ok) return;
        toast.success('강제 지정이 수정되었습니다.');
      } else {
        if (!nonce) {
          toast.error('요청 토큰이 발급되지 않았습니다. 잠시 후 다시 시도해주세요.');
          return;
        }

        const memo = form.memo.trim();
        const response = await experimentApi.createOverride(
          form.experimentKey,
          {
            accountType: form.accountType,
            accountId: form.accountId.trim(),
            variantKey: form.variantKey,
            memo: memo === '' ? null : memo,
          },
          nonce
        );
        if (!response.ok) return;
        toast.success('강제 지정이 등록되었습니다. 반영까지 최대 5분이 걸릴 수 있습니다.');
      }

      onSuccess();
      onHide();
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypeHint = EXPERIMENT_ACCOUNT_TYPES.find((option) => option.value === form.accountType)?.hint;

  return (
    <Modal show={show} onHide={() => !isSubmitting && onHide()} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold">
          <i className="bi bi-shuffle me-2"/>
          Variant 강제 지정 {isEdit ? '수정' : '등록'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id={FORM_ID} onSubmit={handleSubmit}>
          <div className="row g-3">
            <Field label="실험" required error={errors.experimentKey}>
              <select
                className={`form-select ${errors.experimentKey ? 'is-invalid' : ''}`}
                value={form.experimentKey}
                onChange={(e) => handleExperimentChange(e.target.value)}
                // 실험과 계정은 지정의 식별자이므로 수정할 수 없습니다.
                disabled={isSubmitting || isEdit}
              >
                {experiments.length === 0 && <option value="">지정 가능한 실험이 없습니다</option>}
                {isEdit && !selectedExperiment && (
                  <option value={form.experimentKey}>{form.experimentKey}</option>
                )}
                {experiments.map((experiment) => (
                  <option key={experiment.experimentKey} value={experiment.experimentKey}>
                    {experiment.description}
                  </option>
                ))}
              </select>
              {form.experimentKey && (
                <div className="form-text font-monospace">{form.experimentKey}</div>
              )}
            </Field>

            <Field label="Variant" required error={errors.variantKey}>
              <select
                className={`form-select ${errors.variantKey ? 'is-invalid' : ''}`}
                value={form.variantKey}
                onChange={(e) => setField('variantKey', e.target.value)}
                disabled={isSubmitting || variantOptions.length === 0}
              >
                {variantOptions.length === 0 && <option value="">선택 가능한 Variant가 없습니다</option>}
                {variantOptions.map((variantKey) => (
                  <option key={variantKey} value={variantKey}>{variantKey}</option>
                ))}
              </select>
              {isUnknownVariant && (
                <div className="form-text text-warning">
                  현재 실험에 없는 Variant입니다. 이 상태로 두면 강제 지정이 무시됩니다.
                </div>
              )}
            </Field>

            <Field col="col-md-5" label="계정 타입" required>
              <select
                className="form-select"
                value={form.accountType}
                onChange={(e) => setField('accountType', e.target.value)}
                disabled={isSubmitting || isEdit}
              >
                {EXPERIMENT_ACCOUNT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>

            <Field col="col-md-7" label="계정 ID" required error={errors.accountId}>
              <input
                className={`form-control ${errors.accountId ? 'is-invalid' : ''}`}
                value={form.accountId}
                maxLength={100}
                onChange={(e) => setField('accountId', e.target.value)}
                disabled={isSubmitting || isEdit}
                placeholder={accountTypeHint}
              />
              {!isEdit && accountTypeHint && <div className="form-text">{accountTypeHint}</div>}
            </Field>

            <Field label="메모" error={errors.memo}>
              <input
                className={`form-control ${errors.memo ? 'is-invalid' : ''}`}
                value={form.memo}
                maxLength={200}
                onChange={(e) => setField('memo', e.target.value)}
                disabled={isSubmitting}
                placeholder="등록 사유 (예: QA 테스트 계정)"
              />
              <div className="form-text">
                나중에 등록 이유를 추적할 수 있는 유일한 단서입니다. 입력을 권장합니다.
                {isEdit && ' 비우고 저장하면 메모가 삭제됩니다.'}
              </div>
            </Field>
          </div>

          {isEdit && (
            <div className="alert alert-light border mt-3 mb-0 py-2 small text-body-secondary">
              실험과 계정은 변경할 수 없습니다. 다른 계정을 지정하려면 새로 등록해주세요.
            </div>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>
          취소
        </button>
        <button
          type="submit"
          form={FORM_ID}
          className="btn btn-primary"
          disabled={isSubmitting || (!isEdit && experiments.length === 0)}
        >
          {isSubmitting && <span className="spinner-border spinner-border-sm me-1"/>}
          {isEdit ? '수정' : '등록'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const Field = ({label, required, error, col = 'col-12', children}: {
  label: string;
  required?: boolean;
  error?: string;
  col?: string;
  children: React.ReactNode;
}) => (
  <div className={col}>
    <label className="form-label fw-semibold">
      {label}
      {required && <span className="text-danger ms-1">*</span>}
    </label>
    {children}
    {error && <div className="invalid-feedback d-block">{error}</div>}
  </div>
);

export default ExperimentOverrideFormModal;
