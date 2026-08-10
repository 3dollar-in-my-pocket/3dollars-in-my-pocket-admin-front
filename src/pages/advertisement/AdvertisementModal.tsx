import {useState} from "react";
import {Modal} from "react-bootstrap";
import advertisementApi from "@/api/advertisementApi";
import {toast} from "react-toastify";
import AdvertisementEditModal from "./AdvertisementEditModal";
import AdvertisementContentEditModal from "./AdvertisementContentEditModal";
import AdTimer from "@/components/common/AdTimer";
import AdPreview from "@/components/advertisement/AdPreview";
import DetailField from "@/components/common/DetailField";
import {Advertisement, EnumOption} from "@/types/advertisement";

interface AdvertisementModalProps {
  show: boolean;
  onHide: () => void;
  ad: Advertisement | null;
  getDescriptionFromKey: (key: string, type: "position" | "platform") => string;
  formatDateTime: (dateTime?: string) => string;
  fetchAdvertisements: () => void;
  positions: EnumOption[];
}

const AdvertisementModal = ({
                              show,
                              onHide,
                              ad,
                              getDescriptionFromKey,
                              formatDateTime,
                              fetchAdvertisements,
                              positions
                            }: AdvertisementModalProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showContentEdit, setShowContentEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!ad) return null;

  const handleDelete = async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await advertisementApi.deleteAd({
        application: "USER",
        advertisementId: ad.advertisementId,
      });
      if (response.ok) {
        toast.success("광고가 삭제되었습니다.");
        fetchAdvertisements();
      } else {
        toast.error("광고 삭제에 실패했습니다.");
      }
    } finally {
      setIsDeleting(false);
      onHide();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ad.linkUrl);
    toast.success("링크가 복사되었습니다.");
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered className="app-modal">
        <Modal.Header closeButton>
          <div className="min-w-0">
            <Modal.Title as="h2">
              <i className="bi bi-bullseye"/>
              광고 상세
            </Modal.Title>
            <p className="app-modal__subtitle font-monospace">{ad.advertisementId}</p>
          </div>
        </Modal.Header>

        <Modal.Body>
          {/* 노출 상태 */}
          <AdTimer
            startDateTime={ad.startDateTime}
            endDateTime={ad.endDateTime}
            className="mb-1"
          />

          {/* 기본 정보 */}
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-info-circle"/>
              기본 정보
            </h3>

            <div className="row g-3">
              <DetailField label="캠페인" className="col-6 col-md-3">
                {ad.groupId}
              </DetailField>
              <DetailField label="구좌" className="col-6 col-md-3">
                {getDescriptionFromKey(ad.positionType, "position")}
              </DetailField>
              <DetailField label="정렬" className="col-6 col-md-3">
                {ad.orderType === "PINNED" ? `고정 (${ad.sortNumber ?? "미정"})` : "랜덤"}
              </DetailField>
              <DetailField label="노출 플랫폼" className="col-6 col-md-3">
                <span className="d-flex flex-wrap gap-1">
                  {(ad.platformType === 'ALL' || ad.platformType === 'AOS') && (
                    <span className="badge text-bg-light">
                      <i className="bi bi-android2 text-success me-1"/>
                      Android
                    </span>
                  )}
                  {(ad.platformType === 'ALL' || ad.platformType === 'IOS') && (
                    <span className="badge text-bg-light">
                      <i className="bi bi-apple me-1"/>
                      iOS
                    </span>
                  )}
                </span>
              </DetailField>
              <DetailField label="시작일시" className="col-6">
                {formatDateTime(ad.startDateTime)}
              </DetailField>
              <DetailField label="종료일시" className="col-6">
                {formatDateTime(ad.endDateTime)}
              </DetailField>
              {ad.description && (
                <DetailField label="설명" className="col-12">
                  {ad.description}
                </DetailField>
              )}
            </div>
          </div>

          {/* 미리보기 */}
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-eye"/>
              광고 미리보기
            </h3>
            <div className="ad-preview-container">
              <AdPreview
                positionType={ad.positionType}
                imageUrl={ad.imageUrl}
                title={ad.title}
                subTitle={ad.subTitle}
                extraContent={ad.extraContent}
                titleFontColor={ad.titleFontColor}
                subTitleFontColor={ad.subTitleFontColor}
                extraContentFontColor={ad.extraFontColor}
                backgroundColor={ad.backgroundColor}
              />
            </div>
          </div>

          {/* 링크 정보 */}
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-link-45deg"/>
              링크 정보
            </h3>

            <DetailField label="대상 URL" monospace placeholder="링크 없음">
              {ad.linkUrl}
            </DetailField>

            {ad.linkUrl && (
              <div className="d-flex flex-wrap gap-2 mt-2">
                <a
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="bi bi-box-arrow-up-right me-1"/>
                  새 창에서 열기
                </a>
                <button className="btn btn-sm btn-outline-secondary" onClick={handleCopyLink}>
                  <i className="bi bi-clipboard me-1"/>
                  링크 복사
                </button>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-outline-danger me-auto"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <i className="bi bi-trash me-1"/>
            삭제
          </button>
          <button className="btn btn-outline-secondary" onClick={onHide}>
            닫기
          </button>
          <button className="btn btn-outline-primary" onClick={() => setShowContentEdit(true)}>
            <i className="bi bi-palette me-1"/>
            콘텐츠 수정
          </button>
          <button className="btn btn-primary" onClick={() => setShowEdit(true)}>
            <i className="bi bi-gear me-1"/>
            기본 정보 수정
          </button>
        </Modal.Footer>
      </Modal>

      <AdvertisementEditModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        ad={ad}
        positions={positions}
        fetchAdvertisements={fetchAdvertisements}
      />
      <AdvertisementContentEditModal
        show={showContentEdit}
        onHide={() => setShowContentEdit(false)}
        ad={ad}
        fetchAdvertisements={fetchAdvertisements}
      />
    </>
  );
};

export default AdvertisementModal;
