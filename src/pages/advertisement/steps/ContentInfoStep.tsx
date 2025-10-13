import React, { useState } from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import {toast} from "react-toastify";
import uploadApi from "../../../api/uploadApi";
import AdPreview from "../../../components/advertisement/AdPreview";
import { isFieldAvailable } from "../../../constants/advertisementSpecs";

const ContentInfoStep = ({formData, onChange}) => {
  const content = formData.content;
  const [isUploading, setIsUploading] = useState(false);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadApi.uploadImage('ADVERTISEMENT_IMAGE', file);

      if (response.ok && response.data) {
        handleImageChange('url', response.data);
        toast.success("이미지가 업로드되었습니다!");
      } else {
        const errorMsg = response?.message || "이미지 업로드에 실패했습니다.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 구좌별 필드 표시 여부 확인
  const showTitle = isFieldAvailable(formData.position, 'title');
  const showSubTitle = isFieldAvailable(formData.position, 'subTitle');
  const showExtraContent = isFieldAvailable(formData.position, 'extraContent');
  const showBackgroundColor = isFieldAvailable(formData.position, 'backgroundColor');
  const showLink = isFieldAvailable(formData.position, 'link');

  return (
    <>
      <h5 className="text-primary mb-3">2. 콘텐츠 정보</h5>

      {/* 미리보기 섹션 */}
      {formData.position && (
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="text-info mb-3">
            <i className="bi bi-eye me-2"></i>미리보기
          </h6>
          <div className="bg-white rounded p-3">
            <AdPreview
              positionType={formData.position}
              imageUrl={content.image.url}
              title={content.title}
              subTitle={content.subTitle}
              extraContent={content.extraContent}
              titleFontColor={content.titleFontColor}
              subTitleFontColor={content.subTitleFontColor}
              extraContentFontColor={content.extraContentFontColor}
              backgroundColor={content.backgroundColor}
            />
          </div>
        </div>
      )}

      <Form.Group className="mb-3">
        <Form.Label>광고 이미지</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            value={content.image.url}
            onChange={(e) => handleImageChange("url", e.target.value)}
            placeholder="이미지 URL 또는 업로드 버튼 사용"
          />
          <div className="position-relative">
            <Button
              variant="primary"
              disabled={isUploading}
              onClick={() => document.getElementById('image-upload-input').click()}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  업로드 중...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-1"></i>
                  파일 선택
                </>
              )}
            </Button>
            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>
        </div>
        <small className="text-muted">이미지 URL을 직접 입력하거나 파일을 업로드하세요 (최대 10MB)</small>
      </Form.Group>

      {(
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>이미지 가로 (선택)</Form.Label>
              <Form.Control
                type="number"
                value={content.image.width}
                onChange={(e) => handleImageChange("width", e.target.value)}
                placeholder="ex) 36"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>이미지 세로 (선택)</Form.Label>
              <Form.Control
                type="number"
                value={content.image.height}
                onChange={(e) => handleImageChange("height", e.target.value)}
                placeholder="ex) 20"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {showTitle && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>제목</Form.Label>
              <Form.Control
                type="text"
                value={content.title}
                onChange={(e) => handleContentChange("title", e.target.value)}
                placeholder="ex) 가슴속 3천원 앱 홍보 캠페인"
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

      {showSubTitle && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>부제목</Form.Label>
              <Form.Control
                type="text"
                value={content.subTitle}
                onChange={(e) => handleContentChange("subTitle", e.target.value)}
                placeholder="ex) 캠페인 소개"
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

      {showExtraContent && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>버튼 내용</Form.Label>
              <Form.Control
                type="text"
                value={content.extraContent}
                onChange={(e) => handleContentChange("extraContent", e.target.value)}
                placeholder="ex) 더보기"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>버튼 글자 색상</Form.Label>
              <Form.Control
                type="color"
                value={content.extraContentFontColor || "#000000"}
                onChange={(e) => handleContentChange("extraContentFontColor", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {showBackgroundColor && (
        <Form.Group className="mb-3">
          <Form.Label>배경 색상</Form.Label>
          <Form.Control
            type="color"
            value={content.backgroundColor || "#FFFFFF"}
            onChange={(e) => handleContentChange("backgroundColor", e.target.value)}
          />
        </Form.Group>
      )}

      {showLink && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>클릭 시 이동할 링크 유형</Form.Label>
              <Form.Select
                value={content.link.linkType}
                onChange={(e) => handleLinkChange("linkType", e.target.value)}
              >
                <option value="">선택하세요</option>
                <option value="APP_SCHEME">앱 딥링크</option>
                <option value="WEB">웹 링크</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {content.link.linkType && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>이동할 링크 주소</Form.Label>
                <Form.Control
                  type="text"
                  value={content.link.linkUrl || ""}
                  onChange={(e) => handleLinkChange("linkUrl", e.target.value)}
                  placeholder={
                    content.link.linkType === 'WEB'
                      ? "https://example.com"
                      : "/home"
                  }
                />
              </Form.Group>
            </Col>
          )}
        </Row>
      )}
    </>
  );
};

export default ContentInfoStep;
