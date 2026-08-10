import {useEffect, useState} from "react";
import {Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import advertisementApi from "@/api/advertisementApi";
import BasicInfoStep from "./steps/BasicInfoStep";
import ContentInfoStep from "./steps/ContentInfoStep";
import {useNonce} from "@/hooks/useNonce";
import {isFieldRequired} from "@/constants/advertisementSpecs";
import {AdvertisementForm, EnumOption} from "@/types/advertisement";

interface AdvertisementRegisterModalProps {
  show: boolean;
  onHide: () => void;
  positions: EnumOption[];
  fetchAdvertisements: () => void;
}

const AdvertisementRegisterModal = ({
                                      show,
                                      onHide,
                                      positions,
                                      fetchAdvertisements
                                    }: AdvertisementRegisterModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AdvertisementForm>(getInitialFormData());
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

  const handleChange = (field: string, value: string) => {
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

    const {image, link} = formData.content;

    const content = {
      ...formData.content,
      // 입력값은 문자열로 들어오므로 서버 스펙(정수)에 맞춰 변환합니다.
      image: {
        ...image,
        width: image.width ? Number(image.width) : null,
        height: image.height ? Number(image.height) : null,
      },
      // 링크 유형을 고르지 않으면 link 자체를 보내지 않습니다.
      ...(link.linkType && link.linkUrl ? {link} : {}),
    };

    const res = await advertisementApi.createAd({
      application: "USER",
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
    }
  };

  const StepComponent = currentStep === 1
    ? <BasicInfoStep formData={formData} onChange={handleChange} positions={positions} platforms={platforms}/>
    : <ContentInfoStep formData={formData} onChange={setFormData}/>;

  // 등록 버튼 활성화 조건
  const isSubmitDisabled = () => {
    // 이미지는 항상 필수
    if (!formData.content.image.url) {
      return true;
    }

    // link가 필수인 구좌인 경우에만 link 검증
    if (isFieldRequired(formData.position, 'link')) {
      if (!formData.content.link.linkType || !formData.content.link.linkUrl) {
        return true;
      }
    }

    return false;
  };

  const isStep1Complete = formData.groupId
    && formData.position
    && formData.startDateTime
    && formData.endDateTime
    && formData.platform
    && formData.orderType;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="app-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h2">
          <i className="bi bi-plus-circle"/>
          신규 광고 등록
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* 단계 표시 */}
        <ol className="step-indicator">
          {["기본 정보", "콘텐츠"].map((label, index) => {
            const step = index + 1;
            const state = currentStep === step ? "current" : currentStep > step ? "done" : "todo";

            return (
              <li key={label} className={`step-indicator__item step-indicator__item--${state}`}>
                <span className="step-indicator__mark">
                  {currentStep > step ? <i className="bi bi-check-lg"/> : step}
                </span>
                {label}
              </li>
            );
          })}
        </ol>

        <Form>{StepComponent}</Form>
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-link text-danger me-auto" onClick={resetForm}>
          초기화
        </button>

        {currentStep > 1 && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            이전
          </button>
        )}

        {currentStep === 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!isStep1Complete}
            onClick={() => setCurrentStep(2)}
          >
            다음
            <i className="bi bi-chevron-right ms-1"/>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
          >
            등록
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

function getInitialFormData(): AdvertisementForm {
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

export default AdvertisementRegisterModal;
