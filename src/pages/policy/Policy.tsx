import {useEffect, useState} from "react";
import policyApi from "@/api/policyApi";
import enumApi from "@/api/enumApi";
import PolicyModal from "./PolicyModal";
import PolicyRegisterModal from "./PolicyRegisterModal";
import {toast} from "react-toastify";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import FilterCard from "@/components/common/FilterCard";
import SectionCard from "@/components/common/SectionCard";
import DataTable from "@/components/common/DataTable";
import {Policy as PolicyItem, PolicyId} from "@/types/policy";
import {EnumOption} from "@/types/advertisement";

const Policy = () => {
  const [policyList, setPolicyList] = useState<PolicyItem[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<EnumOption[]>([]);
  const [policies, setPolicies] = useState<EnumOption[]>([]);

  const pageSize = 20;

  useEffect(() => {
    // 카테고리 및 정책 타입 목록 조회
    loadEnums();
    // 초기 정책 목록 조회
    fetchPolicies();
  }, []);

  useEffect(() => {
    // 카테고리 필터 변경 시 목록 재조회
    resetPagination();
    fetchPolicies();
  }, [selectedCategory]);

  const loadEnums = async () => {
    const enumResponse = await enumApi.getEnum();
    if (enumResponse.data) {
      setCategories([{key: "", description: "전체 카테고리"}, ...enumResponse.data["PolicyCategoryType"] || []]);
      setPolicies(enumResponse.data["PolicyType"] || []);
    }
  };

  const resetPagination = () => {
    setCursor(null);
    setHasMore(true);
    setHasPrevious(false);
    setPreviousCursors([]);
  };

  const fetchPolicies = async (nextCursor: string | null = null) => {
    setIsLoading(true);
    try {
      const response = await policyApi.listPolicies({
        size: pageSize,
        cursor: nextCursor,
        ...(selectedCategory && {categoryId: selectedCategory}),
      });

      if (!response.ok) {
        setPolicyList([]);
        setHasMore(false);
        return;
      }

      const {contents = [], cursor} = response.data;
      setPolicyList(contents);
      setHasMore(cursor?.hasMore || false);
      setCursor(cursor?.nextCursor || null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore && cursor) {
      setPreviousCursors(prev => [...prev, cursor]);
      setHasPrevious(true);
      fetchPolicies(cursor);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious && previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const prevCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);

      if (newPreviousCursors.length === 0) {
        setHasPrevious(false);
        fetchPolicies(null); // 첫 페이지
      } else {
        fetchPolicies(prevCursor);
      }
    }
  };

  const getDescriptionFromKey = (key: string, type: "category" | "policy") => {
    let targetArray: EnumOption[] = [];
    if (type === "category") {
      targetArray = categories;
    } else if (type === "policy") {
      targetArray = policies;
    }

    return targetArray.find((item) => item.key === key)?.description || key;
  };

  const handleDeletePolicy = async (policyId: PolicyId) => {
    if (!window.confirm("정말로 이 정책을 삭제하시겠습니까?")) {
      return;
    }

    const response = await policyApi.deletePolicy({
      policyId: policyId
    });

    if (response.ok) {
      toast.success("정책이 삭제되었습니다.");
      fetchPolicies(); // 목록 새로고침
      setSelectedPolicy(null); // 모달 닫기
    }
  };

  const handleResetFilter = () => {
    setSelectedCategory("");
    resetPagination();
    fetchPolicies();
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="py-5">
          <Loading/>
        </div>
      );
    }

    if (policyList.length === 0) {
      return (
        <EmptyState
          icon="bi-shield-fill-check"
          title="등록된 정책이 없습니다"
          description={selectedCategory ? "선택한 카테고리에 등록된 정책이 없습니다." : "신규 정책을 등록해보세요."}
        />
      );
    }

    return (
      <>
        {/* 모바일 카드 뷰 */}
        <div className="d-md-none p-3">
          <div className="row g-2">
            {policyList.map((policy) => (
              <div key={policy.policyId} className="col-12">
                <div
                  className="item-card item-card--clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPolicy(policy)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPolicy(policy);
                    }
                  }}
                >
                  <div className="item-card__body">
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <span className="page-count">
                        {getDescriptionFromKey(policy.categoryId, "category")}
                      </span>
                      <i className="bi bi-chevron-right text-body-tertiary small"/>
                    </div>

                    <div className="item-card__field">
                      <span className="item-card__label">설명</span>
                      <span className="item-card__value">{policy.description}</span>
                    </div>

                    <div className="item-card__field">
                      <span className="item-card__label">값</span>
                      <span className="item-card__value font-monospace">{policy.value}</span>
                    </div>
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
              <th style={{width: "200px"}}>카테고리</th>
              <th>설명</th>
              <th style={{width: "180px"}}>값</th>
              <th style={{width: "120px"}}>관리</th>
            </tr>
            </thead>
            <tbody>
            {policyList.map((policy) => (
              <tr key={policy.policyId}>
                <td>{getDescriptionFromKey(policy.categoryId, "category")}</td>
                <td>
                  <div className="text-truncate" style={{maxWidth: "480px"}} title={policy.description}>
                    {policy.description}
                  </div>
                </td>
                <td className="font-monospace">{policy.value}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    상세 보기
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

  return (
    <div>
      <PageHeader
        description="앱 동작에 사용되는 서비스 정책을 카테고리별로 조회하고 관리합니다."
        actions={
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
            <i className="bi bi-plus-lg me-1"/>
            신규 정책 등록
          </button>
        }
      />

      <FilterCard
        aside={
          <button className="btn btn-sm btn-outline-secondary" onClick={handleResetFilter}>
            <i className="bi bi-arrow-counterclockwise me-1"/>
            초기화
          </button>
        }
      >
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="policy-category">카테고리</label>
            <select
              id="policy-category"
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterCard>

      <SectionCard
        title="정책 목록"
        icon="bi-shield-fill-check"
        aside={!isLoading && policyList.length > 0 && (
          <span className="page-count">{policyList.length}건</span>
        )}
        flush
      >
        {renderBody()}
      </SectionCard>

      {/* 커서 기반 페이지네이션 - 총 건수를 제공하지 않으므로 이전/다음만 노출 */}
      {(hasPrevious || hasMore) && (
        <div className="page-pager">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handlePreviousPage}
            disabled={!hasPrevious || isLoading}
          >
            <i className="bi bi-chevron-left me-1"/>
            이전
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleNextPage}
            disabled={!hasMore || isLoading}
          >
            다음
            <i className="bi bi-chevron-right ms-1"/>
          </button>
        </div>
      )}

      {/* 정책 상세보기/수정 모달 */}
      <PolicyModal
        show={!!selectedPolicy}
        onHide={() => setSelectedPolicy(null)}
        policy={selectedPolicy}
        categories={categories}
        policies={policies}
        onRefresh={fetchPolicies}
        onDelete={handleDeletePolicy}
      />

      {/* 정책 등록 모달 */}
      <PolicyRegisterModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
        categories={categories}
        policies={policies}
        onRefresh={fetchPolicies}
      />
    </div>
  );
};

export default Policy;
