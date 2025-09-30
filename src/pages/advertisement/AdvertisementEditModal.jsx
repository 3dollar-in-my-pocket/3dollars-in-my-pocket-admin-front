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

    try {
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
      } else {
        toast.error("광고 수정에 실패했습니다.");
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  };

  if (!formData) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen="lg-down">
      <Modal.Header closeButton className="border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <Modal.Title className="text-white d-flex align-items-center gap-2">
          <i className="bi bi-pencil-square"></i>
          광고 수정
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
                      <small className="text-muted d-block">그룹 ID</small>
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
              <div className="bg-warning-subtle rounded-circle p-2 me-3">
                <i className="bi bi-gear text-warning fs-5"></i>
              </div>
              <h5 className="mb-0 text-warning fw-bold">수정 가능 항목</h5>
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
