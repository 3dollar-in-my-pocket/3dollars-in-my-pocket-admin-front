import {Modal} from "react-bootstrap";
import {useEffect} from "react";
import {formatDateTime} from "../../utils/dateUtils";
import faqApi from "../../api/faqApi";
import {toast} from "react-toastify";
import {useNonce} from "../../hooks/useNonce";
import useModalForm from "../../hooks/useModalForm";

interface FaqFormData {
  application: string;
  question: string;
  answer: string;
  category: string;
  faqId?: string;
}

const FaqEditModal = ({applications, showModal, handleCloseModal, selectedApplication, selectedFaq, faqCategories}) => {
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

  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg" centered fullscreen="md-down">
      <Modal.Header closeButton className="border-0">
        <Modal.Title>{selectedFaq ? "FAQ 수정" : "FAQ 신규 등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="row g-3">
          <ApplicationSelect applications={applications} selectedApplication={formData.application}
                             handleChange={handleChange} faq={selectedFaq}/>
          <CategorySelect selectedCategory={formData.category} handleChange={handleChange}
                          faqCategories={faqCategories}/>
          <InputField label="질문" name="question" value={formData.question} handleChange={handleChange}/>
          <TextAreaField label="답변" name="answer" value={formData.answer} handleChange={handleChange}/>
          {selectedFaq && (
            <>
              <InputField label="생성일자" name="createdAt" value={formatDateTime(selectedFaq.createdAt)}
                          handleChange={() => {
                          }} disabled/>
              <InputField label="수정일자" name="updatedAt" value={formatDateTime(selectedFaq.updatedAt)}
                          handleChange={() => {
                          }} disabled/>
            </>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <div className="w-100 d-flex flex-column flex-sm-row gap-2">
          {selectedFaq && (
            <button className="btn btn-outline-danger w-100 w-sm-auto order-sm-1" onClick={handleDelete}>
              삭제
            </button>
          )}
          <button
            className="btn btn-primary w-100 w-sm-auto order-sm-2 ms-sm-auto"
            onClick={handleSave}
            disabled={!formData.category || !formData.question?.trim() || !formData.answer?.trim() || (!selectedFaq && !formData.application)}
          >
            저장
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

const ApplicationSelect = ({applications, selectedApplication, handleChange, faq}) => {
  const selectedAppDescription = applications.find((a) => a.type === selectedApplication)?.description || selectedApplication;

  return (
    <div className="col-12 col-md-6 mb-3 mb-md-0">
      <label className="form-label fw-semibold">서비스</label>
      {faq ? (
        <input
          type="text"
          className="form-control"
          value={selectedAppDescription}
          disabled
        />
      ) : (
        <select
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
      )}
    </div>
  );
};

const CategorySelect = ({selectedCategory, handleChange, faqCategories}) => (
  <div className="col-12 col-md-6">
    <label className="form-label fw-semibold">카테고리</label>
    <select
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

const InputField = ({label, name, value, handleChange, disabled = false}) => (
  <div className="col-12">
    <label className="form-label fw-semibold">{label}</label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={handleChange}
      className="form-control"
      disabled={disabled}
    />
  </div>
);

const TextAreaField = ({label, name, value, handleChange}) => (
  <div className="col-12">
    <label className="form-label fw-semibold">{label}</label>
    <textarea
      name={name}
      value={value || ""}
      onChange={handleChange}
      className="form-control"
      rows={5}
    />
  </div>
);

export default FaqEditModal;
