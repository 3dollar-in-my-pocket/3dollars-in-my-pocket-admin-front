import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import advertisementApi from "../../api/advertisementApi";
import uploadApi from "../../api/uploadApi";
import AdTimer from "../../components/common/AdTimer";
import AdPreview from "../../components/advertisement/AdPreview";
import {isFieldAvailable, isFieldRequired} from "../../constants/advertisementSpecs";
import DeepLinkSelector from "../../components/common/DeepLinkSelector";

const AdvertisementContentEditModal = ({show, onHide, ad, fetchAdvertisements}) => {
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || "",
        titleFontColor: ad.titleFontColor || "#000000",
        subTitle: ad.subTitle || "",
        subTitleFontColor: ad.subTitleFontColor || "#969696",
        extraContent: ad.extraContent || "",
        extraContentFontColor: ad.extraContentFontColor || "#000000",
        backgroundColor: ad.backgroundColor && ad.backgroundColor.trim() !== "" ? ad.backgroundColor : "#FFFFFF",
        imageUrl: ad.imageUrl || "",
        imageWidth: ad.imageWidth || "",
        imageHeight: ad.imageHeight || "",
        linkType: ad.linkType || "WEB",
        linkUrl: ad.linkUrl || "",
        exposureIndex: ad.exposureIndex !== null && ad.exposureIndex !== undefined ? ad.exposureIndex : null,
      });
    }
  }, [ad]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadApi.uploadImage('ADVERTISEMENT_IMAGE', file);

      if (response.ok && response.data) {
        handleChange('imageUrl', response.data);
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

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // 필수 필드 검증
    if (!formData.imageUrl) {
      toast.error("이미지 URL은 필수입니다.");
      return;
    }

    // link가 필수인 구좌인 경우에만 검증
    const isLinkRequired = isFieldRequired(ad.positionType, 'link');
    if (isLinkRequired && (!formData.linkType || !formData.linkUrl)) {
      toast.error("링크 유형과 주소는 필수입니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const contentData = {
        title: formData.title || null,
        titleFontColor: formData.titleFontColor || null,
        subTitle: formData.subTitle || null,
        subTitleFontColor: formData.subTitleFontColor || null,
        extraContent: formData.extraContent || null,
        extraContentFontColor: formData.extraContentFontColor || null,
        backgroundColor: formData.backgroundColor || null,
        image: {
          url: formData.imageUrl,
          width: formData.imageWidth ? Number(formData.imageWidth) : null,
          height: formData.imageHeight ? Number(formData.imageHeight) : null,
        },
        link: {
          linkType: formData.linkType,
          linkUrl: formData.linkUrl,
        },
        exposureIndex: formData.exposureIndex,
      };

      const res = await advertisementApi.updateAdContent({
        application: "USER",
        advertisementId: ad.advertisementId,
        contentData,
      });

      if (res.ok) {
        toast.success("광고 컨텐츠가 수정되었습니다.");
        fetchAdvertisements();
        onHide();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return null;

  // 각 필드가 현재 구좌에서 사용 가능한지 확인
  const showTitle = isFieldAvailable(ad?.positionType, 'title');
  const showSubTitle = isFieldAvailable(ad?.positionType, 'subTitle');
  const showExtraContent = isFieldAvailable(ad?.positionType, 'extraContent');
  const showBackgroundColor = isFieldAvailable(ad?.positionType, 'backgroundColor');
  const showLink = isFieldAvailable(ad?.positionType, 'link');
  const isLinkRequired = isFieldRequired(ad?.positionType, 'link');
  const showExposureIndex = ad?.positionType === 'MENU_CATEGORY_ICON' || ad?.positionType === 'POLL_CARD';

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen="lg-down">
      <Modal.Header closeButton className="border-0"
                    style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <Modal.Title className="text-white d-flex align-items-center gap-2">
          <i className="bi bi-pencil-square"></i>
          광고 컨텐츠 수정
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="container-fluid">
          {/* 현재 상태 섹션 */}
          <div className="bg-light border-bottom p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-info-subtle rounded-circle p-2 me-3">
                <i className="bi bi-clock text-info fs-5"></i>
              </div>
              <h5 className="mb-0 text-info fw-bold">현재 광고 정보</h5>
            </div>
            <div className="row align-items-center">
              <div className="col-12 col-md-4 text-center mb-3 mb-md-0">
                <AdTimer
                  startDateTime={ad.startDateTime}
                  endDateTime={ad.endDateTime}
                  className=""
                />
              </div>
              <div className="col-12 col-md-8">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="text-center p-2 bg-white rounded border">
                      <small className="text-muted d-block">광고 ID</small>
                      <strong className="text-primary">{ad.advertisementId}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-2 bg-white rounded border">
                      <small className="text-muted d-block">캠페인</small>
                      <strong>{ad.groupId}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 미리보기 섹션 */}
          <div className="bg-white border-bottom p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-info-subtle rounded-circle p-2 me-3">
                <i className="bi bi-eye text-info fs-5"></i>
              </div>
              <h5 className="mb-0 text-info fw-bold">미리보기</h5>
            </div>
            <div className="bg-light rounded p-4">
              <AdPreview
                positionType={ad.positionType}
                imageUrl={formData.imageUrl}
                title={formData.title}
                subTitle={formData.subTitle}
                extraContent={formData.extraContent}
                titleFontColor={formData.titleFontColor}
                subTitleFontColor={formData.subTitleFontColor}
                extraContentFontColor={formData.extraContentFontColor}
                backgroundColor={formData.backgroundColor}
              />
            </div>
          </div>

          {/* 수정 폼 섹션 */}
          <div className="bg-white p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-warning-subtle rounded-circle p-2 me-3">
                <i className="bi bi-palette text-warning fs-5"></i>
              </div>
              <h5 className="mb-0 text-warning fw-bold">컨텐츠 수정</h5>
            </div>
            <Form>
              {/* 이미지 섹션 */}
              <div className="bg-light rounded p-4 mb-4">
                <h6 className="text-primary fw-bold mb-3">
                  <i className="bi bi-image me-2"></i>이미지 설정
                </h6>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    이미지 <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => handleChange("imageUrl", e.target.value)}
                      placeholder="이미지 URL 또는 업로드 버튼 사용"
                    />
                    <Button
                      variant="primary"
                      disabled={isUploading}
                      onClick={() => document.getElementById('content-edit-image-upload').click()}
                      style={{minWidth: '130px', whiteSpace: 'nowrap'}}
                    >
                      {isUploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"/>
                          업로드 중...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-upload me-1"></i>
                          파일 업로드
                        </>
                      )}
                    </Button>
                    <input
                      id="content-edit-image-upload"
                      type="file"
                      accept="image/*"
                      style={{display: 'none'}}
                      onChange={handleImageUpload}
                    />
                  </div>
                  <small className="text-muted">이미지 URL을 직접 입력하거나 파일을 업로드하세요 (최대 10MB)</small>
                </Form.Group>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold">이미지 가로 (px)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.imageWidth}
                        onChange={(e) => handleChange("imageWidth", e.target.value)}
                        placeholder="57"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-semibold">이미지 세로 (px)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.imageHeight}
                        onChange={(e) => handleChange("imageHeight", e.target.value)}
                        placeholder="36"
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* 텍스트 컨텐츠 섹션 (구좌별로 필요한 필드만 표시) */}
              {(showTitle || showSubTitle || showExtraContent || showBackgroundColor) && (
                <div className="bg-light rounded p-4 mb-4">
                  <h6 className="text-success fw-bold mb-3">
                    <i className="bi bi-card-text me-2"></i>텍스트 컨텐츠
                  </h6>
                  {showTitle && (
                    <div className="row g-3 mb-3">
                      <div className="col-md-8">
                        <Form.Group>
                          <Form.Label className="fw-semibold">제목</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="📣 사장님 전용 앱 출시 📣"
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label className="fw-semibold">제목 글자 색상</Form.Label>
                          <Form.Control
                            type="color"
                            value={formData.titleFontColor}
                            onChange={(e) => handleChange("titleFontColor", e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>
                  )}
                  {showSubTitle && (
                    <div className="row g-3 mb-3">
                      <div className="col-md-8">
                        <Form.Group>
                          <Form.Label className="fw-semibold">부제목</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.subTitle}
                            onChange={(e) => handleChange("subTitle", e.target.value)}
                            placeholder="100만 명에게 가게를 홍보하고 싶은 사장님은 클릭!"
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label className="fw-semibold">부제목 글자 색상</Form.Label>
                          <Form.Control
                            type="color"
                            value={formData.subTitleFontColor}
                            onChange={(e) => handleChange("subTitleFontColor", e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>
                  )}
                  {showExtraContent && (
                    <div className="row g-3 mb-3">
                      <div className="col-md-8">
                        <Form.Group>
                          <Form.Label className="fw-semibold">추가 컨텐츠 (버튼 텍스트)</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.extraContent}
                            onChange={(e) => handleChange("extraContent", e.target.value)}
                            placeholder="더보기"
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label className="fw-semibold">버튼 글자 색상</Form.Label>
                          <Form.Control
                            type="color"
                            value={formData.extraContentFontColor}
                            onChange={(e) => handleChange("extraContentFontColor", e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>
                  )}
                  {showBackgroundColor && (
                    <Form.Group>
                      <Form.Label className="fw-semibold">배경 색상</Form.Label>
                      <Form.Control
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => handleChange("backgroundColor", e.target.value)}
                      />
                    </Form.Group>
                  )}
                </div>
              )}

              {/* 링크 섹션 (구좌별로 필요한 경우만 표시) */}
              {showLink && (
                <div className="bg-light rounded p-4">
                  <h6 className="text-warning fw-bold mb-3">
                    <i className="bi bi-link-45deg me-2"></i>링크 설정
                  </h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      링크 유형 {isLinkRequired && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Select
                      value={formData.linkType}
                      onChange={(e) => handleChange("linkType", e.target.value)}
                    >
                      <option value="WEB">🌐 웹 링크</option>
                      <option value="APP_SCHEME">📱 앱 딥링크</option>
                    </Form.Select>
                  </Form.Group>

                  {formData.linkType === 'APP_SCHEME' && (
                    <DeepLinkSelector
                      value={formData.linkUrl}
                      onChange={(value) => handleChange("linkUrl", value)}
                      applicationType="USER"
                      label="링크 주소"
                      required={isLinkRequired}
                      placeholder="/home, /event 등"
                      helpText="광고 클릭 시 이동할 앱 화면 경로를 선택하거나 직접 입력하세요"
                    />
                  )}

                  {formData.linkType === 'WEB' && (
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        링크 주소 {isLinkRequired && <span className="text-danger">*</span>}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.linkUrl}
                        onChange={(e) => handleChange("linkUrl", e.target.value)}
                        placeholder="https://example.com"
                      />
                      <Form.Text className="text-muted">
                        예: https://example.com
                      </Form.Text>
                    </Form.Group>
                  )}
                </div>
              )}

              {/* 인덱스 섹션 (MENU_CATEGORY_ICON, POLL_CARD 구좌만) */}
              {showExposureIndex && (
                <div className="bg-light rounded p-4">
                  <h6 className="text-warning fw-bold mb-3">
                    <i className="bi bi-list-ol me-2"></i>인덱스 설정
                  </h6>
                  <Form.Group className="mb-0">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <i className="bi bi-sort-numeric-down text-warning me-2"></i>
                      인덱스 (0부터 시작)
                      <span className="badge bg-warning ms-2" style={{fontSize: '0.65rem'}}>선택</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.exposureIndex !== null && formData.exposureIndex !== undefined ? formData.exposureIndex : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          handleChange("exposureIndex", null);
                        } else {
                          const numValue = parseInt(value);
                          handleChange("exposureIndex", isNaN(numValue) ? null : numValue);
                        }
                      }}
                      placeholder="0, 1, 2, 3..."
                      style={{maxWidth: '200px'}}
                      min="0"
                      max="99"
                    />
                    <Form.Text className="text-muted d-flex align-items-center mt-2">
                      <i className="bi bi-info-circle me-1"></i>
                      <div>
                        몇 번째 인덱스에 광고를 노출시킬지 인덱스로 지정합니다. (0부터 시작)<br/>
                      </div>
                    </Form.Text>
                  </Form.Group>
                </div>
              )}
            </Form>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 bg-light p-4">
        <div className="d-flex w-100 gap-2 flex-column flex-sm-row">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={isSubmitting}
            className="flex-fill d-flex align-items-center justify-content-center gap-2"
            style={{padding: '12px 24px'}}
          >
            <i className="bi bi-x-lg"></i>
            취소
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.imageUrl || (isLinkRequired && (!formData.linkType || !formData.linkUrl))}
            className="flex-fill d-flex align-items-center justify-content-center gap-2"
            style={{padding: '12px 24px'}}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                저장 중...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i>
                저장
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

AdvertisementContentEditModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  ad: PropTypes.object,
  fetchAdvertisements: PropTypes.func.isRequired,
};

export default AdvertisementContentEditModal;
