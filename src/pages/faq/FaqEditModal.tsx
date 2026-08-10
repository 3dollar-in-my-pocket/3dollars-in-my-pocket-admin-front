import {Modal} from "react-bootstrap";
import {useEffect} from "react";
import {formatDateTime} from "@/utils/dateUtils";
import faqApi from "@/api/faqApi";
import {toast} from "react-toastify";
import {useNonce} from "@/hooks/useNonce";
import useModalForm from "@/hooks/useModalForm";
import DetailField from "@/components/common/DetailField";
import {Faq, FaqCategory} from "@/types/faq";

interface FaqFormData {
  application: string;
  question: string;
  answer: string;
  category: string;
  faqId?: string;
}

/** 서비스(애플리케이션) 선택 옵션 — 서버 enum이 아닌 화면 상수로 관리됩니다. */
export interface FaqApplicationOption {
  type: string;
  description: string;
}

/** 폼 입력 요소의 공통 onChange 핸들러 (useModalForm.handleChange와 동일 시그니처) */
type FormChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;

interface FaqEditModalProps {
  applications: FaqApplicationOption[];
  showModal: boolean;
  handleCloseModal: () => void;
  selectedApplication: string;
  /** 신규 등록 시 null */
  selectedFaq: Faq | null;
  faqCategories: FaqCategory[];
}

