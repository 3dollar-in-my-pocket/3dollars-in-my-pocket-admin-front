import {FormEvent, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import missionApi from '@/api/missionApi';
import {
  MISSION_GROUP_ALWAYS_END_DATE_TIME,
  MISSION_GROUP_CODE_MAX_LENGTH,
  MISSION_GROUP_CODE_PATTERN,
  MISSION_GROUP_NAME_MAX_LENGTH,
  MissionGroup,
} from '@/types/mission';

const FORM_ID = 'mission-group-form';

interface FormData {
  code: string;
  name: string;
  startDateTime: string;
  endDateTime: string;
}

const emptyForm: FormData = {code: '', name: '', startDateTime: '', endDateTime: ''};

/** API 일시(yyyy-MM-ddTHH:mm:ss) → datetime-local 입력값 */
const toLocal = (value?: string | null) => (value ? value.slice(0, 19) : '');
/** datetime-local 입력값 → API 일시. 초가 생략된 값은 :00을 붙입니다. */
const toApi = (value: string) => (value.length === 16 ? `${value}:00` : value);

interface Props {
  show: boolean;
  /** 수정 대상 그룹. null이면 신규 등록 */
  group: MissionGroup | null;
  onHide: () => void;
  onSuccess: (group: MissionGroup) => void;
}

/**
 * 미션 그룹 등록·수정 모달
 *
 * code는 유저 API 경로에 쓰이는 외부 식별자라 등록 후 변경할 수 없습니다.
 * 유효 기간은 시작 포함, 종료 미포함입니다.
 */
const MissionGroupFormModal = ({show, group, onHide, onSuccess}: Props) => {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!group;

  useEffect(() => {
    if (!show) return;
    setErrors({});
    setForm(group
      ? {
        code: group.code,
        name: group.name,
        startDateTime: toLocal(group.startDateTime),
        endDateTime: toLocal(group.endDateTime),
      }
      : emptyForm);
  }, [show, group]);

  const setField = (name: keyof FormData, value: string) => {
    setForm((current) => ({...current, [name]: value}));
    setErrors((current) => ({...current, [name]: ''}));
  };

  /** 서버 검증 규칙을 미리 확인합니다. 최종 판단은 서버가 합니다. */
  const validate = () => {
    const next: Partial<Record<keyof FormData, string>> = {};
    const code = form.code.trim();
    const name = form.name.trim();

    if (!isEdit) {
      if (!code) next.code = '미션 그룹 코드를 입력해주세요.';
      else if (code.length > MISSION_GROUP_CODE_MAX_LENGTH) {
        next.code = `미션 그룹 코드는 최대 ${MISSION_GROUP_CODE_MAX_LENGTH}자까지 입력할 수 있습니다.`;
      } else if (!MISSION_GROUP_CODE_PATTERN.test(code)) {
        next.code = '미션 그룹 코드는 영소문자·숫자·-·_로만 입력해주세요.';
      }
    }

    if (!name) next.name = '미션 그룹 이름을 입력해주세요.';
    else if (name.length > MISSION_GROUP_NAME_MAX_LENGTH) {
      next.name = `미션 그룹 이름은 최대 ${MISSION_GROUP_NAME_MAX_LENGTH}자까지 입력할 수 있습니다.`;
    }

    if (!form.startDateTime) next.startDateTime = '시작 일시를 입력해주세요.';
    if (!form.endDateTime) next.endDateTime = '종료 일시를 입력해주세요.';
    else if (form.startDateTime && toApi(form.endDateTime) <= toApi(form.startDateTime)) {
      // 시작 = 종료는 서버가 허용하지만 항상 비활성 그룹이 되므로 함께 막습니다.
      next.endDateTime = '종료 일시는 시작 일시보다 이후여야 합니다.';
    }

    setErrors(next);
    return Object.values(next).every((message) => !message);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    try {
      const request = {
        name: form.name.trim(),
        startDateTime: toApi(form.startDateTime),
        endDateTime: toApi(form.endDateTime),
      };
      const response = group
        ? await missionApi.updateMissionGroup(group.code, request)
        : await missionApi.createMissionGroup({...request, code: form.code.trim()});
      // 실패 메시지(코드 중복 409 등)는 공통 인터셉터가 서버 message 그대로 토스트로 노출합니다.
      if (!response.ok) return;

      toast.success(isEdit ? '미션 그룹이 수정되었습니다.' : '미션 그룹이 등록되었습니다.');
      onSuccess(response.data);
      onHide();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !isSubmitting && onHide()} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold">
          <i className="bi bi-collection-fill me-2"/>
          미션 그룹 {isEdit ? '수정' : '등록'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold" htmlFor="mission-group-code">
                그룹 코드{!isEdit && <span className="text-danger ms-1">*</span>}
              </label>
              <input
                id="mission-group-code"
                className={`form-control font-monospace ${errors.code ? 'is-invalid' : ''}`}
                value={form.code}
                maxLength={MISSION_GROUP_CODE_MAX_LENGTH}
                onChange={(e) => setField('code', e.target.value)}
                readOnly={isEdit}
                disabled={isSubmitting}
                placeholder="예: goods-promotion-2026"
              />
              {errors.code && <div className="invalid-feedback d-block">{errors.code}</div>}
              <div className="form-text">
                {isEdit
                  ? '그룹 코드는 변경할 수 없습니다.'
                  : `영소문자·숫자·-·_만 사용 가능 (최대 ${MISSION_GROUP_CODE_MAX_LENGTH}자). 등록 후에는 변경할 수 없습니다.`}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold" htmlFor="mission-group-name">
                그룹 이름<span className="text-danger ms-1">*</span>
              </label>
              <input
                id="mission-group-name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={form.name}
                maxLength={MISSION_GROUP_NAME_MAX_LENGTH}
                onChange={(e) => setField('name', e.target.value)}
                disabled={isSubmitting}
                placeholder="예: 2026 굿즈 프로모션 미션"
              />
              {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold" htmlFor="mission-group-start">
                시작 일시<span className="text-danger ms-1">*</span>
              </label>
              <input
                id="mission-group-start"
                type="datetime-local"
                step={1}
                className={`form-control ${errors.startDateTime ? 'is-invalid' : ''}`}
                value={form.startDateTime}
                onChange={(e) => setField('startDateTime', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.startDateTime && <div className="invalid-feedback d-block">{errors.startDateTime}</div>}
              <div className="form-text">이 일시부터 활성 (포함)</div>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold" htmlFor="mission-group-end">
                종료 일시<span className="text-danger ms-1">*</span>
              </label>
              <input
                id="mission-group-end"
                type="datetime-local"
                step={1}
                className={`form-control ${errors.endDateTime ? 'is-invalid' : ''}`}
                value={form.endDateTime}
                min={form.startDateTime || undefined}
                onChange={(e) => setField('endDateTime', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.endDateTime && <div className="invalid-feedback d-block">{errors.endDateTime}</div>}
              <div className="form-text d-flex justify-content-between align-items-center gap-2">
                <span>이 일시 직전까지 활성 (미포함)</span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={() => setField('endDateTime', toLocal(MISSION_GROUP_ALWAYS_END_DATE_TIME))}
                  disabled={isSubmitting}
                >
                  상시 운영
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>
          취소
        </button>
        <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner-border spinner-border-sm me-1"/>}
          {isEdit ? '수정' : '등록'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default MissionGroupFormModal;
