import {FormEvent, ReactNode, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import raffleApi from '@/api/raffleApi';
import useEnumOptions, {EnumSelectOption} from '@/hooks/useEnumOptions';
import useImageUpload from '@/hooks/useImageUpload';
import {POINT_TICKET_ENUM_NAME} from '@/types/point';
import {
  POINT_RAFFLE_COST_TYPE,
  Raffle,
  RAFFLE_DESCRIPTION_MAX_LENGTH,
  RAFFLE_ENUM_NAMES,
  RAFFLE_TITLE_MAX_LENGTH,
  UpdateRaffleRequest,
} from '@/types/raffle';

const FORM_ID = 'raffle-form';

/** 숫자 입력은 빈 값을 표현하기 위해 문자열로 보관하고 제출 시 변환합니다. */
interface FormData {
  title: string;
  description: string;
  /** 비우면 이미지 없음(image = null) */
  imageUrl: string;
  imageWidth: string;
  imageHeight: string;
  /** 비우면 추첨 인원 미정(winnerCount = null) */
  winnerCount: string;
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
const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
/** 빈 값은 null, 그 외는 숫자로 변환합니다. (선택 숫자 필드) */
const toOptionalNumber = (value: string) => (value.trim() ? Number(value) : null);

/** 업로드한 이미지의 원본 크기를 읽습니다. 실패하면 null */
const readImageSize = (url: string) => new Promise<{ width: number; height: number } | null>((resolve) => {
  const image = new Image();
  image.onload = () => resolve({width: image.naturalWidth, height: image.naturalHeight});
  image.onerror = () => resolve(null);
  image.src = url;
});

/** 서버 enum에서 빠진 값이라도 기존 값은 선택지에 남겨 의도치 않게 바뀌지 않도록 합니다. */
const withCurrent = (options: EnumSelectOption[], value: string): EnumSelectOption[] =>
  !value || options.some((option) => option.value === value) ? options : [...options, {value, label: value}];

/** 신규 등록 기본값. 각 enum의 첫 번째 값을 기본 선택하되, 비용 타입은 POINT가 있으면 POINT를 고릅니다. */
const emptyForm = (costTypeOptions: EnumSelectOption[], ticketOptions: EnumSelectOption[]): FormData => ({
  title: '',
  description: '',
  imageUrl: '',
  imageWidth: '',
  imageHeight: '',
  winnerCount: '',
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
  title: raffle.title,
  // PUT은 전체 교체라 선택 필드를 비워 보내면 지워집니다. 조회한 값을 그대로 채워 유지합니다.
  description: raffle.description ?? '',
  imageUrl: raffle.image?.imageUrl ?? '',
  imageWidth: raffle.image?.width != null ? String(raffle.image.width) : '',
  imageHeight: raffle.image?.height != null ? String(raffle.image.height) : '',
  winnerCount: raffle.winnerCount != null ? String(raffle.winnerCount) : '',
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
  /** 수정 대상 응모 ID (문자열 그대로 사용). null이면 신규 등록 */
  raffleId: string | null;
  onHide: () => void;
  onSuccess: () => void;
}

/**
 * 응모 대상 등록·수정 모달
 *
 * 등록 직후 상태는 ACTIVE(기간 안이면 즉시 노출·응모 가능)이며, 상태 변경은 수정에서만 할 수 있습니다.
 * 수정은 전체 교체(PUT)이므로 다른 관리자의 변경을 덮어쓰지 않도록 열 때마다 단건 조회로 최신 값을 채웁니다.
 */
const RaffleFormModal = ({show, ticket, ticketLabel, raffleId, onHide, onSuccess}: Props) => {
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
  const isEdit = !!raffleId;

  const {handleFileChange, isUploading} = useImageUpload({
    imageType: 'ADVERTISEMENT_IMAGE',
    onUploaded: async (url) => {
      setField('imageUrl', url);
      const size = await readImageSize(url);
      if (size) {
        setField('imageWidth', String(size.width));
        setField('imageHeight', String(size.height));
      }
    },
  });

  const isBusy = isSubmitting || isLoading || isEnumLoading || isUploading;
  // 신규 등록은 포인트 티켓 선택지가 있어야 합니다. 수정은 기존 값을 유지하므로 막지 않습니다.
  const isCreateBlocked = !isEdit && isEnumUnavailable;

  useEffect(() => {
    if (!show || raffleId || isEnumLoading) return;
    setErrors({});
    setLoadFailed(false);
    setForm(emptyForm(costTypeOptions, pointTicketOptions));
  }, [show, raffleId, isEnumLoading, costTypeOptions, pointTicketOptions]);

  useEffect(() => {
    if (!show || !raffleId) return;

    setErrors({});
    setLoadFailed(false);

    let cancelled = false;
    setIsLoading(true);
    raffleApi.getRaffle(ticket, raffleId)
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
  }, [show, ticket, raffleId]);

  const setField = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setForm((current) => ({...current, [name]: value}));
    setErrors((current) => ({...current, [name]: ''}));
  };

  /** 서버 검증 규칙을 미리 확인해 불필요한 요청을 줄입니다. 최종 판단은 서버가 합니다. */
  const validate = () => {
    const next: Record<string, string> = {};
    const title = form.title.trim();

    if (!title) next.title = '응모 제목을 입력해주세요.';
    else if (title.length > RAFFLE_TITLE_MAX_LENGTH) {
      next.title = `응모 제목은 최대 ${RAFFLE_TITLE_MAX_LENGTH}자까지 입력할 수 있습니다.`;
    }

    if (form.description.trim().length > RAFFLE_DESCRIPTION_MAX_LENGTH) {
      next.description = `응모 설명은 최대 ${RAFFLE_DESCRIPTION_MAX_LENGTH}자까지 입력할 수 있습니다.`;
    }

    const imageUrl = form.imageUrl.trim();
    if (imageUrl) {
      if (!isHttpUrl(imageUrl)) next.imageUrl = '이미지 URL 형식이 올바르지 않습니다.';
      if (form.imageWidth.trim() && !isPositiveInteger(form.imageWidth)) {
        next.imageWidth = '이미지 너비는 0보다 큰 정수여야 합니다.';
      }
      if (form.imageHeight.trim() && !isPositiveInteger(form.imageHeight)) {
        next.imageHeight = '이미지 높이는 0보다 큰 정수여야 합니다.';
      }
    } else if (form.imageWidth.trim() || form.imageHeight.trim()) {
      next.imageUrl = '이미지 크기를 입력하려면 이미지 URL을 입력해주세요.';
    }

    if (form.winnerCount.trim() && !isPositiveInteger(form.winnerCount)) {
      next.winnerCount = '추첨 인원은 0보다 큰 정수여야 합니다.';
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
      const imageUrl = form.imageUrl.trim();
      const description = form.description.trim();
      // 선택 필드도 항상 명시적으로 보냅니다. (PUT에서 생략하면 null로 지워짐)
      const request: Omit<UpdateRaffleRequest, 'status'> = {
        title: form.title.trim(),
        description: description || null,
        image: imageUrl
          ? {url: imageUrl, width: toOptionalNumber(form.imageWidth), height: toOptionalNumber(form.imageHeight)}
          : null,
        winnerCount: toOptionalNumber(form.winnerCount),
        cost: {type: POINT_RAFFLE_COST_TYPE, pointTicket: form.pointTicket, amount: Number(form.amount)},
        startDateTime: toApi(form.startDateTime),
        endDateTime: toApi(form.endDateTime),
      };
      const response = raffleId
        ? await raffleApi.updateRaffle(ticket, raffleId, {...request, status: form.status})
        : await raffleApi.createRaffle(ticket, request);
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

              <Field label="응모 설명" error={errors.description} htmlFor="raffle-description">
                <textarea
                  id="raffle-description"
                  rows={3}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  value={form.description}
                  maxLength={RAFFLE_DESCRIPTION_MAX_LENGTH}
                  onChange={(e) => setField('description', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="비우면 설명 없음"
                />
                <div className="form-text text-end">
                  {form.description.length} / {RAFFLE_DESCRIPTION_MAX_LENGTH}
                </div>
              </Field>

              <Field label="대표 이미지 URL" error={errors.imageUrl} htmlFor="raffle-image-url">
                <div className="input-group">
                  <input
                    id="raffle-image-url"
                    type="url"
                    className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`}
                    value={form.imageUrl}
                    onChange={(e) => setField('imageUrl', e.target.value)}
                    disabled={isSubmitting || isUploading}
                    placeholder="비우면 이미지 없음"
                  />
                  <label className={`btn btn-outline-primary mb-0 ${isSubmitting || isUploading ? 'disabled' : ''}`}>
                    {isUploading
                      ? <><span className="spinner-border spinner-border-sm me-1"/>업로드 중</>
                      : <><i className="bi bi-upload me-1"/>파일 선택</>}
                    <input type="file" accept="image/*" hidden disabled={isSubmitting || isUploading}
                           onChange={(e) => handleFileChange(e)}/>
                  </label>
                </div>
                {form.imageUrl.trim() && isHttpUrl(form.imageUrl.trim()) && (
                  <img src={form.imageUrl.trim()} alt="대표 이미지 미리보기" className="rounded border mt-2"
                       style={{maxWidth: 160, maxHeight: 120, objectFit: 'contain'}}/>
                )}
              </Field>

              <Field label="이미지 너비" col="col-6 col-md-4" error={errors.imageWidth} htmlFor="raffle-image-width">
                <div className="input-group">
                  <input
                    id="raffle-image-width"
                    type="number"
                    min={1}
                    step={1}
                    className={`form-control ${errors.imageWidth ? 'is-invalid' : ''}`}
                    value={form.imageWidth}
                    onChange={(e) => setField('imageWidth', e.target.value)}
                    disabled={isSubmitting || isUploading}
                    placeholder="선택"
                  />
                  <span className="input-group-text">px</span>
                </div>
              </Field>

              <Field label="이미지 높이" col="col-6 col-md-4" error={errors.imageHeight} htmlFor="raffle-image-height">
                <div className="input-group">
                  <input
                    id="raffle-image-height"
                    type="number"
                    min={1}
                    step={1}
                    className={`form-control ${errors.imageHeight ? 'is-invalid' : ''}`}
                    value={form.imageHeight}
                    onChange={(e) => setField('imageHeight', e.target.value)}
                    disabled={isSubmitting || isUploading}
                    placeholder="선택"
                  />
                  <span className="input-group-text">px</span>
                </div>
              </Field>

              <Field label="추첨 인원" col="col-12 col-md-4" error={errors.winnerCount} htmlFor="raffle-winner-count">
                <div className="input-group">
                  <input
                    id="raffle-winner-count"
                    type="number"
                    min={1}
                    step={1}
                    className={`form-control ${errors.winnerCount ? 'is-invalid' : ''}`}
                    value={form.winnerCount}
                    onChange={(e) => setField('winnerCount', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="비우면 미정"
                  />
                  <span className="input-group-text">명</span>
                </div>
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
