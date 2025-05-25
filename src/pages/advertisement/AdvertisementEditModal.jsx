import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import advertisementApi from "../../api/advertisementApi";
import BasicInfoStep from "./steps/BasicInfoStep";

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
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>광고 수정</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <BasicInfoStep formData={formData} onChange={handleChange} positions={positions} platforms={platforms}
                         disablePosition={true}/>
          <div className="d-flex justify-content-end mt-4">
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
            >
              저장
            </Button>
          </div>
        </Form>
      </Modal.Body>
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
