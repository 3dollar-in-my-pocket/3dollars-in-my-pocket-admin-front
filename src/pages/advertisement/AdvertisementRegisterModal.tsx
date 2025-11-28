import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import advertisementApi from "../../api/advertisementApi";
import BasicInfoStep from "./steps/BasicInfoStep";
import ContentInfoStep from "./steps/ContentInfoStep";
import {useNonce} from "../../hooks/useNonce";

const AdvertisementRegisterModal = ({show, onHide, positions, fetchAdvertisements}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(getInitialFormData());
  const {nonce, issueNonce, clearNonce} = useNonce();

  const platforms = [
    {key: "ALL", description: "전체 플랫폼"},
    {key: "AOS", description: "안드로이드"},
    {key: "IOS", description: "iOS"},
  ];

  // 모달이 열릴 때 Nonce 토큰 발급
  useEffect(() => {
    if (show) {
      issueNonce();
    } else {
      // 모달이 닫힐 때 Nonce 토큰 초기화
      clearNonce();
    }
  }, [show, issueNonce, clearNonce]);

  const resetForm = () => {
    if (!window.confirm("정말로 초기화 하시겠습니까?")) {
      return
    }
    reset()
  };

  const reset = () => {
    setFormData(getInitialFormData());
    setCurrentStep(1);
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    if (!formData.position || !formData.platform || !formData.content.image.url) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    if (!nonce) {
      toast.error("Nonce 토큰이 발급되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const content = {
      ...formData.content,
      ...(formData.content.link.linkType !== "null" && formData.content.link.linkUrl
        ? {link: formData.content.link}
        : {}),
    };

    try {
      const res = await advertisementApi.createAd({
        application: "USER_API",
        adData: {
          ...formData,
          startDateTime: `${formData.startDateTime}:00`,
          endDateTime: `${formData.endDateTime}:00`,
          content,
        },
        nonce,
      });

      if (res.ok) {
        toast.success("광고 등록이 완료되었습니다.");
        reset();
        fetchAdvertisements()
        onHide();
      } else {
        toast.error("광고 등록에 실패했습니다.");
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  };

  const StepComponent = currentStep === 1
    ? <BasicInfoStep formData={formData} onChange={handleChange} positions={positions} platforms={platforms}/>
    : <ContentInfoStep formData={formData} onChange={setFormData}/>;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>광고 등록</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {StepComponent}
          <div className="d-flex justify-content-between mt-4">
            {currentStep > 1 && (
              <Button variant="secondary" onClick={() => setCurrentStep((prev) => prev - 1)}>
                이전
              </Button>
            )}
            <div>
              <Button variant="danger" className="me-2" onClick={resetForm}>
                초기화
              </Button>
              {currentStep === 1 ? (
                <Button
                  disabled={!formData.groupId || !formData.position || !formData.startDateTime || !formData.endDateTime || !formData.platform || !formData.orderType}
                  variant="primary"
                  onClick={() => {
                    setCurrentStep(2);
                  }}
                >
                  다음
                </Button>
              ) : (
                <Button variant="success" onClick={handleSubmit}
                        disabled={!formData.content.image.url || !formData.content.link.linkType || !formData.content.link.linkUrl}
                >
                  등록
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

function getInitialFormData() {
  return {
    groupId: null,
    description: null,
    position: null,
    platform: "ALL",
    startDateTime: null,
    endDateTime: null,
    contentType: "STATIC",
    content: {
      title: null,
      titleFontColor: null,
      subTitle: null,
      subTitleFontColor: null,
      extraContent: null,
      extraContentFontColor: null,
      backgroundColor: null,
      image: {
        url: null,
        width: null,
        height: null,
      },
      link: {
        linkType: null,
        linkUrl: null,
      },
      exposureIndex: null,
    },
    sortNumber: null,
    orderType: "RANDOM",
  };
}

AdvertisementRegisterModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  positions: PropTypes.array.isRequired,
};

export default AdvertisementRegisterModal;
