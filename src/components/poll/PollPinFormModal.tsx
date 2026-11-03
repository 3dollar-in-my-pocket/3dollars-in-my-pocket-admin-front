import {FormEvent, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import pollApi from '@/api/pollApi';
import PollPicker from '@/components/poll/PollPicker';
import {Poll, PollPin, PollPinPoll, UpdatePollPinRequest} from '@/types/poll';

export const POLL_PIN_MIN_POSITION = 1;
export const POLL_PIN_MAX_POSITION = 30;

interface PollPinFormModalProps {
  show: boolean;
  categoryId: string;
  /** 수정 대상. 없으면 신규 등록 */
  pin?: PollPin | null;
  /** 신규 등록 시 미리 선택된 투표 */
  poll?: Poll | null;
  onHide: () => void;
  onSuccess: () => void;
}

interface PinForm {
  position: string;
  startDateTime: string;
  endDateTime: string;
}

const emptyForm: PinForm = {position: '', startDateTime: '', endDateTime: ''};

/** API 일시(yyyy-MM-ddTHH:mm:ss) → datetime-local 입력값 */
const toLocal = (value?: string | null) => (value ? value.slice(0, 19) : '');
/** datetime-local 입력값 → API 일시. 초가 생략된 값은 :00을 붙인다. */
const toApi = (value: string) => (value.length === 16 ? `${value}:00` : value);

const PollPinFormModal = ({show, categoryId, pin, poll, onHide, onSuccess}: PollPinFormModalProps) => {
  const isEdit = Boolean(pin);
  const [form, setForm] = useState<PinForm>(emptyForm);
  /** 신규 등록 시 선택된 투표 */
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) return;
    setSelectedPoll(pin ? null : poll ?? null);
    setForm(pin ? {
      position: String(pin.position),
      startDateTime: toLocal(pin.startDateTime),
      endDateTime: toLocal(pin.endDateTime)
    } : {
      ...emptyForm,
      startDateTime: toLocal(poll?.period?.startDateTime),
      endDateTime: toLocal(poll?.period?.endDateTime)
    });
  }, [show, pin, poll]);

  const change = (key: keyof PinForm, value: string) => setForm(prev => ({...prev, [key]: value}));

  /** 투표 선택 시 비어 있는 노출 기간은 투표 기간으로 채운다. */
  const selectPoll = (target: Poll) => {
    setSelectedPoll(target);
    setForm(prev => ({
      ...prev,
      startDateTime: prev.startDateTime || toLocal(target.period.startDateTime),
      endDateTime: prev.endDateTime || toLocal(target.period.endDateTime)
    }));
  };

  /** 화면에 표시할 대상 투표 (수정: 고정 설정의 투표, 등록: 선택한 투표) */
  const targetPoll: Poll | PollPinPoll | null = isEdit ? pin?.poll ?? null : selectedPoll;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const position = Number(form.position);
    if (!Number.isInteger(position) || position < POLL_PIN_MIN_POSITION || position > POLL_PIN_MAX_POSITION) {
      toast.warning(`고정 위치는 ${POLL_PIN_MIN_POSITION}~${POLL_PIN_MAX_POSITION} 사이로 입력해주세요.`);
      return;
    }
    const startDateTime = toApi(form.startDateTime);
    const endDateTime = toApi(form.endDateTime);
    if (endDateTime < startDateTime) {
      toast.warning('종료 일시는 시작 일시보다 빠를 수 없습니다.');
      return;
    }

    setSubmitting(true);
    try {
      if (pin) {
        // partial update: 변경된 필드만 전달
        const request: UpdatePollPinRequest = {};
        if (position !== pin.position) request.position = position;
        if (startDateTime !== toApi(toLocal(pin.startDateTime))) request.startDateTime = startDateTime;
        if (endDateTime !== toApi(toLocal(pin.endDateTime))) request.endDateTime = endDateTime;
        if (Object.keys(request).length === 0) {
          toast.info('변경된 내용이 없습니다.');
          return;
        }
        const response = await pollApi.updatePollPin(pin.pollPinId, request);
        if (!response.ok) return;
        toast.success('고정 설정이 수정되었습니다.');
      } else {
        if (!selectedPoll) {
          toast.warning('고정할 투표를 선택해주세요.');
          return;
        }
        const response = await pollApi.createPollPin({
          categoryId,
          pollId: selectedPoll.pollId,
          position,           startDateTime,
          endDateTime
        });
        if (!response.ok) return;
        toast.success('투표가 고정되었습니다.');
      }
      onSuccess();
      onHide();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={submitting ? undefined : onHide}
      backdrop={submitting ? 'static' : true}
      centered
      size="lg"
      className="app-modal"
    >
      <form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? '투표 고정 수정' : '투표 고정 등록'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <div className="form-label">투표</div>
            {targetPoll ? (
              <div className="alert alert-light border py-2 mb-0 d-flex align-items-start gap-2">
                <div className="min-w-0 flex-grow-1">
                  <div className="fw-semibold text-truncate">
                    <i className="bi bi-bar-chart-fill me-1"/>
                    {targetPoll.content.title}
                  </div>
                  <div className="small text-muted text-truncate">
                    ID {targetPoll.pollId} · {targetPoll.options.map(option => option.name).join(' vs ')}
                  </div>
                </div>
                {!isEdit && !poll && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary flex-shrink-0"
                    onClick={() => setSelectedPoll(null)}
                    disabled={submitting}
                  >
                    변경
                  </button>
                )}
              </div>
            ) : isEdit ? (
              <div className="alert alert-warning py-2 mb-0 small">
                <i className="bi bi-exclamation-triangle me-1"/>
                삭제된 투표입니다. (ID {pin?.pollId})
              </div>
            ) : (
              <PollPicker categoryId={categoryId} onSelect={selectPoll}/>
            )}
            {isEdit && <div className="form-text">투표는 수정할 수 없습니다. 삭제 후 다시 등록해주세요.</div>}
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="poll-pin-position">
                고정 위치 ({POLL_PIN_MIN_POSITION}~{POLL_PIN_MAX_POSITION})
              </label>
              <input
                id="poll-pin-position"
                type="number"
                min={POLL_PIN_MIN_POSITION}
                max={POLL_PIN_MAX_POSITION}
                className="form-control"
                required
                value={form.position}
                onChange={e => change('position', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="poll-pin-start">노출 시작</label>
              <input
                id="poll-pin-start"
                type="datetime-local"
                step={1}
                className="form-control"
                required
                value={form.startDateTime}
                onChange={e => change('startDateTime', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="poll-pin-end">노출 종료</label>
              <input
                id="poll-pin-end"
                type="datetime-local"
                step={1}
                className="form-control"
                required
                value={form.endDateTime}
                onChange={e => change('endDateTime', e.target.value)}
              />
            </div>
          </div>
          <ul className="small text-muted mt-3 mb-0 ps-3">
            <li>시작·종료 시각을 모두 포함합니다. 같은 위치를 연속 교체할 때는 앞 설정 종료 시각을 다음 시작 시각보다 앞서게 입력하세요.</li>
            <li>앱 인기 투표 목록의 첫 페이지에서만 적용되며, 목록 크기보다 큰 위치는 노출되지 않습니다.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onHide} disabled={submitting}>
            취소
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '처리 중...' : isEdit ? '수정' : '고정'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PollPinFormModal;