const FaqEditModal = ({
                        applications,
                        showModal,
                        handleCloseModal,
                        selectedApplication,
                        selectedFaq,
                        faqCategories
                      }: FaqEditModalProps) => {
  const {nonce, issueNonce, clearNonce} = useNonce();

  const {
    formData,
    setFormData,
    handleChange,
    setFieldValue,
    resetForm
  } = useModalForm<FaqFormData>({
    initialValues: {
      application: selectedApplication || '',
      question: '',
      answer: '',
      category: '',
      faqId: ''
    },
    validate: (values) => {
      const errors: any = {};

      if (!values.application && !selectedFaq) {
        errors.application = '서비스를 선택해주세요.';
      }
      if (!values.category) {
        errors.category = '카테고리를 선택해주세요.';
      }
      if (!values.question?.trim()) {
        errors.question = '질문을 입력해주세요.';
      }
      if (!values.answer?.trim()) {
        errors.answer = '답변을 입력해주세요.';
      }

      return errors;
    },
    onSubmit: async (values) => {
      // 신규 등록 시 Nonce 토큰 검증
      if (!selectedFaq && !nonce) {
        throw new Error("Nonce 토큰이 발급되지 않았습니다. 잠시 후 다시 시도해주세요.");
      }

      const payload = {
        application: values.application,
        question: values.question,
        answer: values.answer,
        category: values.category,
      };

      if (selectedFaq) {
        return await faqApi.updateFaq({
          ...payload,
          faqId: values.faqId!,
        });
      } else {
        return await faqApi.createFaq({
          ...payload,
          nonce,
        });
      }
    },
    onSuccess: () => {
      toast.info(selectedFaq ? "수정되었습니다" : "등록되었습니다");
      handleCloseModal();
    },
    resetOnSuccess: false
  });

  // 모달이 열릴 때 신규 등록인 경우에만 Nonce 토큰 발급
  useEffect(() => {
    if (showModal && !selectedFaq) {
      issueNonce();
    } else if (!showModal) {
      clearNonce();
    }
  }, [showModal, selectedFaq, issueNonce, clearNonce]);

  // selectedFaq 변경 시 폼 데이터 업데이트
  useEffect(() => {
    if (selectedFaq) {
      setFormData({
        application: selectedFaq.application,
        question: selectedFaq.question,
        answer: selectedFaq.answer,
        category: selectedFaq.category?.category || "",
        faqId: selectedFaq.faqId
      });
    } else {
      setFormData({
        application: selectedApplication || '',
        question: '',
        answer: '',
        category: '',
        faqId: ''
      });
    }
  }, [selectedFaq, selectedApplication, showModal, setFormData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 수동 validation
    if (!formData.category || !formData.question?.trim() || !formData.answer?.trim() || (!selectedFaq && !formData.application)) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    // 신규 등록 시 Nonce 토큰 검증
    if (!selectedFaq && !nonce) {
      toast.error("Nonce 토큰이 발급되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const payload = {
      application: formData.application,
      question: formData.question,
      answer: formData.answer,
      category: formData.category,
    };

    try {
      const response = selectedFaq
        ? await faqApi.updateFaq({
          ...payload,
          faqId: formData.faqId!,
        })
        : await faqApi.createFaq({
          ...payload,
          nonce,
        });

      if (response.ok) {
        toast.info(selectedFaq ? "수정되었습니다" : "등록되었습니다");
        handleCloseModal();
      }
    } catch (error: any) {
      toast.error(error.message || '오류가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    if (selectedFaq && window.confirm("정말 삭제하시겠습니까?")) {
      faqApi.deleteFaq({application: formData.application, faqId: selectedFaq.faqId}).then((response) => {
        if (response.ok) {
          toast.info("삭제되었습니다");
          handleCloseModal();
        }
      });
    }
  };

  const isSubmittable = formData.category
    && formData.question?.trim()
    && formData.answer?.trim()
    && (selectedFaq || formData.application);

  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="app-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h2">
          <i className={`bi ${selectedFaq ? "bi-pencil-square" : "bi-plus-circle"}`}/>
          {selectedFaq ? "FAQ 수정" : "FAQ 신규 등록"}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSave}>
        <Modal.Body>
          <div className="row g-3">
            <ApplicationSelect applications={applications} selectedApplication={formData.application}
                               handleChange={handleChange} faq={selectedFaq}/>
            <CategorySelect selectedCategory={formData.category} handleChange={handleChange}
                            faqCategories={faqCategories}/>
            <InputField label="질문" name="question" value={formData.question} handleChange={handleChange}
                        required placeholder="유저에게 보여질 질문을 입력하세요"/>
            <TextAreaField label="답변" name="answer" value={formData.answer} handleChange={handleChange}
                           required placeholder="질문에 대한 답변을 입력하세요"/>
          </div>

          {selectedFaq && (
            <div className="modal-section">
              <h3 className="modal-section__title">
                <i className="bi bi-clock-history"/>
                등록 · 수정 일시
              </h3>
              <div className="row g-3">
                <DetailField label="생성일자" className="col-6">
                  {formatDateTime(selectedFaq.createdAt)}
                </DetailField>
                <DetailField label="수정일자" className="col-6">
                  {formatDateTime(selectedFaq.updatedAt)}
                </DetailField>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {selectedFaq && (
            <button type="button" className="btn btn-outline-danger me-auto" onClick={handleDelete}>
              <i className="bi bi-trash me-1"/>
              삭제
            </button>
          )}
          <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
            취소
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isSubmittable}>
            저장
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

interface ApplicationSelectProps {
  applications: FaqApplicationOption[];
  selectedApplication: string;
  handleChange: FormChangeHandler;
  /** 수정 모드면 FAQ, 신규 등록이면 null (읽기 전용 표시 여부 판단용) */
  faq: Faq | null;
}

const ApplicationSelect = ({applications, selectedApplication, handleChange, faq}: ApplicationSelectProps) => {
  const selectedAppDescription = applications.find((a) => a.type === selectedApplication)?.description || selectedApplication;

  // 수정 모드에서는 서비스를 변경할 수 없으므로 값만 표시한다
  if (faq) {
    return (
      <DetailField label="서비스" className="col-12 col-md-6">
        {selectedAppDescription}
      </DetailField>
    );
  }

  return (
    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="faq-form-application">
        서비스 <span className="text-danger">*</span>
      </label>
      <select
        id="faq-form-application"
        name="application"
        value={selectedApplication}
        onChange={handleChange}
        className="form-select"
      >
        <option value="">선택하세요</option>
        {applications.map((app) => (
          <option key={app.type} value={app.type}>
            {app.description}
          </option>
        ))}
      </select>
    </div>
  );
};

interface CategorySelectProps {
  selectedCategory: string;
  handleChange: FormChangeHandler;
  faqCategories: FaqCategory[];
}

const CategorySelect = ({selectedCategory, handleChange, faqCategories}: CategorySelectProps) => (
  <div className="col-12 col-md-6">
    <label className="form-label" htmlFor="faq-form-category">
      카테고리 <span className="text-danger">*</span>
    </label>
    <select
      id="faq-form-category"
      name="category"
      value={selectedCategory || ""}
      onChange={handleChange}
      className="form-select"
    >
      <option value="">선택하세요</option>
      {faqCategories.map((cat) => (
        <option key={cat.category} value={cat.category}>
          {cat.description}
        </option>
      ))}
    </select>
  </div>
);

interface InputFieldProps {
  label: string;
  name: string;
  value?: string;
  handleChange: FormChangeHandler;
  required?: boolean;
  placeholder?: string;
}

const InputField = ({label, name, value, handleChange, required = false, placeholder}: InputFieldProps) => (
  <div className="col-12">
    <label className="form-label" htmlFor={`faq-form-${name}`}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      id={`faq-form-${name}`}
      type="text"
      name={name}
      value={value || ""}
      onChange={handleChange}
      className="form-control"
      placeholder={placeholder}
    />
  </div>
);

interface TextAreaFieldProps {
  label: string;
  name: string;
  value?: string;
  handleChange: FormChangeHandler;
  required?: boolean;
  placeholder?: string;
}

const TextAreaField = ({label, name, value, handleChange, required = false, placeholder}: TextAreaFieldProps) => (
  <div className="col-12">
    <label className="form-label" htmlFor={`faq-form-${name}`}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <textarea
      id={`faq-form-${name}`}
      name={name}
      value={value || ""}
      onChange={handleChange}
      className="form-control"
      rows={6}
      placeholder={placeholder}
    />
  </div>
);

export default FaqEditModal;
