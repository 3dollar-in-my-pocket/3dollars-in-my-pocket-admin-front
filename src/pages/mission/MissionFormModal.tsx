import {FormEvent, ReactNode, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import missionApi from '@/api/missionApi';
import useEnumOptions, {EnumSelectOption} from '@/hooks/useEnumOptions';
import {
  Mission,
  MISSION_ENUM_NAMES,
  MISSION_MAX_COMPLETION_COUNT_MAX,
  MISSION_MAX_COMPLETION_COUNT_MIN,
  MISSION_TITLE_MAX_LENGTH,
  POINT_REWARD_TYPE,
  UpdateMissionRequest,
} from '@/types/mission';

const FORM_ID = 'mission-form';

/** 숫자 입력은 빈 값을 표현하기 위해 문자열로 보관하고 제출 시 변환합니다. */
interface ConditionRow {
  activityType: string;
  targetCount: string;
}

interface RewardRow {
  type: string;
  amount: string;
}

interface FormData {
  title: string;
  periodType: string;
  maxCompletionCount: string;
  conditions: ConditionRow[];
  rewards: RewardRow[];
  isVisible: boolean;
  displayOrder: string;
}

/** 신규 등록 기본값. 각 enum의 첫 번째 값을 기본 선택합니다. */
const emptyForm = (
  periodOptions: EnumSelectOption[],
  activityOptions: EnumSelectOption[],
  rewardOptions: EnumSelectOption[],
  displayOrder: number,
): FormData => ({
  title: '',
  periodType: periodOptions[0]?.value ?? '',
  maxCompletionCount: '1',
  conditions: activityOptions[0] ? [{activityType: activityOptions[0].value, targetCount: '1'}] : [],
  rewards: rewardOptions[0] ? [{type: rewardOptions[0].value, amount: ''}] : [],
  isVisible: true,
  displayOrder: String(displayOrder),
});

const fromMission = (mission: Mission): FormData => ({
  title: mission.title,
  periodType: mission.periodType,
  maxCompletionCount: String(mission.maxCompletionCount),
  conditions: mission.conditions.map((condition) => ({
    activityType: condition.activityType,
    targetCount: String(condition.targetCount),
  })),
  rewards: mission.rewards.map((reward) => ({type: reward.type, amount: String(reward.amount ?? '')})),
  isVisible: mission.isVisible,
  displayOrder: String(mission.displayOrder),
});

const isPositiveInteger = (value: string) => /^\d+$/.test(value.trim()) && Number(value) > 0;

/** 미사용 옵션 중 첫 번째 값. 중복 타입은 서버에서 invalid_mission으로 거절됩니다. */
const firstUnused = (options: EnumSelectOption[], used: string[]) =>
  options.find((option) => !used.includes(option.value))?.value;

/** 서버 enum에서 빠진 값이라도 기존 미션 값은 선택지에 남겨 의도치 않게 바뀌지 않도록 합니다. */
const withCurrent = (options: EnumSelectOption[], value: string): EnumSelectOption[] =>
  !value || options.some((option) => option.value === value) ? options : [...options, {value, label: value}];

interface Props {
  show: boolean;
  /** 미션이 속한 그룹 코드 */
  groupCode: string;
  /** 수정 대상 미션 ID. null이면 신규 등록 */
  missionId: string | null;
  /** 신규 등록 시 기본 노출 순서 */
  defaultDisplayOrder: number;
  onHide: () => void;
  onSuccess: () => void;
}

/**
 * 미션 등록·수정 모달
 *
 * 수정은 전체 교체(PUT)이므로, 다른 관리자의 변경을 덮어쓰지 않도록 열 때마다 단건 조회로 최신 값을 채웁니다.
 */
const MissionFormModal = ({show, groupCode, missionId, defaultDisplayOrder, onHide, onSuccess}: Props) => {
  const periodEnum = useEnumOptions(MISSION_ENUM_NAMES.periodType);
  const activityEnum = useEnumOptions(MISSION_ENUM_NAMES.activityType);
  const rewardEnum = useEnumOptions(MISSION_ENUM_NAMES.rewardType);
  const periodOptions = periodEnum.options;
  const activityOptions = activityEnum.options;
  const rewardOptions = rewardEnum.options;
  const isEnumLoading = periodEnum.isLoading || activityEnum.isLoading || rewardEnum.isLoading;
  const isEnumUnavailable = [periodEnum, activityEnum, rewardEnum]
    .some((item) => item.isError || item.isMissing || (!item.isLoading && item.options.length === 0));

  const [form, setForm] = useState<FormData>(() => emptyForm([], [], [], defaultDisplayOrder));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!missionId;
  const isBusy = isSubmitting || isLoading || isEnumLoading;
  // 신규 등록은 서버 enum이 있어야 선택지를 채울 수 있습니다. 수정은 기존 값을 유지하므로 막지 않습니다.
  const isCreateBlocked = !isEdit && isEnumUnavailable;

  // 신규 등록: enum 로드가 끝난 뒤 기본값을 채웁니다. (enum은 앱 전체에서 한 번만 조회·캐시됨)
  useEffect(() => {
    if (!show || missionId || isEnumLoading) return;
    setErrors({});
    setLoadFailed(false);
    setForm(emptyForm(periodOptions, activityOptions, rewardOptions, defaultDisplayOrder));
  }, [show, missionId, isEnumLoading, periodOptions, activityOptions, rewardOptions, defaultDisplayOrder]);

  // 수정: 열 때마다 단건 조회로 최신 값을 채웁니다.
  useEffect(() => {
    if (!show || !missionId) return;

    setErrors({});
    setLoadFailed(false);

    let cancelled = false;
    setIsLoading(true);
    missionApi.getMission(groupCode, missionId)
      .then((response) => {
        if (cancelled) return;
        if (!response.ok) {
          setLoadFailed(true);
          return;
        }
        setForm(fromMission(response.data));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [show, groupCode, missionId]);

  const clearError = (key: string) => setErrors((current) => ({...current, [key]: ''}));

  const setField = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setForm((current) => ({...current, [name]: value}));
    clearError(name);
  };

  const updateCondition = (index: number, patch: Partial<ConditionRow>) => {
    setForm((current) => ({
      ...current,
      conditions: current.conditions.map((row, i) => (i === index ? {...row, ...patch} : row)),
    }));
    clearError(`conditions.${index}`);
  };

  const addCondition = () => {
    const activityType = firstUnused(activityOptions, form.conditions.map((row) => row.activityType));
    if (!activityType) return;
    setField('conditions', [...form.conditions, {activityType, targetCount: '1'}]);
  };

  const removeCondition = (index: number) => {
    setField('conditions', form.conditions.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, patch: Partial<RewardRow>) => {
    setForm((current) => ({
      ...current,
      rewards: current.rewards.map((row, i) => (i === index ? {...row, ...patch} : row)),
    }));
    clearError(`rewards.${index}`);
  };

  const addReward = () => {
    const type = firstUnused(rewardOptions, form.rewards.map((row) => row.type));
    if (!type) return;
    setField('rewards', [...form.rewards, {type, amount: ''}]);
  };

  const removeReward = (index: number) => {
    setField('rewards', form.rewards.filter((_, i) => i !== index));
  };

  /** 서버 검증 규칙을 미리 확인해 불필요한 요청을 줄입니다. 최종 판단은 서버가 합니다. */
  const validate = () => {
    const next: Record<string, string> = {};
    const title = form.title.trim();

    if (!title) next.title = '미션 제목을 입력해주세요.';
    else if (title.length > MISSION_TITLE_MAX_LENGTH) {
      next.title = `미션 제목은 최대 ${MISSION_TITLE_MAX_LENGTH}자까지 입력할 수 있습니다.`;
    }

    if (form.conditions.length === 0) next.conditions = '미션 조건을 1개 이상 입력해주세요.';
    form.conditions.forEach((row, index) => {
      if (!isPositiveInteger(row.targetCount)) {
        next[`conditions.${index}`] = '목표 횟수는 1 이상의 정수여야 합니다.';
      }
    });
    if (new Set(form.conditions.map((row) => row.activityType)).size !== form.conditions.length) {
      next.conditions = '같은 활동 타입을 중복으로 등록할 수 없습니다.';
    }

    const maxCompletionCount = Number(form.maxCompletionCount);
    if (!isPositiveInteger(form.maxCompletionCount)
      || maxCompletionCount < MISSION_MAX_COMPLETION_COUNT_MIN
      || maxCompletionCount > MISSION_MAX_COMPLETION_COUNT_MAX) {
      next.maxCompletionCount =
        `최대 완료 횟수는 ${MISSION_MAX_COMPLETION_COUNT_MIN}~${MISSION_MAX_COMPLETION_COUNT_MAX} 사이의 정수여야 합니다.`;
    }

    if (!form.periodType) next.periodType = '기간 타입을 선택해주세요.';

    if (form.rewards.length === 0) next.rewards = '미션 리워드를 1개 이상 입력해주세요.';
    form.rewards.forEach((row, index) => {
      if (row.type !== POINT_REWARD_TYPE) return;
      if (!row.amount.trim()) next[`rewards.${index}`] = '지급 포인트를 입력해주세요.';
      else if (!isPositiveInteger(row.amount)) {
        next[`rewards.${index}`] = '지급 포인트는 0보다 큰 정수여야 합니다.';
      }
    });
    if (new Set(form.rewards.map((row) => row.type)).size !== form.rewards.length) {
      next.rewards = '같은 리워드 타입을 중복으로 등록할 수 없습니다.';
    }

    if (!/^-?\d+$/.test(form.displayOrder.trim())) next.displayOrder = '노출 순서는 정수로 입력해주세요.';

    setErrors(next);
    return Object.values(next).every((message) => !message);
  };

  const buildRequest = (): UpdateMissionRequest => ({
    title: form.title.trim(),
    maxCompletionCount: Number(form.maxCompletionCount),
    conditions: form.conditions.map((row) => ({
      activityType: row.activityType,
      targetCount: Number(row.targetCount),
    })),
    rewards: form.rewards.map((row) => (
      row.type === POINT_REWARD_TYPE ? {type: row.type, amount: Number(row.amount)} : {type: row.type}
    )),
    isVisible: form.isVisible,
    displayOrder: Number(form.displayOrder),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isBusy || loadFailed || isCreateBlocked || !validate()) return;

    setIsSubmitting(true);
    try {
      const request = buildRequest();
      const response = missionId
        ? await missionApi.updateMission(groupCode, missionId, request)
        : await missionApi.createMission(groupCode, {...request, periodType: form.periodType});
      // 실패 메시지는 공통 인터셉터가 서버 message 그대로 토스트로 노출합니다.
      if (!response.ok) return;

      toast.success(isEdit
        ? '미션이 수정되었습니다. 앱에는 캐시로 인해 최대 수 분 늦게 반영될 수 있습니다.'
        : '미션이 등록되었습니다.');
      onSuccess();
      onHide();
    } finally {
      setIsSubmitting(false);
    }
  };

  const usedActivityTypes = form.conditions.map((row) => row.activityType);
  const usedRewardTypes = form.rewards.map((row) => row.type);
  const periodSelectOptions = withCurrent(periodOptions, form.periodType);

  return (
    <Modal show={show} onHide={() => !isSubmitting && onHide()} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold">
          <i className="bi bi-flag-fill me-2"/>
          미션 {isEdit ? '수정' : '등록'}
          <span className="ms-2 small text-body-secondary font-monospace fw-normal">{groupCode}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isEnumUnavailable && !isEnumLoading && (
          <div className="alert alert-warning py-2 small">
            서버에서 미션 타입 목록(MissionActivityType·MissionPeriodType·MissionRewardType)을 불러오지 못했습니다.
            {isEdit ? ' 기존 값은 유지되지만 다른 타입은 선택할 수 없습니다.' : ' 잠시 후 다시 시도해주세요.'}
          </div>
        )}
        {isLoading || isEnumLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">미션 정보 불러오는 중</span>
            </div>
          </div>
        ) : loadFailed ? (
          <div className="alert alert-danger mb-0">미션 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</div>
        ) : (
          <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <Field label="미션 제목" required error={errors.title} htmlFor="mission-title">
                <input
                  id="mission-title"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  value={form.title}
                  maxLength={MISSION_TITLE_MAX_LENGTH}
                  onChange={(e) => setField('title', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="예: 오늘의 가게 탐방"
                />
                <div className="form-text text-end">{form.title.length} / {MISSION_TITLE_MAX_LENGTH}</div>
              </Field>

              <Field label="기간 타입" required col="col-12 col-md-6" htmlFor="mission-period"
                     error={errors.periodType}>
                <select
                  id="mission-period"
                  className={`form-select ${errors.periodType ? 'is-invalid' : ''}`}
                  value={form.periodType}
                  onChange={(e) => setField('periodType', e.target.value)}
                  // 기간 타입은 등록 후 변경할 수 없습니다.
                  disabled={isSubmitting || isEdit}
                >
                  {periodSelectOptions.length === 0 && <option value="">선택 가능한 기간 타입이 없습니다</option>}
                  {periodSelectOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
                  ))}
                </select>
                <div className="form-text">
                  {isEdit ? '기간 타입은 변경할 수 없습니다.' : '등록 후에는 변경할 수 없습니다.'}
                </div>
              </Field>

              <Field label="최대 완료 횟수" required col="col-12 col-md-6" error={errors.maxCompletionCount}
                     htmlFor="mission-max-completion-count">
                <div className="input-group">
                  <input
                    id="mission-max-completion-count"
                    type="number"
                    min={MISSION_MAX_COMPLETION_COUNT_MIN}
                    max={MISSION_MAX_COMPLETION_COUNT_MAX}
                    step={1}
                    className={`form-control ${errors.maxCompletionCount ? 'is-invalid' : ''}`}
                    value={form.maxCompletionCount}
                    onChange={(e) => setField('maxCompletionCount', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span className="input-group-text">회</span>
                </div>
                <div className="form-text">
                  기간 내 완료 가능한 회차 수({MISSION_MAX_COMPLETION_COUNT_MIN}~{MISSION_MAX_COMPLETION_COUNT_MAX}).
                  조건을 목표 횟수만큼 채울 때마다 1회차가 완료되어 리워드가 지급됩니다.
                </div>
              </Field>

              <Field label="노출 순서" required col="col-6 col-md-3" error={errors.displayOrder}
                     htmlFor="mission-display-order">
                <input
                  id="mission-display-order"
                  type="number"
                  step={1}
                  className={`form-control ${errors.displayOrder ? 'is-invalid' : ''}`}
                  value={form.displayOrder}
                  onChange={(e) => setField('displayOrder', e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="form-text">작은 값이 먼저 노출됩니다.</div>
              </Field>

              <Field label="노출 여부" col="col-6 col-md-3">
                <div className="form-check form-switch mt-2">
                  <input
                    id="mission-visible"
                    type="checkbox"
                    role="switch"
                    className="form-check-input"
                    checked={form.isVisible}
                    onChange={(e) => setField('isVisible', e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <label className="form-check-label" htmlFor="mission-visible">
                    {form.isVisible ? '노출' : '비노출'}
                  </label>
                </div>
              </Field>

              <Field label="완료 조건" required error={errors.conditions}>
                <div className="form-text mt-0 mb-2">모든 조건을 충족해야 한 회차가 완료됩니다.</div>
                <div className="d-flex flex-column gap-2">
                  {form.conditions.map((row, index) => (
                    <div key={index}>
                      <div className="d-flex gap-2 align-items-center">
                        <select
                          className="form-select"
                          aria-label={`조건 ${index + 1} 활동 타입`}
                          value={row.activityType}
                          onChange={(e) => updateCondition(index, {activityType: e.target.value})}
                          disabled={isSubmitting}
                        >
                          {withCurrent(activityOptions, row.activityType).map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={option.value !== row.activityType && usedActivityTypes.includes(option.value)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="input-group" style={{maxWidth: 160}}>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            aria-label={`조건 ${index + 1} 목표 횟수`}
                            className={`form-control ${errors[`conditions.${index}`] ? 'is-invalid' : ''}`}
                            value={row.targetCount}
                            onChange={(e) => updateCondition(index, {targetCount: e.target.value})}
                            disabled={isSubmitting}
                          />
                          <span className="input-group-text">회</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger flex-shrink-0"
                          onClick={() => removeCondition(index)}
                          disabled={isSubmitting || form.conditions.length <= 1}
                          aria-label={`조건 ${index + 1} 삭제`}
                        >
                          <i className="bi bi-trash"/>
                        </button>
                      </div>
                      {errors[`conditions.${index}`] && (
                        <div className="invalid-feedback d-block">{errors[`conditions.${index}`]}</div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={addCondition}
                  disabled={isSubmitting || !firstUnused(activityOptions, usedActivityTypes)}
                >
                  <i className="bi bi-plus-lg me-1"/>조건 추가
                </button>
              </Field>

              <Field label="리워드" required error={errors.rewards}>
                <div className="d-flex flex-column gap-2">
                  {form.rewards.map((row, index) => (
                    <div key={index}>
                      <div className="d-flex gap-2 align-items-center">
                        <select
                          className="form-select"
                          aria-label={`리워드 ${index + 1} 타입`}
                          value={row.type}
                          onChange={(e) => updateReward(index, {type: e.target.value})}
                          disabled={isSubmitting}
                        >
                          {withCurrent(rewardOptions, row.type).map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={option.value !== row.type && usedRewardTypes.includes(option.value)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {row.type === POINT_REWARD_TYPE && (
                          <div className="input-group" style={{maxWidth: 200}}>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              aria-label={`리워드 ${index + 1} 지급 포인트`}
                              className={`form-control ${errors[`rewards.${index}`] ? 'is-invalid' : ''}`}
                              value={row.amount}
                              onChange={(e) => updateReward(index, {amount: e.target.value})}
                              disabled={isSubmitting}
                              placeholder="지급 포인트"
                            />
                            <span className="input-group-text">P</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-danger flex-shrink-0"
                          onClick={() => removeReward(index)}
                          disabled={isSubmitting || form.rewards.length <= 1}
                          aria-label={`리워드 ${index + 1} 삭제`}
                        >
                          <i className="bi bi-trash"/>
                        </button>
                      </div>
                      {errors[`rewards.${index}`] && (
                        <div className="invalid-feedback d-block">{errors[`rewards.${index}`]}</div>
                      )}
                    </div>
                  ))}
                </div>
                {!!firstUnused(rewardOptions, usedRewardTypes) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={addReward}
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-plus-lg me-1"/>리워드 추가
                  </button>
                )}
              </Field>
            </div>

            {isEdit && (
              <div className="alert alert-light border mt-3 mb-0 py-2 small text-body-secondary">
                조건·리워드를 바꿔도 이번 기간에 이미 완료한 유저는 기존 보상을 유지하며, 변경 내용은 미완료 유저와
                다음 기간부터 적용됩니다. 영향을 줄이려면 자정(KST) 직후에 변경하는 것을 권장합니다.
              </div>
            )}
          </form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>
          취소
        </button>
        <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={isBusy || loadFailed || isCreateBlocked}>
          {isSubmitting && <span className="spinner-border spinner-border-sm me-1"/>}
          {isEdit ? '수정' : '등록'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const Field = ({label, required, error, col = 'col-12', htmlFor, children}: {
  label: string;
  required?: boolean;
  error?: string;
  col?: string;
  htmlFor?: string;
  children: ReactNode;
}) => (
  <div className={col}>
    <label className="form-label fw-semibold" htmlFor={htmlFor}>
      {label}
      {required && <span className="text-danger ms-1">*</span>}
    </label>
    {children}
    {error && <div className="invalid-feedback d-block">{error}</div>}
  </div>
);

export default MissionFormModal;
