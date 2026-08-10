import React, {useEffect, useState} from "react";
import {Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import advertisementApi from "@/api/advertisementApi";
import uploadApi from "@/api/uploadApi";
import AdTimer from "@/components/common/AdTimer";
import AdPreview from "@/components/advertisement/AdPreview";
import {isFieldAvailable, isFieldRequired} from "@/constants/advertisementSpecs";
import DeepLinkSelector from "@/components/common/DeepLinkSelector";
import {Advertisement, AdvertisementContentEditForm} from "@/types/advertisement";

interface AdvertisementContentEditModalProps {
  show: boolean;
  onHide: () => void;
  ad?: Advertisement | null;
  fetchAdvertisements: () => void;
}

const AdvertisementContentEditModal = ({
                                         show,
                                         onHide,
                                         ad,
                                         fetchAdvertisements
                                       }: AdvertisementContentEditModalProps) => {
  const [formData, setFormData] = useState<AdvertisementContentEditForm | null>(null);
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
        extraContentFontColor: ad.extraFontColor || "#000000",
        backgroundColor: ad.backgroundColor && ad.backgroundColor.trim() !== "" ? ad.backgroundColor : "#FFFFFF",
        imageUrl: ad.imageUrl || "",
        imageWidth: ad.imageWidth || "",
        imageHeight: ad.imageHeight || "",
        // 조회 응답(AdvertisementResponse)에는 linkType이 없고 linkUrl만 내려옵니다.
        // 웹 링크가 아니면 앱 딥링크로 보고 기존 값을 복원합니다.
        linkType: ad.linkUrl && !/^https?:\/\//i.test(ad.linkUrl) ? "APP_SCHEME" : "WEB",
        linkUrl: ad.linkUrl || "",
        exposureIndex: ad.exposureIndex !== null && ad.exposureIndex !== undefined ? ad.exposureIndex : null,
      });
    }
  }, [ad]);

  const handleChange = (field: string, value: any) => { // 색상/숫자/문자열 등 필드별 타입이 달라 any 사용
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <Modal show={show} onHide={onHide} size="xl" centered className="app-modal">
      <Modal.Header closeButton>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className="bi bi-palette"/>
            콘텐츠 수정
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">{ad.advertisementId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="row g-4">
          {/* 미리보기 - 데스크톱에서는 스크롤을 따라다니며 편집 결과를 즉시 확인한다 */}
          <div className="col-12 col-lg-5">
            <div className="content-edit__preview">
              <h3 className="modal-section__title">
                <i className="bi bi-eye"/>
                미리보기
              </h3>
              <div className="ad-preview-container">
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
              <AdTimer
                startDateTime={ad.startDateTime}
                endDateTime={ad.endDateTime}
                className="mt-3"
              />
            </div>
          </div>

          {/* 수정 폼 */}
          <div className="col-12 col-lg-7">
            <Form>
              {/* 이미지 */}
              <div className="modal-section">
                <h3 className="modal-section__title">
                  <i className="bi bi-image"/>
                  이미지
                </h3>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="content-image-url">
                    이미지 URL <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      id="content-image-url"
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => handleChange("imageUrl", e.target.value)}
                      placeholder="이미지 URL 또는 업로드 버튼 사용"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-shrink-0"
                      disabled={isUploading}
                      onClick={() => document.getElementById('content-edit-image-upload').click()}
                    >
                      {isUploading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                      ) : (
                        <i className="bi bi-cloud-upload"/>
                      )}
                    </button>
                    <input
                      id="content-edit-image-upload"
                      type="file"
                      accept="image/*"
                      style={{display: 'none'}}
                      onChange={handleImageUpload}
                    />
                  </div>
                  <Form.Text>URL을 직접 입력하거나 파일을 업로드하세요 (최대 10MB).</Form.Text>
                </Form.Group>

                <div className="row g-3">
                  <Form.Group className="col-6">
                    <Form.Label htmlFor="content-image-width">가로 (px)</Form.Label>
                    <Form.Control
                      id="content-image-width"
                      type="number"
                      value={formData.imageWidth}
                      onChange={(e) => handleChange("imageWidth", e.target.value)}
                      placeholder="57"
                    />
                  </Form.Group>
                  <Form.Group className="col-6">
                    <Form.Label htmlFor="content-image-height">세로 (px)</Form.Label>
                    <Form.Control
                      id="content-image-height"
                      type="number"
                      value={formData.imageHeight}
                      onChange={(e) => handleChange("imageHeight", e.target.value)}
                      placeholder="36"
                    />
                  </Form.Group>
                </div>
              </div>

              {/* 텍스트 컨텐츠 (구좌별로 필요한 필드만 표시) */}
              {(showTitle || showSubTitle || showExtraContent || showBackgroundColor) && (
                <div className="modal-section">
                  <h3 className="modal-section__title">
                    <i className="bi bi-card-text"/>
                    텍스트
                  </h3>

                  <div className="row g-3">
                    {showTitle && (
                      <>
                        <Form.Group className="col-8">
                          <Form.Label htmlFor="content-title">제목</Form.Label>
                          <Form.Control
                            id="content-title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="사장님 전용 앱 출시"
                          />
                        </Form.Group>
                        <Form.Group className="col-4">
                          <Form.Label htmlFor="content-title-color">글자 색상</Form.Label>
                          <Form.Control
                            id="content-title-color"
                            type="color"
                            value={formData.titleFontColor}
                            onChange={(e) => handleChange("titleFontColor", e.target.value)}
                          />
                        </Form.Group>
                      </>
                    )}

                    {showSubTitle && (
                      <>
                        <Form.Group className="col-8">
                          <Form.Label htmlFor="content-subtitle">부제목</Form.Label>
                          <Form.Control
                            id="content-subtitle"
                            type="text"
                            value={formData.subTitle}
                            onChange={(e) => handleChange("subTitle", e.target.value)}
                            placeholder="가게를 홍보하고 싶은 사장님은 클릭!"
                          />
                        </Form.Group>
                        <Form.Group className="col-4">
                          <Form.Label htmlFor="content-subtitle-color">글자 색상</Form.Label>
                          <Form.Control
                            id="content-subtitle-color"
                            type="color"
                            value={formData.subTitleFontColor}
                            onChange={(e) => handleChange("subTitleFontColor", e.target.value)}
                          />
                        </Form.Group>
                      </>
                    )}

                    {showExtraContent && (
                      <>
                        <Form.Group className="col-8">
                          <Form.Label htmlFor="content-extra">버튼 텍스트</Form.Label>
                          <Form.Control
                            id="content-extra"
                            type="text"
                            value={formData.extraContent}
                            onChange={(e) => handleChange("extraContent", e.target.value)}
                            placeholder="더보기"
                          />
                        </Form.Group>
                        <Form.Group className="col-4">
                          <Form.Label htmlFor="content-extra-color">글자 색상</Form.Label>
                          <Form.Control
                            id="content-extra-color"
                            type="color"
                            value={formData.extraContentFontColor}
                            onChange={(e) => handleChange("extraContentFontColor", e.target.value)}
                          />
                        </Form.Group>
                      </>
                    )}

                    {showBackgroundColor && (
                      <Form.Group className="col-4">
                        <Form.Label htmlFor="content-bg-color">배경 색상</Form.Label>
                        <Form.Control
                          id="content-bg-color"
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => handleChange("backgroundColor", e.target.value)}
                        />
                      </Form.Group>
                    )}
                  </div>
                </div>
              )}

              {/* 링크 (구좌별로 필요한 경우만 표시) */}
              {showLink && (
                <div className="modal-section">
                  <h3 className="modal-section__title">
                    <i className="bi bi-link-45deg"/>
                    링크
                  </h3>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="content-link-type">
                      링크 유형 {isLinkRequired && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Select
                      id="content-link-type"
                      value={formData.linkType}
                      onChange={(e) => handleChange("linkType", e.target.value)}
                    >
                      <option value="WEB">웹 링크</option>
                      <option value="APP_SCHEME">앱 딥링크</option>
                    </Form.Select>
                  </Form.Group>

                  {formData.linkType === 'APP_SCHEME' ? (
                    <DeepLinkSelector
                      value={formData.linkUrl}
                      onChange={(value) => handleChange("linkUrl", value)}
                      applicationType="USER"
                      label="링크 주소"
                      required={isLinkRequired}
                      placeholder="/home, /event 등"
                      helpText="광고 클릭 시 이동할 앱 화면 경로를 선택하거나 직접 입력하세요"
                    />
                  ) : (
                    <Form.Group>
                      <Form.Label htmlFor="content-link-url">
                        링크 주소 {isLinkRequired && <span className="text-danger">*</span>}
                      </Form.Label>
                      <Form.Control
                        id="content-link-url"
                        type="text"
                        value={formData.linkUrl}
                        onChange={(e) => handleChange("linkUrl", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </Form.Group>
                  )}
                </div>
              )}

              {/* 노출 인덱스 (MENU_CATEGORY_ICON, POLL_CARD 구좌만) */}
              {showExposureIndex && (
                <div className="modal-section">
                  <h3 className="modal-section__title">
                    <i className="bi bi-list-ol"/>
                    노출 인덱스
                  </h3>

                  <Form.Group>
                    <Form.Label htmlFor="content-exposure-index">인덱스 (선택)</Form.Label>
                    <Form.Control
                      id="content-exposure-index"
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
                      style={{maxWidth: '160px'}}
                      min="0"
                      max="99"
                    />
                    <Form.Text>
                      몇 번째 위치에 광고를 노출할지 지정합니다. 비워두면 앱 기본값이 적용됩니다. (0부터 시작)
                    </Form.Text>
                  </Form.Group>
                </div>
              )}
            </Form>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-outline-secondary" onClick={onHide} disabled={isSubmitting}>
          취소
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.imageUrl || (isLinkRequired && (!formData.linkType || !formData.linkUrl))}
        >
          {isSubmitting && (
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
          )}
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdvertisementContentEditModal;
