import React from "react";
import {Col, Form, Row} from "react-bootstrap";

const ContentInfoStep = ({formData, onChange}) => {
  const content = formData.content;

  const handleContentChange = (field, value) => {
    onChange((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const handleImageChange = (field, value) => {
    onChange((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        image: {
          ...prev.content.image,
          [field]: value,
        },
      },
    }));
  };

  const handleLinkChange = (field, value) => {
    onChange((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        link: {
          ...prev.content.link,
          [field]: value,
        },
      },
    }));
  };

  const isImageAndLinkOnly = ["LOADING", "SPLASH", "STORE_MARKER"].includes(formData.position); // 타입 체크

  return (
    <>
      <h5 className="text-primary mb-3">2. 콘텐츠 정보</h5>

      <Form.Group className="mb-3">
        <Form.Label>이미지 URL</Form.Label>
        <Form.Control
          type="text"
          value={content.image.url}
          onChange={(e) => handleImageChange("url", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </Form.Group>

      {(
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>이미지 가로</Form.Label>
              <Form.Control
                type="number"
                value={content.image.width}
                onChange={(e) => handleImageChange("width", e.target.value)}
                placeholder="px"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>이미지 세로</Form.Label>
              <Form.Control
                type="number"
                value={content.image.height}
                onChange={(e) => handleImageChange("height", e.target.value)}
                placeholder="px"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {!isImageAndLinkOnly && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>제목</Form.Label>
              <Form.Control
                type="text"
                value={content.title}
                onChange={(e) => handleContentChange("title", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>제목 글자 색상</Form.Label>
              <Form.Control
                type="color"
                value={content.titleFontColor || "#000000"}
                onChange={(e) => handleContentChange("titleFontColor", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {!isImageAndLinkOnly && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>부제목</Form.Label>
              <Form.Control
                type="text"
                value={content.subTitle}
                onChange={(e) => handleContentChange("subTitle", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>부제목 글자 색상</Form.Label>
              <Form.Control
                type="color"
                value={content.subTitleFontColor || "#000000"}
                onChange={(e) => handleContentChange("subTitleFontColor", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {!isImageAndLinkOnly && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>추가 콘텐츠</Form.Label>
              <Form.Control
                type="text"
                value={content.extraContent}
                onChange={(e) => handleContentChange("extraContent", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>추가 콘텐츠 글자 색상</Form.Label>
              <Form.Control
                type="color"
                value={content.extraContentFontColor || "#000000"}
                onChange={(e) => handleContentChange("extraContentFontColor", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {!isImageAndLinkOnly && (
        <Form.Group className="mb-3">
          <Form.Label>배경 색상</Form.Label>
          <Form.Control
            type="color"
            value={content.backgroundColor}
            onChange={(e) => handleContentChange("backgroundColor", e.target.value)}
          />
        </Form.Group>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>링크 타입</Form.Label>
            <Form.Select
              value={content.link.linkType}
              onChange={(e) => handleLinkChange("linkType", e.target.value)}
            >
              <option value="">선택 안함</option>
              <option value="APP_SCHEME">딥링크</option>
              <option value="WEB">웹링크</option>
            </Form.Select>
          </Form.Group>
        </Col>
        {content.link.linkType !== "null" && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>링크 URL</Form.Label>
              <Form.Control
                type="text"
                value={content.link.linkUrl}
                onChange={(e) => handleLinkChange("linkUrl", e.target.value)}
                placeholder={content.link.linkType === 'WEB' ? "https://example.com" : "/home"}
              />
            </Form.Group>
          </Col>
        )}
      </Row>
    </>
  );
};

export default ContentInfoStep;
