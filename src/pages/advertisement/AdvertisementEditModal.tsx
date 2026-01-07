import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import advertisementApi from "../../api/advertisementApi";
import BasicInfoStep from "./steps/BasicInfoStep";
import AdTimer from "../../components/common/AdTimer";

const AdvertisementEditModal = ({show, onHide, ad, positions, fetchAdvertisements}) => {
  const [formData, setFormData] = useState(null);

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    const res = await advertisementApi.updateAd({
      application: "USER_API",
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

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen="lg-down">
      <Modal.Header closeButton className="border-0"
                    style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
        <Modal.Title className="text-white d-flex align-items-center gap-2">
          <i className="bi bi-gear"></i>
          광고 기본 정보 수정
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
              <h5 className="mb-0 text-info fw-bold">현재 광고 상태</h5>
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

          {/* 수정 폼 섹션 */}
          <div className="bg-white p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-success-subtle rounded-circle p-2 me-3">
                <i className="bi bi-sliders text-success fs-5"></i>
              </div>
              <h5 className="mb-0 text-success fw-bold">기본 설정 수정</h5>
            </div>
            <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
              <i className="bi bi-info-circle me-2 fs-5"></i>
              <div>
                <strong>기본 정보 수정 영역</strong>
                <br/>
                <small>캠페인 ID, 노출 일정, 플랫폼, 노출 순서 등 기본 설정을 변경할 수 있습니다. 광고의 이미지, 제목, 링크 등 컨텐츠를 수정하려면 "컨텐츠 수정" 버튼을
                  사용해주세요.</small>
              </div>
            </div>
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
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 bg-light p-4">
        <div className="d-flex w-100 gap-2 flex-column flex-sm-row">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="flex-fill d-flex align-items-center justify-content-center gap-2"
            style={{padding: '12px 24px'}}
          >
            <i className="bi bi-x-lg"></i>
            취소
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={
              !formData.groupId ||
              !formData.position ||
              !formData.startDateTime ||
              !formData.endDateTime ||
              !formData.platform ||
              !formData.orderType
            }
            className="flex-fill d-flex align-items-center justify-content-center gap-2"
            style={{padding: '12px 24px'}}
          >
            <i className="bi bi-check-lg"></i>
            저장
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

AdvertisementEditModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  ad: PropTypes.object,
  positions: PropTypes.array.isRequired,
  fetchAdvertisements: PropTypes.func.isRequired,
};

export default AdvertisementEditModal;
