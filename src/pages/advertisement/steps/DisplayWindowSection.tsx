import {Col, Form, Row} from "react-bootstrap";
import {AdvertisementDisplayWindow, DayOfTheWeek} from "@/types/advertisement";
import {DAYS_OF_WEEK, isOvernightWindow, sortDaysOfWeek} from "@/utils/display/advertisementDisplay";
import {validateDisplayWindow} from "@/utils/validation/advertisementValidation";

interface DisplayWindowSectionProps {
  /** null 이면 요일·시간대 제한 없음 */
  value: AdvertisementDisplayWindow | null;
  onChange: (value: AdvertisementDisplayWindow | null) => void;
}

const DEFAULT_WINDOW: AdvertisementDisplayWindow = {
  daysOfWeek: DAYS_OF_WEEK.map(({key}) => key),
  startTime: null,
  endTime: null,
};

const DisplayWindowSection = ({value, onChange}: DisplayWindowSectionProps) => {
  const enabled = !!value;
  const error = validateDisplayWindow(value);

  const toggleDay = (day: DayOfTheWeek) => {
    const days = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter((d) => d !== day)
      : [...value.daysOfWeek, day];
    onChange({...value, daysOfWeek: sortDaysOfWeek(days)});
  };

  const changeTime = (field: "startTime" | "endTime", time: string) => {
    // <input type="time"> 은 HH:mm 을 반환합니다. 비우면 null(종일)로 둡니다.
    onChange({...value, [field]: time ? time.slice(0, 5) : null});
  };

  return (
    <div className="bg-light rounded p-3 p-md-4">
      <div className="d-flex align-items-center mb-3">
        <div className="bg-secondary-subtle rounded-circle p-2 me-3">
          <i className="bi bi-calendar-week text-secondary fs-5"></i>
        </div>
        <h6 className="mb-0 text-secondary fw-bold">요일·시간대 노출 제한</h6>
        <div className="form-check form-switch mb-0 ms-auto">
          <input
            id="ad-display-window-enabled"
            type="checkbox"
            className="form-check-input"
            role="switch"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked ? DEFAULT_WINDOW : null)}
          />
          <label className="form-check-label" htmlFor="ad-display-window-enabled">
            {enabled ? "사용" : "제한 없음"}
          </label>
        </div>
      </div>

      {!enabled ? (
        <Form.Text className="text-muted">
          제한이 없으면 노출 기간 동안 항상 노출됩니다.
        </Form.Text>
      ) : (
        <>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold" id="ad-display-window-days">
              노출 요일 <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex gap-2 flex-wrap" role="group" aria-labelledby="ad-display-window-days">
              {DAYS_OF_WEEK.map(({key, label}) => {
                const checked = value.daysOfWeek.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`btn flex-fill ${checked ? "btn-primary" : "btn-outline-secondary"}`}
                    aria-pressed={checked}
                    onClick={() => toggleDay(key)}
                    style={{minWidth: '44px', borderRadius: '8px'}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Form.Group>

          <Row className="g-3">
            <Col xs={6}>
              <Form.Group controlId="ad-display-window-start">
                <Form.Label className="fw-semibold">시작 시각</Form.Label>
                <Form.Control
                  type="time"
                  step={60}
                  value={value.startTime || ""}
                  onChange={(e) => changeTime("startTime", e.target.value)}
                  style={{borderRadius: '8px'}}
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group controlId="ad-display-window-end">
                <Form.Label className="fw-semibold">종료 시각 (미포함)</Form.Label>
                <Form.Control
                  type="time"
                  step={60}
                  value={value.endTime || ""}
                  onChange={(e) => changeTime("endTime", e.target.value)}
                  style={{borderRadius: '8px'}}
                />
              </Form.Group>
            </Col>
          </Row>

          {error ? (
            <Form.Text className="text-danger d-block mt-2">
              <i className="bi bi-exclamation-circle me-1"></i>
              {error}
            </Form.Text>
          ) : (
            <Form.Text className="text-muted d-block mt-2">
              {!value.startTime
                ? "시각을 비우면 선택한 요일에 종일 노출됩니다."
                : `${value.startTime}부터 ${value.endTime} 전까지 노출됩니다.`}
              {" "}서버 시각(KST) 기준이며, 노출 기간과 함께 만족할 때만 노출됩니다.
            </Form.Text>
          )}

          {!error && isOvernightWindow(value) && (
            <Form.Text className="text-warning d-block mt-1">
              <i className="bi bi-moon-stars me-1"></i>
              자정을 넘는 구간입니다. 요일은 시작 시각 기준이라, 선택한 요일의 다음날
              {` ${value.endTime}`} 전까지도 노출됩니다. (예: 토 {value.startTime} 선택 시 일 {value.endTime} 전까지 노출)
            </Form.Text>
          )}
        </>
      )}
    </div>
  );
};

export default DisplayWindowSection;
