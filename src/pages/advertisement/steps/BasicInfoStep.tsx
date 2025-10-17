import React from "react";
import {Col, Form, Row} from "react-bootstrap";

const BasicInfoStep = ({
  formData,
  onChange,
  positions,
  platforms,
  disablePosition = false,
  disablePlatform = false,
}) => {
  const handleChange = (e) => {
    const {name, value} = e.target;
    onChange(name, value);
  };

  return (
    <div className="row g-3 g-md-4">
      {/* 캠페인 정보 */}
      <div className="col-12">
        <div className="bg-light rounded p-3 p-md-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-primary-subtle rounded-circle p-2 me-3">
              <i className="bi bi-tag text-primary fs-5"></i>
            </div>
            <h6 className="mb-0 text-primary fw-bold">캠페인 정보</h6>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-hash me-1"></i>
                  캠페인 ID <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="groupId"
                  value={formData.groupId || ""}
                  onChange={handleChange}
                  placeholder="ex) summer_promotion_2024"
                  className="form-control-lg"
                  style={{borderRadius: '8px'}}
                />
                <Form.Text className="text-muted">
                  고유한 캠페인 식별자를 입력하세요
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-chat-text me-1"></i>
                  광고 설명 (선택)
                </Form.Label>
                <Form.Control
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="ex) 가슴속 3천원 앱 홍보 캠페인"
                  className="form-control-lg"
                  style={{borderRadius: '8px'}}
                />
                <Form.Text className="text-muted">
                  관리자가 알아보기 쉬운 설명을 입력하세요
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div>

      {/* 노출 설정 */}
      <div className="col-12">
        <div className="bg-light rounded p-3 p-md-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-info-subtle rounded-circle p-2 me-3">
              <i className="bi bi-geo-alt text-info fs-5"></i>
            </div>
            <h6 className="mb-0 text-info fw-bold">노출 설정</h6>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-bullseye me-1"></i>
                  노출 구좌 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="position"
                  value={formData.position || ""}
                  onChange={handleChange}
                  disabled={disablePosition}
                  className="form-select-lg"
                  style={{borderRadius: '8px'}}
                >
                  <option value="">구좌를 선택하세요</option>
                  {positions
                    .filter((pos) => pos.key !== "")
                    .map((pos) => (
                      <option key={pos.key} value={pos.key}>
                        {pos.description}
                      </option>
                    ))}
                </Form.Select>
                {disablePosition && (
                  <Form.Text className="text-warning">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    수정 시 구좌는 변경할 수 없습니다
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-phone me-1"></i>
                  노출 대상 플랫폼 <span className="text-danger">*</span>
                </Form.Label>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className={`btn flex-fill ${formData.platform === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => !disablePlatform && onChange('platform', 'ALL')}
                    disabled={disablePlatform}
                    style={{
                      minHeight: '60px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className="d-flex flex-column align-items-center gap-1">
                      <div className="d-flex gap-2">
                        <i className="bi bi-android2" style={{fontSize: '1.2rem'}}></i>
                        <i className="bi bi-apple" style={{fontSize: '1.2rem'}}></i>
                      </div>
                      <span className="fw-semibold">전체 플랫폼</span>
                      <small style={{fontSize: '0.7rem'}}>ALL</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill ${formData.platform === 'AOS' ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => !disablePlatform && onChange('platform', 'AOS')}
                    disabled={disablePlatform}
                    style={{
                      minHeight: '60px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className="d-flex flex-column align-items-center gap-1">
                      <i className="bi bi-android2" style={{fontSize: '1.5rem'}}></i>
                      <span className="fw-semibold">안드로이드</span>
                      <small style={{fontSize: '0.7rem'}}>AOS</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill ${formData.platform === 'IOS' ? 'btn-info' : 'btn-outline-secondary'}`}
                    onClick={() => !disablePlatform && onChange('platform', 'IOS')}
                    disabled={disablePlatform}
                    style={{
                      minHeight: '60px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className="d-flex flex-column align-items-center gap-1">
                      <i className="bi bi-apple" style={{fontSize: '1.5rem'}}></i>
                      <span className="fw-semibold">iOS</span>
                      <small style={{fontSize: '0.7rem'}}>IOS</small>
                    </div>
                  </button>
                </div>
                <Form.Text className="text-muted">
                  광고가 노출될 플랫폼을 선택하세요
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div>

      {/* 스케줄 설정 */}
      <div className="col-12">
        <div className="bg-light rounded p-3 p-md-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-success-subtle rounded-circle p-2 me-3">
              <i className="bi bi-calendar-event text-success fs-5"></i>
            </div>
            <h6 className="mb-0 text-success fw-bold">스케줄 설정</h6>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-play-circle me-1"></i>
                  시작일시 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDateTime"
                  value={formData.startDateTime || ""}
                  onChange={handleChange}
                  className="form-control-lg"
                  style={{borderRadius: '8px'}}
                />
                <Form.Text className="text-muted">
                  광고가 시작될 일시를 설정하세요
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-stop-circle me-1"></i>
                  종료일시 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endDateTime"
                  value={formData.endDateTime || ""}
                  onChange={handleChange}
                  className="form-control-lg"
                  style={{borderRadius: '8px'}}
                />
                <Form.Text className="text-muted">
                  광고가 종료될 일시를 설정하세요
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div>

      {/* 노출 순서 설정 */}
      <div className="col-12">
        <div className="bg-light rounded p-3 p-md-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-warning-subtle rounded-circle p-2 me-3">
              <i className="bi bi-sort-numeric-down text-warning fs-5"></i>
            </div>
            <h6 className="mb-0 text-warning fw-bold">노출 순서 설정</h6>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="bi bi-shuffle me-1"></i>
              다중 광고 노출 방식 <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="orderType"
              value={formData.orderType || ""}
              onChange={handleChange}
              className="form-select-lg"
              style={{borderRadius: '8px'}}
            >
              <option value="RANDOM">🎲 랜덤 노출 - 무작위 순서로 노출</option>
              <option value="PINNED">📌 특정 순서 고정 - 지정한 순서로 노출</option>
            </Form.Select>
            <Form.Text className="text-muted">
              동일 구좌에 여러 광고가 있을 때의 노출 방식입니다
            </Form.Text>
          </Form.Group>

          {formData.orderType === "PINNED" && (
            <div className="mt-3 p-3 bg-white rounded border border-warning">
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-list-ol me-1"></i>
                  고정 광고 간 노출 순서 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="sortNumber"
                  value={formData.sortNumber || ""}
                  onChange={handleChange}
                  placeholder="1, 2, 3..."
                  min="1"
                  className="form-control-lg"
                  style={{borderRadius: '8px'}}
                />
                <Form.Text className="text-info">
                  <i className="bi bi-info-circle me-1"></i>
                  숫자가 작을수록 먼저 노출됩니다 (1번이 최상단)
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;