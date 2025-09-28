import {useCallback, useEffect, useState} from "react";
import faqApi from "../../api/faqApi";
import FaqEditModal from "./FaqEditModal";
import Loading from "../../components/common/Loading";

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
  const [isLoading, setIsLoading] = useState(false);

  const fetchFaqs = useCallback(() => {
    if (!selectedApplication) return;
    setIsLoading(true);
    faqApi
      .listFaqs({ application: selectedApplication, category: selectedFaqCategory })
      .then((res) => {
        if (res.ok) setFaqs(res.data.contents);
      })
      .finally(() => setIsLoading(false));
  }, [selectedApplication, selectedFaqCategory]);

  const fetchFaqCategories = useCallback(() => {
    faqApi
      .listFaqCategories({ application: selectedApplication })
      .then((res) => {
        if (res.ok) setFaqCategories(res.data.contents);
      });
  }, [selectedApplication]);

  useEffect(() => {
    if (selectedApplication) {
      fetchFaqCategories();
      fetchFaqs();
    }
  }, [selectedApplication, fetchFaqCategories, fetchFaqs]);

  useEffect(() => {
    if (selectedApplication) {
      fetchFaqs();
    }
  }, [selectedFaqCategory, fetchFaqs]);

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
      {/* 데스크톱 헤더 */}
      <div className="d-none d-md-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h2 className="fw-bold">🎯 FAQ 관리</h2>
        <button className="btn btn-success" onClick={() => handleShowModal()}>
          <i className="bi bi-plus-circle me-2"></i> 신규 등록
        </button>
      </div>

      {/* 모바일 헤더 */}
      <div className="d-md-none mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-3">🎯 FAQ 관리</h2>
        <button className="btn btn-success w-100" onClick={() => handleShowModal()}>
          <i className="bi bi-plus-circle me-2"></i> 신규 등록
        </button>
      </div>

      <FilterSection
        selectedApplication={selectedApplication}
        setSelectedApplication={setSelectedApplication}
        selectedFaqCategory={selectedFaqCategory}
        setSelectedFaqCategory={setSelectedFaqCategory}
        faqCategories={faqCategories}
        fetchFaqs={fetchFaqs}
      />

      <FaqTable faqs={faqs} onEdit={handleShowModal} isLoading={isLoading} />

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
          className="form-select"
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
          className="form-select"
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

      <div className="col-md-2">
        <button
          className="btn btn-primary w-100"
          onClick={fetchFaqs}
        >
          <i className="bi bi-search me-1"></i> 조회
        </button>
      </div>
    </div>
  </div>
);

const FaqTable = ({ faqs, onEdit, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <Loading />
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="py-5 text-center text-muted fs-5">
        📭 등록된 FAQ가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle text-center table-hover">
        <thead className="table-dark">
        <tr>
          <th style={{ width: "180px" }}>카테고리</th>
          <th style={{ width: "500px" }}>질문</th>
          <th>답변 요약</th>
          <th style={{ width: "120px" }}>관리</th>
        </tr>
        </thead>
        <tbody>
        {faqs.map((faq) => (
          <tr key={faq.faqId}>
            <td>{faq.category.description}</td>
            <td className="text-start">{faq.question}</td>
            <td className="text-start text-truncate" style={{ maxWidth: "300px" }}>
              {faq.answer}
            </td>
            <td>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => onEdit(faq)}
              >
                상세보기
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default FaqManagement;
