import React from "react";
import {Col, Form, Row} from "react-bootstrap";

const BasicInfoStep = ({formData, onChange, positions, platforms}) => {
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
            <Form.Label>Group ID</Form.Label>
            <Form.Control name="groupId" value={formData.groupId || ""} onChange={handleChange}/>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>광고 설명</Form.Label>
            <Form.Control name="description" value={formData.description || ""} onChange={handleChange}/>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>광고 구좌</Form.Label>
            <Form.Select name="position" value={formData.position} onChange={handleChange}>
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
            <Form.Label>플랫폼</Form.Label>
            <Form.Select name="platform" value={formData.platform} onChange={handleChange}>
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
        <Form.Label>노출 방식</Form.Label>
        <Form.Select name="orderType" value={formData.orderType} onChange={handleChange}>
          <option value="RANDOM">랜덤</option>
          <option value="PINNED">고정 순서</option>
        </Form.Select>
      </Form.Group>

      {formData.orderType === "PINNED" && (
        <Form.Group className="mb-3">
          <Form.Label>노출 순서</Form.Label>
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
