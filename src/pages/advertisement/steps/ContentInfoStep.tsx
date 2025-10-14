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
      <h5 className="text-primary mb-4 d-flex align-items-center">
        <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>2</span>
        콘텐츠 정보
      </h5>

      {/* 미리보기 섹션 */}
      {formData.position && (
        <div className="mb-4 p-4 border border-info border-2 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <h6 className="text-info mb-3 fw-bold d-flex align-items-center">
            <i className="bi bi-eye-fill me-2"></i>
            실시간 미리보기
            <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>LIVE</span>
          </h6>
          <div className="bg-white rounded-3 p-4 shadow-sm">
            <AdPreview
              positionType={formData.position}
              imageUrl={content.image.url}
              imageWidth={content.image.width}
              imageHeight={content.image.height}
              title={content.title}
              subTitle={content.subTitle}
              extraContent={content.extraContent}
              titleFontColor={content.titleFontColor}
              subTitleFontColor={content.subTitleFontColor}
              extraContentFontColor={content.extraContentFontColor}
              backgroundColor={content.backgroundColor}
            />
          </div>
          <small className="text-muted d-block mt-2 fst-italic">
            <i className="bi bi-info-circle me-1"></i>
            입력한 내용이 실시간으로 미리보기에 반영됩니다
          </small>
        </div>
      )}

      <div className="mb-4 p-3 border rounded-3 bg-white shadow-sm">
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold d-flex align-items-center">
            <i className="bi bi-image-fill text-primary me-2"></i>
            광고 이미지
            <span className="text-danger ms-1">*</span>
          </Form.Label>
          <div className="d-flex gap-2 flex-column flex-md-row">
            <Form.Control
              type="text"
              value={content.image.url}
              onChange={(e) => handleImageChange("url", e.target.value)}
              placeholder="이미지 URL을 입력하거나 파일 업로드 버튼을 사용하세요"
              className="shadow-sm"
            />
            <div className="position-relative">
              <Button
                variant="primary"
                disabled={isUploading}
                onClick={() => document.getElementById('image-upload-input').click()}
                style={{ minWidth: '150px', whiteSpace: 'nowrap' }}
                className="shadow-sm"
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload-fill me-2"></i>
                    파일 업로드
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
          <div className="d-flex align-items-start mt-2">
            <i className="bi bi-info-circle text-info me-2 mt-1"></i>
            <small className="text-muted">
              <strong>권장:</strong> JPG, PNG 형식 / 최대 10MB / 고해상도 이미지 권장
            </small>
          </div>
        </Form.Group>

        <Row className="mb-0">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold d-flex align-items-center">
                <i className="bi bi-arrows-expand text-secondary me-2" style={{ fontSize: '0.85rem' }}></i>
                이미지 가로
                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>선택</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={content.image.width}
                onChange={(e) => handleImageChange("width", e.target.value)}
                placeholder="ex) 36"
                className="shadow-sm"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold d-flex align-items-center">
                <i className="bi bi-arrows-expand text-secondary me-2" style={{ fontSize: '0.85rem' }}></i>
                이미지 세로
                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>선택</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={content.image.height}
                onChange={(e) => handleImageChange("height", e.target.value)}
                placeholder="ex) 20"
                className="shadow-sm"
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      {showTitle && (
        <div className="mb-4 p-3 border rounded-3 bg-white shadow-sm">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <i className="bi bi-type text-primary me-2"></i>
                  제목
                </Form.Label>
                <Form.Control
                  type="text"
                  value={content.title}
                  onChange={(e) => handleContentChange("title", e.target.value)}
                  placeholder="ex) 가슴속 3천원 앱 홍보 캠페인"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <i className="bi bi-palette-fill text-primary me-2"></i>
                  글자 색상
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="color"
                    value={content.titleFontColor || "#000000"}
                    onChange={(e) => handleContentChange("titleFontColor", e.target.value)}
                    className="shadow-sm"
                    style={{ height: '38px' }}
                  />
                  <Form.Control
                    type="text"
                    value={content.titleFontColor || "#000000"}
                    onChange={(e) => handleContentChange("titleFontColor", e.target.value)}
                    className="shadow-sm"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {showSubTitle && (
        <div className="mb-4 p-3 border rounded-3 bg-white shadow-sm">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <i className="bi bi-text-left text-primary me-2"></i>
                  부제목
                </Form.Label>
                <Form.Control
                  type="text"
                  value={content.subTitle}
                  onChange={(e) => handleContentChange("subTitle", e.target.value)}
                  placeholder="ex) 캠페인 소개"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <i className="bi bi-palette-fill text-primary me-2"></i>
                  글자 색상
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="color"
                    value={content.subTitleFontColor || "#969696"}
                    onChange={(e) => handleContentChange("subTitleFontColor", e.target.value)}
                    className="shadow-sm"
                    style={{ height: '38px' }}
                  />
                  <Form.Control
                    type="text"
                    value={content.subTitleFontColor || "#969696"}
                    onChange={(e) => handleContentChange("subTitleFontColor", e.target.value)}
                    className="shadow-sm"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {showExtraContent && (
        <div className="mb-4 p-3 border rounded-3 bg-white shadow-sm">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <i className="bi bi-cursor-fill text-primary me-2"></i>
                  버튼 내용
                </Form.Label>
                <Form.Control
                  type="text"
                  value={content.extraContent}
                  onChange={(e) => handleContentChange("extraContent", e.target.value)}
                  placeholder="ex) 더보기"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <i className="bi bi-palette-fill text-primary me-2"></i>
                  글자 색상
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="color"
                    value={content.extraContentFontColor || "#000000"}
                    onChange={(e) => handleContentChange("extraContentFontColor", e.target.value)}
                    className="shadow-sm"
                    style={{ height: '38px' }}
                  />
                  <Form.Control
                    type="text"
                    value={content.extraContentFontColor || "#000000"}
                    onChange={(e) => handleContentChange("extraContentFontColor", e.target.value)}
                    className="shadow-sm"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {showBackgroundColor && (
        <div className="mb-4 p-3 border rounded-3 bg-white shadow-sm">
          <Form.Group className="mb-0">
            <Form.Label className="fw-semibold d-flex align-items-center">
              <i className="bi bi-paint-bucket text-primary me-2"></i>
              배경 색상
            </Form.Label>
            <div className="d-flex align-items-center gap-2" style={{ maxWidth: '300px' }}>
              <Form.Control
                type="color"
                value={content.backgroundColor || "#FFFFFF"}
                onChange={(e) => handleContentChange("backgroundColor", e.target.value)}
                className="shadow-sm"
                style={{ height: '38px', width: '80px' }}
              />
              <Form.Control
                type="text"
                value={content.backgroundColor || "#FFFFFF"}
                onChange={(e) => handleContentChange("backgroundColor", e.target.value)}
                className="shadow-sm"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>
          </Form.Group>
        </div>
      )}

      {showLink && (
        <div className="mb-4 p-3 border border-success border-2 rounded-3 bg-white shadow-sm">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-link-45deg text-success fs-4 me-2"></i>
            <h6 className="mb-0 text-success fw-bold">링크 설정</h6>
          </div>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <i className="bi bi-box-arrow-up-right text-success me-2"></i>
                  링크 유형
                </Form.Label>
                <Form.Select
                  value={content.link.linkType}
                  onChange={(e) => handleLinkChange("linkType", e.target.value)}
                  className="shadow-sm"
                >
                  <option value="">선택하세요</option>
                  <option value="APP_SCHEME">📱 앱 딥링크</option>
                  <option value="WEB">🌐 웹 링크</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {content.link.linkType && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold d-flex align-items-center">
                    <i className="bi bi-link text-success me-2"></i>
                    링크 주소
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={content.link.linkUrl || ""}
                    onChange={(e) => handleLinkChange("linkUrl", e.target.value)}
                    placeholder={
                      content.link.linkType === 'WEB'
                        ? "https://example.com"
                        : "/home"
                    }
                    className="shadow-sm"
                  />
                  <small className="text-muted">
                    {content.link.linkType === 'WEB'
                      ? '예: https://example.com'
                      : '예: /home 또는 myapp://screen'}
                  </small>
                </Form.Group>
              </Col>
            )}
          </Row>
        </div>
      )}
    </>
  );
};

export default ContentInfoStep;
