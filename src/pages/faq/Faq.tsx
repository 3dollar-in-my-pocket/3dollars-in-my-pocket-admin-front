import {useCallback, useEffect, useState} from "react";
import faqApi from "@/api/faqApi";
import FaqEditModal, {FaqApplicationOption} from "./FaqEditModal";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import FilterCard from "@/components/common/FilterCard";
import SectionCard from "@/components/common/SectionCard";
import DataTable from "@/components/common/DataTable";
import {Faq, FaqCategory} from "@/types/faq";

const applications: FaqApplicationOption[] = [
  {type: "USER", description: "가슴속 3천원"},
  {type: "BOSS", description: "가슴속 3천원 사장님"},
];

const FaqManagement = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([]);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFaqs = useCallback(() => {
    if (!selectedApplication) return;
    setIsLoading(true);
    faqApi
      .listFaqs({application: selectedApplication, category: selectedFaqCategory})
      .then((res) => {
        if (res.ok) setFaqs(res.data.contents);
      })
      .finally(() => setIsLoading(false));
  }, [selectedApplication, selectedFaqCategory]);

  const fetchFaqCategories = useCallback(() => {
    faqApi
      .listFaqCategories({application: selectedApplication})
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

  const handleShowModal = (faq: Faq | null = null) => {
    setSelectedFaq(faq);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFaq(null);
    fetchFaqs();
  };

  return (
    <div>
      <PageHeader
        description="서비스별 FAQ를 카테고리 단위로 조회하고 등록·수정합니다."
        actions={
          <button className="btn btn-primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-lg me-1"/>
            신규 등록
          </button>
        }
      />

      <FilterCard>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="faq-application">서비스</label>
            <select
              id="faq-application"
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

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="faq-category">FAQ 카테고리</label>
            <select
              id="faq-category"
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

          <div className="col-12 col-md-4 d-flex align-items-end">
            <button
              className="btn btn-outline-primary w-100"
              onClick={fetchFaqs}
              disabled={!selectedApplication || isLoading}
            >
              <i className="bi bi-search me-1"/>
              조회
            </button>
          </div>
        </div>
      </FilterCard>

      <SectionCard
        title="FAQ 목록"
        icon="bi-question-circle-fill"
        aside={!isLoading && faqs.length > 0 && <span className="page-count">{faqs.length}건</span>}
        flush
      >
        <FaqTable
          faqs={faqs}
          onEdit={handleShowModal}
          isLoading={isLoading}
          hasApplication={!!selectedApplication}
        />
      </SectionCard>

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

interface FaqTableProps {
  faqs: Faq[];
  onEdit: (faq: Faq) => void;
  isLoading: boolean;
  hasApplication: boolean;
}

const FaqTable = ({faqs, onEdit, isLoading, hasApplication}: FaqTableProps) => {
  if (isLoading) {
    return (
      <div className="py-5">
        <Loading/>
      </div>
    );
  }

  if (!hasApplication) {
    return (
      <EmptyState
        icon="bi-funnel"
        title="서비스를 선택해주세요"
        description="조회할 서비스를 먼저 선택하면 FAQ 목록이 표시됩니다."
      />
    );
  }

  if (faqs.length === 0) {
    return (
      <EmptyState
        icon="bi-question-circle"
        title="등록된 FAQ가 없습니다"
        description="선택한 조건에 해당하는 FAQ가 없습니다."
      />
    );
  }

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className="d-md-none p-3">
        <div className="row g-2">
          {faqs.map((faq) => (
            <div key={faq.faqId} className="col-12">
              <div
                className="item-card item-card--clickable"
                role="button"
                tabIndex={0}
                onClick={() => onEdit(faq)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onEdit(faq);
                  }
                }}
              >
                <div className="item-card__body">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <span className="page-count">{faq.category.description}</span>
                    <i className="bi bi-chevron-right text-body-tertiary small"/>
                  </div>

                  <p className="item-card__name">{faq.question}</p>
                  <p className="item-card__desc">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 데스크톱 테이블 뷰 */}
      <div className="d-none d-md-block">
        <DataTable>
          <thead>
          <tr>
            <th style={{width: "180px"}}>카테고리</th>
            <th style={{width: "40%"}}>질문</th>
            <th>답변 요약</th>
            <th style={{width: "120px"}}>관리</th>
          </tr>
          </thead>
          <tbody>
          {faqs.map((faq) => (
            <tr key={faq.faqId}>
              <td>{faq.category.description}</td>
              <td className="fw-medium">{faq.question}</td>
              <td>
                <div className="text-truncate text-body-secondary" style={{maxWidth: "360px"}} title={faq.answer}>
                  {faq.answer}
                </div>
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
        </DataTable>
      </div>
    </>
  );
};

export default FaqManagement;
