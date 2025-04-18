import {useCallback, useEffect, useState} from "react";
import faqApi from "../../api/faqApi";
import {formatDateTime} from "../../utils/dateUtils";
import {Button} from "react-bootstrap";
import FaqEditModal from "./FaqEditModal";

const applications = [
  {type: "USER_API", description: "가슴속 3천원"},
  {type: "BOSS_API", description: "가슴속 3천원 사장님"},
];

const FaqManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [faqCategories, setFaqCategories] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  const fetchFaqs = useCallback(() => {
    if (!selectedApplication) return;

    faqApi
      .listFaqs({
        application: selectedApplication,
        category: selectedFaqCategory,
      })
      .then((res) => {
        if (res.ok) setFaqs(res.data.contents);
      });
  }, [selectedApplication, selectedFaqCategory]);

  const fetchFaqCategories = useCallback(() => {
    faqApi
      .listFaqCategories({application: selectedApplication})
      .then((res) => {
        if (res.ok) setFaqCategories(res.data.contents);
      });
  }, [selectedApplication]);

  useEffect(() => {
    if (!selectedApplication) return;
    fetchFaqCategories();
    fetchFaqs();
  }, [selectedApplication, fetchFaqCategories, fetchFaqs]);

  useEffect(() => {
    if (selectedApplication) {
      fetchFaqs();
    }
  }, [selectedFaqCategory, fetchFaqs, selectedApplication]);

  const handleShowModal = (faq = null) => {
    setSelectedFaq(faq);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFaq(null);
    fetchFaqs();
  };

  return (
    <div className="container-fluid py-4">
      <Header/>
      <FilterSection
        selectedApplication={selectedApplication}
        setSelectedApplication={setSelectedApplication}
        selectedFaqCategory={selectedFaqCategory}
        setSelectedFaqCategory={setSelectedFaqCategory}
        faqCategories={faqCategories}
        fetchFaqs={fetchFaqs}
      />
      <FaqTable faqs={faqs} onEdit={handleShowModal}/>
      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-success btn-sm py-1 fs-6" onClick={() => handleShowModal()}>
          신규 등록
        </button>
      </div>
      <FaqEditModal
        selectedApplication={selectedApplication}
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        selectedFaq={selectedFaq}
        faqCategories={faqCategories}
        applications={applications}
      />
    </div>
  );
};

const Header = () => (
  <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
    <h2 className="fw-bold text">📝 FAQ 관리</h2>
  </div>
);

const FilterSection = ({
                         selectedApplication,
                         setSelectedApplication,
                         selectedFaqCategory,
                         setSelectedFaqCategory,
                         faqCategories,
                         fetchFaqs,
                       }) => (
  <div className="card shadow-sm mb-4 rounded-3">
    <div className="card-body row g-3 align-items-end">
      <div className="col-md-4">
        <label className="form-label fw-semibold text-secondary">서비스</label>
        <select
          className="form-select form-select-lg"
          value={selectedApplication}
          onChange={(e) => setSelectedApplication(e.target.value)}
        >
          <option value="">선택하세요</option>
          {applications.map((app) => (
            <option key={app.type} value={app.type}>
              {app.description}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label fw-semibold text-secondary">FAQ 카테고리</label>
        <select
          className="form-select form-select-lg"
          value={selectedFaqCategory}
          onChange={(e) => setSelectedFaqCategory(e.target.value)}
          disabled={!faqCategories.length}
        >
          <option value="">전체</option>
          {faqCategories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.description}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-4 text-end">
        <button
          className="btn btn-outline-primary px-4 py-2 fs-6"
          onClick={fetchFaqs}
          disabled={!selectedApplication}
        >
          🔍 새로고침
        </button>
      </div>
    </div>
  </div>
);

const FaqTable = ({faqs, onEdit}) => (
  <div className="table-responsive">
    <table className="table table-bordered align-middle text-center table-striped table-hover">
      <thead className="table-dark">
      <tr>
        <th>-</th>
        <th>카테고리</th>
        <th>질문</th>
        <th style={{width: "300px"}}>답변</th>
        <th>생성일자</th>
        <th>수정일자</th>
        <th>수정</th>
      </tr>
      </thead>
      <tbody>
      {faqs.length === 0 ? (
        <tr>
          <td colSpan="7" className="py-5 text-muted fs-5">
            📭 등록된 FAQ가 존재하지 않습니다.
          </td>
        </tr>
      ) : (
        faqs.map((faq) => (
          <tr key={faq.faqId}>
            <td>{faq.faqId}</td>
            <td>{faq.category.description}</td>
            <td>{faq.question}</td>
            <td className="text-truncate" style={{maxWidth: "300px"}}>
              {faq.answer}
            </td>
            <td>{formatDateTime(faq.createdAt)}</td>
            <td>{formatDateTime(faq.updatedAt)}</td>
            <td>
              <Button
                variant="info"
                onClick={() => onEdit(faq)}
                className="btn-sm"
              >
                수정
              </Button>
            </td>
          </tr>
        ))
      )}
      </tbody>
    </table>
  </div>
);

export default FaqManagement;
