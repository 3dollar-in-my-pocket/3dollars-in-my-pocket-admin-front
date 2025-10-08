import {Modal} from "react-bootstrap";
import {useEffect, useState} from "react";
import {formatDateTime} from "../../utils/dateUtils";
import faqApi from "../../api/faqApi";
import {toast} from "react-toastify";

const FaqEditModal = ({applications, showModal, handleCloseModal, selectedApplication, selectedFaq, faqCategories}) => {
  const [editedFaq, setEditedFaq] = useState(selectedFaq || {});
  const [selectedCategory, setSelectedCategory] = useState(selectedFaq?.category?.category || "");

  useEffect(() => {
    if (selectedFaq) {
      setEditedFaq(selectedFaq);
      setSelectedCategory(selectedFaq.category?.category || "");
    } else {
      setEditedFaq({application: selectedApplication});
      setSelectedCategory("");
    }
  }, [selectedFaq, selectedApplication, showModal]);

  const handleChange = ({target: {name, value}}) => {
    setEditedFaq((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "category") {
      setSelectedCategory(value);
    }
  };

  const handleSave = async () => {
    const payload = {
      application: editedFaq.application,
      question: editedFaq.question,
      answer: editedFaq.answer,
      category: selectedCategory,
    };

    const action = selectedFaq
      ? await faqApi.updateFaq({
        ...payload,
        faqId: editedFaq.faqId,
      })
      : await faqApi.createFaq(payload);

    const response = await action;
    if (response.ok) {
      toast.info(selectedFaq ? "수정되었습니다" : "등록되었습니다");
      handleCloseModal();
    }
  };

  const handleDelete = () => {
    console.log(editedFaq);

    if (selectedFaq && window.confirm("정말 삭제하시겠습니까?")) {
      faqApi.deleteFaq({application: editedFaq.application, faqId: selectedFaq.faqId}).then((response) => {
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
          <ApplicationSelect applications={applications} selectedApplication={editedFaq.application}
                             handleChange={handleChange} faq={selectedFaq}/>
          <CategorySelect selectedCategory={selectedCategory} handleChange={handleChange}
                          faqCategories={faqCategories}/>
          <InputField label="질문" name="question" value={editedFaq.question} handleChange={handleChange}/>
          <TextAreaField label="답변" name="answer" value={editedFaq.answer} handleChange={handleChange}/>
          {selectedFaq && (
            <>
              <InputField label="생성일자" name="createdAt" value={formatDateTime(selectedFaq.createdAt)} handleChange={() => {}} disabled/>
              <InputField label="수정일자" name="updatedAt" value={formatDateTime(selectedFaq.updatedAt)} handleChange={() => {}} disabled/>
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
            disabled={!editedFaq.category || !editedFaq.question?.trim() || !editedFaq.answer?.trim() || (!selectedFaq && !editedFaq.application)}
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
