import {useEffect, useState} from "react";
import {Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import policyApi from "@/api/policyApi";
import {PolicyType} from "@/types/policy";

/** enum API(PolicyCategoryType / PolicyType) 응답 항목 */
interface PolicyEnumOption {
  key: string;
  description: string;
}

interface PolicyRegisterFormData {
  categoryId: string;
  policyId: string;
  value: string;
}

interface PolicyRegisterModalProps {
  show: boolean;
  onHide: () => void;
  categories: PolicyEnumOption[];
  /** 현재 화면에서는 사용하지 않지만 상위(Policy.tsx)에서 전달합니다. */
  policies: PolicyEnumOption[];
  onRefresh: () => void;
}

const INITIAL_FORM: PolicyRegisterFormData = {categoryId: "", policyId: "", value: ""};

const PolicyRegisterModal = ({show, onHide, categories, onRefresh}: PolicyRegisterModalProps) => {
  const [formData, setFormData] = useState<PolicyRegisterFormData>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPolicies, setFilteredPolicies] = useState<PolicyType[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);

  useEffect(() => {
    if (show) {
      // 모달이 열릴 때 폼 초기화
      setFormData(INITIAL_FORM);
      setFilteredPolicies([]);
    }
  }, [show]);

  // 카테고리 변경 시 정책 로드
  useEffect(() => {
    if (formData.categoryId) {
      loadPolicies(formData.categoryId);
      // 카테고리 변경 시 정책 ID 초기화
      setFormData(prev => ({...prev, policyId: ""}));
    } else {
      // 카테고리가 선택되지 않은 경우 정책 목록 비우기
      setFilteredPolicies([]);
      setFormData(prev => ({...prev, policyId: ""}));
    }
  }, [formData.categoryId]);

  const loadPolicies = async (categoryId: string) => {
    setIsLoadingPolicies(true);
    try {
      const response = await policyApi.listPolicyTypes(categoryId);
      setFilteredPolicies(response.ok ? response.data?.contents || [] : []);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const handleChange = <K extends keyof PolicyRegisterFormData>(field: K, value: PolicyRegisterFormData[K]) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await policyApi.createPolicy({
        policyId: formData.policyId,
        value: formData.value.trim()
      });

      if (response.ok) {
        toast.success("정책이 성공적으로 등록되었습니다.");
        onRefresh(); // 목록 새로고침
        onHide(); // 모달 닫기
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onHide();
    }
  };

  /** 정책 선택 안내 문구 */
  const getPolicyHelpText = () => {
    if (!formData.categoryId) {
      return "카테고리를 먼저 선택해주세요.";
    }
    if (isLoadingPolicies) {
      return "정책 목록을 불러오는 중입니다.";
    }
    if (filteredPolicies.length === 0) {
      return "이 카테고리에는 사용 가능한 정책이 없습니다.";
    }
    return "선택한 카테고리에 속한 정책만 표시됩니다.";
  };

  const isSubmittable = formData.categoryId && formData.policyId && formData.value.trim();

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="app-modal"
      backdrop={isLoading ? "static" : true}
    >
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title as="h2">
          <i className="bi bi-plus-circle"/>
          신규 정책 등록
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form className="row g-3">
          <Form.Group className="col-12">
            <Form.Label htmlFor="new-policy-category">
              카테고리 <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              id="new-policy-category"
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              disabled={isLoading}
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.filter(cat => cat.key !== "").map((category) => (
                <option key={category.key} value={category.key}>
                  {category.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label htmlFor="new-policy-type">
              정책 <span className="text-danger">*</span>
              {isLoadingPolicies && (
                <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"/>
              )}
            </Form.Label>
            <Form.Select
              id="new-policy-type"
              value={formData.policyId}
              onChange={(e) => handleChange("policyId", e.target.value)}
              disabled={isLoading || isLoadingPolicies || !formData.categoryId}
            >
              <option value="">
                {!formData.categoryId
                  ? "먼저 카테고리를 선택하세요"
                  : filteredPolicies.length === 0
                    ? "선택 가능한 정책이 없습니다"
                    : "정책을 선택하세요"
                }
              </option>
              {filteredPolicies.map((policy) => (
                <option key={policy.policyId} value={policy.policyId}>
                  {policy.description}
                </option>
              ))}
            </Form.Select>
            <Form.Text>{getPolicyHelpText()}</Form.Text>
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label htmlFor="new-policy-value">
              값 <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              id="new-policy-value"
              type="text"
              value={formData.value}
              onChange={(e) => handleChange("value", e.target.value)}
              placeholder="정책 값을 입력하세요"
              disabled={isLoading}
            />
            <Form.Text>정책에 적용될 구체적인 값을 입력하세요.</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-outline-secondary" onClick={handleClose} disabled={isLoading}>
          취소
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isLoading || !isSubmittable}
        >
          {isLoading && (
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
          )}
          {isLoading ? "등록 중..." : "등록"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default PolicyRegisterModal;
