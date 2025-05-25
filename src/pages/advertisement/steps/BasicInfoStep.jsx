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
    <>
      <h5 className="text-primary mb-3">1. 기본 정보</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>캠페인 ID (Group Id)</Form.Label>
            <Form.Control name="groupId" value={formData.groupId} onChange={handleChange} placeholder="ex) test"/>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>광고 설명 (선택)</Form.Label>
            <Form.Control name="description" value={formData.description} onChange={handleChange} placeholder="ex) 가슴속 3천원 앱 홍보 캠페인"/>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>노출 구좌</Form.Label>
            <Form.Select
              name="position"
              value={formData.position}
              onChange={handleChange}
              disabled={disablePosition}
            >
              <option value="">선택하세요</option>
              {positions
                .filter((pos) => pos.key !== "")
                .map((pos) => (
                  <option key={pos.key} value={pos.key}>
                    {pos.description}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>노출 대상 플랫폼</Form.Label>
            <Form.Select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              disabled={disablePlatform}
            >
              {platforms.map((plat) => (
                <option key={plat.key} value={plat.key}>
                  {plat.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>시작일시</Form.Label>
            <Form.Control
              type="datetime-local"
              name="startDateTime"
              value={formData.startDateTime || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>종료일시</Form.Label>
            <Form.Control
              type="datetime-local"
              name="endDateTime"
              value={formData.endDateTime || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>다중 광고 노출 방식 (동일 구좌 내)</Form.Label>
        <Form.Select name="orderType" value={formData.orderType} onChange={handleChange}>
          <option value="RANDOM">랜덤 노출</option>
          <option value="PINNED">최상단 고정</option>
        </Form.Select>
      </Form.Group>

      {formData.orderType === "PINNED" && (
        <Form.Group className="mb-3">
          <Form.Label>고정 광고 간 노출 순서</Form.Label>
          <Form.Control
            type="number"
            name="sortNumber"
            value={formData.sortNumber || ""}
            onChange={handleChange}
          />
        </Form.Group>
      )}
    </>
  );
};

export default BasicInfoStep;