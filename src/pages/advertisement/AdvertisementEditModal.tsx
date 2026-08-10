import {useEffect, useState} from "react";
import {Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import advertisementApi from "@/api/advertisementApi";
import BasicInfoStep from "./steps/BasicInfoStep";
import AdTimer from "@/components/common/AdTimer";
import {Advertisement, AdvertisementBasicInfoForm, EnumOption} from "@/types/advertisement";

interface AdvertisementEditModalProps {
  show: boolean;
  onHide: () => void;
  ad?: Advertisement | null;
  positions: EnumOption[];
  fetchAdvertisements: () => void;
}

const AdvertisementEditModal = ({
                                  show,
                                  onHide,
                                  ad,
                                  positions,
                                  fetchAdvertisements
                                }: AdvertisementEditModalProps) => {
  const [formData, setFormData] = useState<AdvertisementBasicInfoForm | null>(null);

  const platforms = [
    {key: "ALL", description: "전체 플랫폼"},
    {key: "AOS", description: "안드로이드"},
    {key: "IOS", description: "iOS"},
  ];

  useEffect(() => {

    if (ad) {
      setFormData({
        groupId: ad.groupId,
        description: ad.description,
        position: ad.positionType,
        platform: ad.platformType,
        startDateTime: ad.startDateTime?.slice(0, 16) || "",
        endDateTime: ad.endDateTime?.slice(0, 16) || "",
        sortNumber: ad.sortNumber,
        orderType: ad.orderType,
      });
    }
  }, [ad]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    const res = await advertisementApi.updateAd({
      application: "USER",
      advertisementId: ad.advertisementId,
      adData: {
        ...formData,
        startDateTime: `${formData.startDateTime}:00`,
        endDateTime: `${formData.endDateTime}:00`,
        sortNumber: formData.orderType === "RANDOM" ? null : formData.sortNumber,
      },
    });
    if (res.ok) {
      toast.success("광고가 수정되었습니다.");
      fetchAdvertisements();
      onHide();
    }
  };

  if (!formData) return null;

  const isSubmittable = formData.groupId
    && formData.position
    && formData.startDateTime
    && formData.endDateTime
    && formData.platform
    && formData.orderType;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="app-modal">
      <Modal.Header closeButton>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className="bi bi-gear"/>
            기본 정보 수정
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">{ad.advertisementId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* 현재 노출 상태 */}
        <AdTimer
          startDateTime={ad.startDateTime}
          endDateTime={ad.endDateTime}
          className="mb-1"
        />

        <div className="page-note mt-3">
          <i className="bi bi-info-circle"/>
          <span>
            캠페인 ID, 노출 일정, 플랫폼, 노출 순서를 변경할 수 있습니다.
            이미지·제목·링크 등 콘텐츠는 <strong>콘텐츠 수정</strong>에서 변경해주세요.
          </span>
        </div>

        <div className="modal-section">
          <Form>
            <BasicInfoStep
              formData={formData}
              onChange={handleChange}
              positions={positions}
              platforms={platforms}
              disablePosition={true}
            />
          </Form>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-outline-secondary" onClick={onHide}>
          취소
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!isSubmittable}>
          저장
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdvertisementEditModal;
