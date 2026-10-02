import {useEffect, useMemo, useRef, useState} from "react";
import {Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import policyApi from "@/api/policyApi";
import {PolicyType} from "@/types/policy";
import PolicyValueInput from '@/components/policy/PolicyValueInput';
import {isValidPolicyValue} from '@/utils/policyValueUtils';

/** enum API(PolicyCategoryType / PolicySubCategoryType / PolicyType) 응답 항목 */
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
  subCategories: PolicyEnumOption[];
  /** 현재 화면에서는 사용하지 않지만 상위(Policy.tsx)에서 전달합니다. */
  policies: PolicyEnumOption[];
  onRefresh: () => void;
}

const INITIAL_FORM: PolicyRegisterFormData = {categoryId: "", policyId: "", value: ""};

const PolicyRegisterModal = ({show, onHide, categories, subCategories, onRefresh}: PolicyRegisterModalProps) => {
  const [formData, setFormData] = useState<PolicyRegisterFormData>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPolicies, setFilteredPolicies] = useState<PolicyType[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  /** 정책 선택지를 좁히기 위한 서브 카테고리 필터 (등록 요청에는 포함되지 않음) */
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  /** 마지막으로 등록에 성공한 카테고리. 같은 카테고리에 연속 등록할 수 있도록 다음 오픈 시 유지합니다. */
  const lastRegisteredCategoryRef = useRef("");
  /** 정책 목록 로드 요청 순번 (늦게 도착한 이전 응답 무시용) */
  const loadRequestIdRef = useRef(0);

  /** 카테고리를 지정하고 정책/값을 초기화한 뒤 해당 카테고리의 정책 목록을 로드 */
  const applyCategory = (categoryId: string) => {
    setFormData({...INITIAL_FORM, categoryId});
    setSelectedSubCategory("");
    if (categoryId) {
      loadPolicies(categoryId);
    } else {
      // 진행 중인 로드 응답이 반영되지 않도록 순번만 증가
      loadRequestIdRef.current++;
      setIsLoadingPolicies(false);
      setFilteredPolicies([]);
    }
  };

  useEffect(() => {
    if (show) {
      // 모달이 열릴 때 폼 초기화 (직전에 등록한 카테고리는 유지)
      applyCategory(lastRegisteredCategoryRef.current);
    }
  }, [show]);

  /** 등록 가능한 정책 타입 중 아직 등록되지 않은 것만 로드 */
  const loadPolicies = async (categoryId: string) => {
    const requestId = ++loadRequestIdRef.current;
    setIsLoadingPolicies(true);
    setFilteredPolicies([]);
    try {
      const [typeResponse, registeredPolicies] = await Promise.all([
        policyApi.listPolicyTypes(categoryId),
        policyApi.listAllPolicies(categoryId)
      ]);
      // 카테고리를 빠르게 바꾼 경우 이전 요청 응답은 무시
      if (requestId !== loadRequestIdRef.current) {
        return;
      }
      if (!typeResponse.ok || !registeredPolicies) {
        toast.error("정책 목록을 불러오지 못했습니다.");
        return;
      }

      const registeredIds = new Set(registeredPolicies.map(policy => policy.policyId));
      setFilteredPolicies((typeResponse.data?.contents || []).filter(type => !registeredIds.has(type.policyId)));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoadingPolicies(false);
      }
    }
  };

  const handleChange = <K extends keyof PolicyRegisterFormData>(field: K, value: PolicyRegisterFormData[K]) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    // 등록 가능한 정책 타입에 실제로 존재하는 서브 카테고리만 필터 옵션으로 노출
  const subCategoryOptions = useMemo(() => {
    const keys = new Set(filteredPolicies.map(policy => policy.subCategory).filter(Boolean));
    // enum 순서를 유지하고, enum에 없는 값은 key 그대로 뒤에 붙임
    const known = subCategories.filter(subCategory => keys.has(subCategory.key));
    const unknown = [...keys]
      .filter(key => !subCategories.some(subCategory => subCategory.key === key))
      .map(key => ({key, description: key}));
    return [...known, ...unknown];
  }, [filteredPolicies, subCategories]);

  const displayedPolicies = useMemo(
    () => selectedSubCategory
      ? filteredPolicies.filter(policy => policy.subCategory === selectedSubCategory)
      : filteredPolicies,
    [filteredPolicies, selectedSubCategory]
  );

  const handleSubCategoryChange = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    // 선택된 정책이 필터 결과에서 빠지면 정책/값 초기화
    const isStillVisible = !subCategory || filteredPolicies.some(
      policy => policy.policyId === formData.policyId && policy.subCategory === subCategory
    );
    if (!isStillVisible) {
      setFormData(prev => ({...prev, policyId: "", value: ""}));
    }
  };

  const selectedPolicy = filteredPolicies.find(policy => policy.policyId === formData.policyId);
    if (!isValidPolicyValue(formData.value.trim(), selectedPolicy?.valueType)) {
      toast.error('선택한 정책 값 형식이 올바르지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await policyApi.createPolicy({
        policyId: formData.policyId,
        value: formData.value.trim()
      });

      if (response.ok) {
        toast.success("정책이 성공적으로 등록되었습니다.");
        lastRegisteredCategoryRef.current = formData.categoryId;
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
      return "이 카테고리에는 등록 가능한 정책이 없습니다. (모두 등록됨)";
    }
    return "선택한 카테고리에서 아직 등록되지 않은 정책만 표시됩니다.";
  };

  // 등록 가능한 정책 타입에 실제로 존재하는 서브 카테고리만 필터 옵션으로 노출
  const subCategoryOptions = useMemo(() => {
    const keys = new Set(filteredPolicies.map(policy => policy.subCategory).filter(Boolean));
    // enum 순서를 유지하고, enum에 없는 값은 key 그대로 뒤에 붙임
    const known = subCategories.filter(subCategory => keys.has(subCategory.key));
    const unknown = [...keys]
      .filter(key => !subCategories.some(subCategory => subCategory.key === key))
      .map(key => ({key, description: key}));
    return [...known, ...unknown];
  }, [filteredPolicies, subCategories]);

  const displayedPolicies = useMemo(
    () => selectedSubCategory
      ? filteredPolicies.filter(policy => policy.subCategory === selectedSubCategory)
      : filteredPolicies,
    [filteredPolicies, selectedSubCategory]
  );

  const handleSubCategoryChange = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    // 선택된 정책이 필터 결과에서 빠지면 정책/값 초기화
    const isStillVisible = !subCategory || filteredPolicies.some(
      policy => policy.policyId === formData.policyId && policy.subCategory === subCategory
    );
    if (!isStillVisible) {
      setFormData(prev => ({...prev, policyId: "", value: ""}));
    }
  };

  const selectedPolicy = filteredPolicies.find(policy => policy.policyId === formData.policyId);
  const isSubmittable = formData.categoryId && formData.policyId
    && isValidPolicyValue(formData.value.trim(), selectedPolicy?.valueType);

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
              onChange={(e) => applyCategory(e.target.value)}
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

          {subCategoryOptions.length > 0 && (
            <Form.Group className="col-12">
              <Form.Label htmlFor="new-policy-sub-category">서브 카테고리</Form.Label>
              <Form.Select
                id="new-policy-sub-category"
                value={selectedSubCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={isLoading || isLoadingPolicies}
              >
                <option value="">전체 서브 카테고리</option>
                {subCategoryOptions.map((subCategory) => (
                  <option key={subCategory.key} value={subCategory.key}>
                    {subCategory.description}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

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
              onChange={(e) => setFormData(prev => ({...prev, policyId: e.target.value, value: ''}))}
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
              {displayedPolicies.map((policy) => (
                <option key={policy.policyId} value={policy.policyId}>
                  {policy.description} ({policy.valueType})
                </option>
              ))}
            </Form.Select>
            <Form.Text>{getPolicyHelpText()}</Form.Text>
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label htmlFor="new-policy-value">
              값 <span className="text-danger">*</span>
            </Form.Label>
            <PolicyValueInput
              id="new-policy-value"
              value={formData.value}
              valueType={selectedPolicy?.valueType}
              onChange={(value) => handleChange('value', value)}
              disabled={isLoading}
            />
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
