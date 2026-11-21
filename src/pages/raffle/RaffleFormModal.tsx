import {FormEvent, ReactNode, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import raffleApi from '@/api/raffleApi';
import useEnumOptions, {EnumSelectOption} from '@/hooks/useEnumOptions';
import {POINT_TICKET_ENUM_NAME} from '@/types/point';
import {
  POINT_RAFFLE_COST_TYPE,
  Raffle,
  RAFFLE_CODE_MAX_LENGTH,
  RAFFLE_CODE_PATTERN,
  RAFFLE_ENUM_NAMES,
  RAFFLE_TITLE_MAX_LENGTH,
  UpdateRaffleRequest,
} from '@/types/raffle';

const FORM_ID = 'raffle-form';

/** 숫자 입력은 빈 값을 표현하기 위해 문자열로 보관하고 제출 시 변환합니다. */
interface FormData {
  /** 등록 시에만 입력. 수정에서는 읽기 전용 */
  code: string;
  title: string;
  /** 비용 타입 (RaffleEntryCostType) */
  costType: string;
  /** 포인트 티켓 (costType=POINT에서만 사용) */
  pointTicket: string;
  amount: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
}

/** API 일시(yyyy-MM-ddTHH:mm:ss) → datetime-local 입력값 */
const toLocal = (value?: string | null) => (value ? value.slice(0, 19) : '');
/** datetime-local 입력값 → API 일시. 초가 생략된 값은 :00을 붙입니다. */
const toApi = (value: string) => (value.length === 16 ? `${value}:00` : value);

const isPositiveInteger = (value: string) => /^\d+$/.test(value.trim()) && Number(value) > 0;

/** 서버 enum에서 빠진 값이라도 기존 값은 선택지에 남겨 의도치 않게 바뀌지 않도록 합니다. */
const withCurrent = (options: EnumSelectOption[], value: string): EnumSelectOption[] =>
  !value || options.some((option) => option.value === value) ? options : [...options, {value, label: value}];

/** 신규 등록 기본값. 각 enum의 첫 번째 값을 기본 선택하되, 비용 타입은 POINT가 있으면 POINT를 고릅니다. */
const emptyForm = (costTypeOptions: EnumSelectOption[], ticketOptions: EnumSelectOption[]): FormData => ({
  code: '',
  title: '',
  costType: costTypeOptions.find((option) => option.value === POINT_RAFFLE_COST_TYPE)?.value
    ?? costTypeOptions[0]?.value ?? '',
  pointTicket: ticketOptions[0]?.value ?? '',
  amount: '',
  startDateTime: '',
  endDateTime: '',
  // 등록 요청에는 status가 없으며 서버가 ACTIVE로 등록합니다. (수정에서만 사용)
  status: '',
});

const fromRaffle = (raffle: Raffle): FormData => ({
  code: raffle.code,
  title: raffle.title,
  // 수정(PUT)은 cost를 통째로 다시 보내므로 조회한 값을 그대로 채웁니다.
  costType: raffle.cost?.type ?? '',
  pointTicket: raffle.cost?.pointTicket ?? '',
  amount: String(raffle.cost?.amount ?? ''),
  startDateTime: toLocal(raffle.startDateTime),
  endDateTime: toLocal(raffle.endDateTime),
  status: raffle.status,
});

interface Props {
  show: boolean;
  /** 응모 티켓 (RaffleTicket) */
  ticket: string;
  ticketLabel: string;
  /** 수정 대상 응모 코드. null이면 신규 등록 */
  raffleCode: string | null;
  onHide: () => void;
  onSuccess: () => void;
}

/**
 * 응모 대상 등록·수정 모달
 *
 * 등록 직후 상태는 ACTIVE(기간 안이면 즉시 노출·응모 가능)이며, 상태 변경은 수정에서만 할 수 있습니다.
 * code는 등록 후 바꿀 수 없어 수정에서는 읽기 전용으로 보여줍니다.
 * 수정은 전체 교체(PUT)이므로 다른 관리자의 변경을 덮어쓰지 않도록 열 때마다 단건 조회로 최신 값을 채웁니다.
 */
const RaffleFormModal = ({show, ticket, ticketLabel, raffleCode, onHide, onSuccess}: Props) => {
  const costTypeEnum = useEnumOptions(RAFFLE_ENUM_NAMES.costType);
  const pointTicketEnum = useEnumOptions(POINT_TICKET_ENUM_NAME);
  const statusEnum = useEnumOptions(RAFFLE_ENUM_NAMES.status);
  const costTypeOptions = costTypeEnum.options;
  const pointTicketOptions = pointTicketEnum.options;
  const statusOptions = statusEnum.options;
  const isEnumLoading = costTypeEnum.isLoading || pointTicketEnum.isLoading || statusEnum.isLoading;
  const isEnumUnavailable = [costTypeEnum, pointTicketEnum, statusEnum]
    .some((item) => item.isError || item.isMissing || (!item.isLoading && item.options.length === 0));

  const [form, setForm] = useState<FormData>(() => emptyForm([], []));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!raffleCode;
  const isBusy = isSubmitting || isLoading || isEnumLoading;
  // 신규 등록은 포인트 티켓 선택지가 있어야 합니다. 수정은 기존 값을 유지하므로 막지 않습니다.
  const isCreateBlocked = !isEdit && isEnumUnavailable;

  useEffect(() => {
    if (!show || raffleCode || isEnumLoading) return;
    setErrors({});
    setLoadFailed(false);
    setForm(emptyForm(costTypeOptions, pointTicketOptions));
  }, [show, raffleCode, isEnumLoading, costTypeOptions, pointTicketOptions]);

  useEffect(() => {
    if (!show || !raffleCode) return;

    setErrors({});
    setLoadFailed(false);

    let cancelled = false;
    setIsLoading(true);
    raffleApi.getRaffle(ticket, raffleCode)
      .then((response) => {
        if (cancelled) return;
        if (!response.ok) {
          setLoadFailed(true);
          return;
        }
        setForm(fromRaffle(response.data));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [show, ticket, raffleCode]);

  const setField = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setForm((current) => ({...current, [name]: value}));
    setErrors((current) => ({...current, [name]: ''}));
  };

  /** 서버 검증 규칙을 미리 확인해 불필요한 요청을 줄입니다. 최종 판단은 서버가 합니다. */
  const validate = () => {
    const next: Record<string, string> = {};
    const title = form.title.trim();

    if (!isEdit) {
      const code = form.code.trim();
      if (!code) next.code = '응모 코드를 입력해주세요.';
      else if (code.length > RAFFLE_CODE_MAX_LENGTH) {
        next.code = `응모 코드는 최대 ${RAFFLE_CODE_MAX_LENGTH}자까지 입력할 수 있습니다.`;
      } else if (!RAFFLE_CODE_PATTERN.test(code)) next.code = '응모 코드는 영소문자·숫자·-·_로만 입력해주세요.';
    }

    if (!title) next.title = '응모 제목을 입력해주세요.';
    else if (title.length > RAFFLE_TITLE_MAX_LENGTH) {
      next.title = `응모 제목은 최대 ${RAFFLE_TITLE_MAX_LENGTH}자까지 입력할 수 있습니다.`;
    }

    if (!form.costType) next.costType = '응모 비용 타입을 선택해주세요.';
    else if (form.costType !== POINT_RAFFLE_COST_TYPE) {
      // 서버 enum에 새 비용 타입이 추가돼도 화면이 입력 구조를 모르면 저장할 수 없습니다.
      next.costType = '아직 화면에서 지원하지 않는 비용 타입입니다.';
    } else {
      if (!form.pointTicket) next.pointTicket = '차감할 포인트 티켓을 선택해주세요.';
      if (!form.amount.trim()) next.amount = '응모 포인트를 입력해주세요.';
      else if (!isPositiveInteger(form.amount)) next.amount = '응모 포인트는 0보다 큰 정수여야 합니다.';
    }

    if (!form.startDateTime) next.startDateTime = '시작 일시를 입력해주세요.';
    if (!form.endDateTime) next.endDateTime = '종료 일시를 입력해주세요.';
    // 서버는 시작=종료를 허용하지만 종료 미포함이라 응모 가능한 시점이 없어 저장 전에 막습니다.
    else if (form.startDateTime && toApi(form.endDateTime) <= toApi(form.startDateTime)) {
      next.endDateTime = '종료 일시는 시작 일시보다 이후여야 합니다.';
    }

    if (isEdit && !form.status) next.status = '상태를 선택해주세요.';

    setErrors(next);
    return Object.values(next).every((message) => !message);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isBusy || loadFailed || isCreateBlocked || !validate()) return;

    setIsSubmitting(true);
    try {
      const request: Omit<UpdateRaffleRequest, 'status'> = {
        title: form.title.trim(),
        cost: {type: POINT_RAFFLE_COST_TYPE, pointTicket: form.pointTicket, amount: Number(form.amount)},
        startDateTime: toApi(form.startDateTime),
        endDateTime: toApi(form.endDateTime),
      };
      const response = raffleCode
        ? await raffleApi.updateRaffle(ticket, raffleCode, {...request, status: form.status})
        : await raffleApi.createRaffle(ticket, {...request, code: form.code.trim()});
      // 실패 메시지는 공통 인터셉터가 서버 message 그대로 토스트로 노출합니다.
      if (!response.ok) return;

      toast.success(isEdit
        ? '응모가 수정되었습니다. 앱에는 캐시로 인해 최대 3분 늦게 반영될 수 있습니다.'
        : '응모가 등록되었습니다. 응모 기간이 되면 앱에 바로 노출됩니다.');
      onSuccess();
      onHide();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !isSubmitting && onHide()} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold">
          <i className="bi bi-ticket-perforated-fill me-2"/>
          응모 {isEdit ? '수정' : '등록'}
          <span className="ms-2 small text-body-secondary fw-normal">{ticketLabel}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isEnumUnavailable && !isEnumLoading && (
          <div className="alert alert-warning py-2 small">
            서버에서 응모 비용 타입·포인트 티켓·응모 상태 목록(RaffleEntryCostType·PointTicket·RaffleStatus)을 불러오지 못했습니다.
            {isEdit ? ' 기존 값은 유지되지만 다른 값은 선택할 수 없습니다.' : ' 잠시 후 다시 시도해주세요.'}
          </div>
        )}
        {isLoading || isEnumLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">응모 정보 불러오는 중</span>
            </div>
          </div>
        ) : loadFailed ? (
          <div className="alert alert-danger mb-0">응모 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</div>
        ) : (
          <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <Field label="응모 코드" required={!isEdit} error={errors.code} htmlFor="raffle-code">
                <input
                  id="raffle-code"
                  className={`form-control font-monospace ${errors.code ? 'is-invalid' : ''}`}
                  value={form.code}
                  maxLength={RAFFLE_CODE_MAX_LENGTH}
                  onChange={(e) => setField('code', e.target.value)}
                  // code는 등록 후 수정할 수 없습니다.
                  disabled={isSubmitting || isEdit}
                  placeholder="예: goods-a-set"
                  autoComplete="off"
                />
                <div className="form-text">
                  {isEdit
                    ? '응모 코드는 변경할 수 없습니다.'
                    : `영소문자·숫자·-·_ 최대 ${RAFFLE_CODE_MAX_LENGTH}자. 티켓 안에서 유일해야 하며 등록 후에는 변경할 수 없습니다.`}
                </div>
              </Field>

              <Field label="응모 제목" required error={errors.title} htmlFor="raffle-title">
                <input
                  id="raffle-title"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  value={form.title}
                  maxLength={RAFFLE_TITLE_MAX_LENGTH}
                  onChange={(e) => setField('title', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="예: 가슴속 3천원 키링"
                />
                <div className="form-text text-end">{form.title.length} / {RAFFLE_TITLE_MAX_LENGTH}</div>
              </Field>

              <Field label="응모 비용 타입" required error={errors.costType} htmlFor="raffle-cost-type">
                <select
                  id="raffle-cost-type"
                  className={`form-select ${errors.costType ? 'is-invalid' : ''}`}
                  value={form.costType}
                  onChange={(e) => setField('costType', e.target.value)}
                  disabled={isSubmitting}
                >
                  {costTypeOptions.length === 0 && !form.costType && (
                    <option value="">선택 가능한 비용 타입이 없습니다</option>
                  )}
                  {withCurrent(costTypeOptions, form.costType).map((option) => (
                    <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
                  ))}
                </select>
              </Field>

              {form.costType === POINT_RAFFLE_COST_TYPE && (<>
                <Field label="차감 포인트 티켓" required col="col-12 col-md-6" error={errors.pointTicket}
                       htmlFor="raffle-point-ticket">
                  <select
                    id="raffle-point-ticket"
                    className={`form-select ${errors.pointTicket ? 'is-invalid' : ''}`}
                    value={form.pointTicket}
                    onChange={(e) => setField('pointTicket', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">포인트 티켓 선택</option>
                    {withCurrent(pointTicketOptions, form.pointTicket).map((option) => (
                      <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
                    ))}
                  </select>
                </Field>

                <Field label="응모 포인트" required col="col-12 col-md-6" error={errors.amount}
                       htmlFor="raffle-amount">
                  <div className="input-group">
                    <input
                      id="raffle-amount"
                      type="number"
                      min={1}
                      step={1}
                      className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                      value={form.amount}
                      onChange={(e) => setField('amount', e.target.value)}
                      disabled={isSubmitting}
                      placeholder="1회 응모 시 차감"
                    />
                    <span className="input-group-text">P</span>
                  </div>
                </Field>
              </>)}

              <Field label="시작 일시" required col="col-12 col-md-6" error={errors.startDateTime}
                     htmlFor="raffle-start">
                <input
                  id="raffle-start"
                  type="datetime-local"
                  className={`form-control ${errors.startDateTime ? 'is-invalid' : ''}`}
                  value={form.startDateTime}
                  onChange={(e) => setField('startDateTime', e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="종료 일시" required col="col-12 col-md-6" error={errors.endDateTime}
                     htmlFor="raffle-end">
                <input
                  id="raffle-end"
                  type="datetime-local"
                  className={`form-control ${errors.endDateTime ? 'is-invalid' : ''}`}
                  value={form.endDateTime}
                  onChange={(e) => setField('endDateTime', e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="form-text">종료 일시는 응모 기간에 포함되지 않습니다.</div>
              </Field>

              {isEdit && (
                <Field label="상태" required error={errors.status} htmlFor="raffle-status">
                  <select
                    id="raffle-status"
                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                    disabled={isSubmitting}
                  >
                    {withCurrent(statusOptions, form.status).map((option) => (
                      <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
                    ))}
                  </select>
                  <div className="form-text">
                    진행(ACTIVE)일 때만 응모할 수 있고, 응모 중지(STOPPED)는 노출은 유지하되 응모를 막습니다.
                    비노출(HIDDEN)은 앱에서 내립니다. 기간 밖이면 상태와 관계없이 노출·응모되지 않습니다.
                  </div>
                </Field>
              )}
            </div>

            {!isEdit && (
              <div className="alert alert-light border mt-3 mb-0 py-2 small text-body-secondary">
                등록하면 진행(ACTIVE) 상태가 되어 응모 기간 안이면 앱에 바로 노출되고 응모할 수 있습니다.
                노출을 보류하려면 등록 후 수정에서 비노출(HIDDEN)로 바꿔주세요.
              </div>
            )}
          </form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>
          취소
        </button>
        <button type="submit" form={FORM_ID} className="btn btn-primary"
                disabled={isBusy || loadFailed || isCreateBlocked}>
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

export default RaffleFormModal;
