import React, {useEffect, useState} from "react";
import policyApi from "../../api/policyApi";
import enumApi from "../../api/enumApi";
import PolicyModal from "./PolicyModal";
import PolicyRegisterModal from "./PolicyRegisterModal";
import {toast} from "react-toastify";
import Loading from "../../components/common/Loading";

const Policy = () => {
  const [policyList, setPolicyList] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [policies, setPolicies] = useState([]);

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
    try {
      const enumResponse = await enumApi.getEnum();
      if (enumResponse.data) {
        setCategories([{key: "", description: "전체 카테고리"}, ...enumResponse.data["PolicyCategoryType"] || []]);
        setPolicies(enumResponse.data["PolicyType"] || []);
      }
    } catch (error) {
      console.error("Enum 조회 실패:", error);
      toast.error("카테고리 목록을 불러오는데 실패했습니다.");
    }
  };

  const resetPagination = () => {
    setCursor(null);
    setHasMore(true);
    setHasPrevious(false);
    setPreviousCursors([]);
  };

  const fetchPolicies = async (nextCursor = null) => {
    setIsLoading(true);
    try {
      const params = {
        size: pageSize, ...(nextCursor && {cursor: nextCursor}), ...(selectedCategory && {categoryId: selectedCategory}),
      };

      const response = await policyApi.listPolicies(params);
      if (response.data) {
        const policies = response.data.contents || [];
        const cursor = response.data.cursor || {};

        setPolicyList(policies);
        setHasMore(cursor.hasMore || false);
        setCursor(cursor.nextCursor || null);
      } else {
        setPolicyList([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("정책 목록 조회 실패:", error);
      toast.error("정책 목록을 불러오는데 실패했습니다.");
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

  const getDescriptionFromKey = (key, type) => {
    let targetArray = [];
    if (type === "category") {
      targetArray = categories;
    } else if (type === "policy") {
      targetArray = policies;
    }

    return targetArray.find((item) => item.key === key)?.description || key;
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm("정말로 이 정책을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await policyApi.deletePolicy({
        policyId: policyId
      });

      if (response.data) {
        toast.success("정책이 삭제되었습니다.");
        fetchPolicies(); // 목록 새로고침
        setSelectedPolicy(null); // 모달 닫기
      } else {
        toast.error("정책 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("정책 삭제 실패:", error);
      toast.error("정책 삭제 중 오류가 발생했습니다.");
    }
  };

  return (<div className="container-fluid py-4">
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 border-bottom pb-2 gap-2">
      <h2 className="fw-bold mb-2 mb-md-0">🛡️ 정책 관리</h2>
      <button
        className="btn btn-success"
        onClick={() => setShowRegisterModal(true)}
      >
        ➕ 신규 정책 등록
      </button>
    </div>

    {/* 필터 섹션 */}
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4 mb-3 mb-md-0">
            <label className="form-label">카테고리</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (<option key={category.key} value={category.key}>
                {category.description}
              </option>))}
            </select>
          </div>
          <div className="col-12 col-md-8">
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary w-100 w-md-auto"
                onClick={() => {
                  setSelectedCategory("");
                  resetPagination();
                  fetchPolicies();
                }}
              >
                🔄 필터 초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 정책 목록 - 모바일 카드 뷰와 테이블 뷰 */}
    <div className="d-block d-md-none">
      {/* 모바일 카드 뷰 */}
      {isLoading ? (
        <div className="text-center py-5">
          <Loading/>
        </div>
      ) : policyList.length === 0 ? (
        <div className="text-center py-5 text-muted fs-5">
          📋 등록된 정책이 없습니다.
        </div>
      ) : (
        <div className="row g-3">
          {policyList.map((policy) => (
            <div key={policy.policyId} className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col-6">
                      <small className="text-muted">카테고리</small>
                      <div className="fw-bold">
                        {getDescriptionFromKey(policy.categoryId, "category")}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">값</small>
                      <div className="fw-bold text-truncate">{policy.value}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">설명</small>
                    <div className="text-truncate" title={policy.description}>
                      {policy.description}
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    상세 보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* 데스크톱 테이블 뷰 */}
    <div className="d-none d-md-block table-responsive">
      <table className="table table-bordered align-middle text-center">
        <thead className="table-dark">
        <tr>
          <th>카테고리</th>
          <th>설명</th>
          <th>값</th>
          <th>상세</th>
        </tr>
        </thead>
        <tbody>
        {isLoading ? (<tr>
          <td colSpan={4} className="py-5">
            <Loading/>
          </td>
        </tr>) : policyList.length === 0 ? (<tr>
          <td colSpan={4} className="py-5 text-muted fs-5">
            📋 등록된 정책이 없습니다.
          </td>
        </tr>) : (policyList.map((policy) => (<tr key={policy.policyId}>
          <td>{getDescriptionFromKey(policy.categoryId, "category")}</td>
          <td className="text-start" style={{maxWidth: '300px'}}>
            <div className="text-truncate" title={policy.description}>
              {policy.description}
            </div>
          </td>
          <td>{policy.value}</td>
          <td>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setSelectedPolicy(policy)}
            >
              상세 보기
            </button>
          </td>
        </tr>)))}
        </tbody>
      </table>
    </div>

    {/* 하단 페이징 */}
    <div className="d-flex justify-content-center mt-4">
      <div className="d-flex flex-column flex-sm-row gap-2 w-100">
        <button
          className="btn btn-outline-primary flex-fill"
          onClick={handlePreviousPage}
          disabled={!hasPrevious}
        >
          ← 이전 페이지
        </button>
        <button
          className="btn btn-outline-primary flex-fill"
          onClick={handleNextPage}
          disabled={!hasMore}
        >
          다음 페이지 →
        </button>
      </div>
    </div>

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
  </div>);
};

export default Policy;
