import React, {useState, useEffect} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import policyApi from "../../api/policyApi";

const PolicyRegisterModal = ({show, onHide, categories, policies, onRefresh}) => {
  const [formData, setFormData] = useState({
    categoryId: "",
    policyId: "",
    value: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);

  useEffect(() => {
    if (show) {
      // 모달이 열릴 때 폼 초기화
      setFormData({
        categoryId: "",
        policyId: "",
        value: ""
      });
      // 정책 목록 초기화 (카테고리 선택 전까지는 빈 상태)
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

  const loadPolicies = async (categoryId) => {
    setIsLoadingPolicies(true);
    try {
      const response = await policyApi.listPolicyTypes(categoryId);
      if (response.data) {
        setFilteredPolicies(response.data.contents || []);
      } else {
        setFilteredPolicies([]);
      }
    } catch (error) {
      console.error("정책 조회 실패:", error);
      setFilteredPolicies([]);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.categoryId) {
      toast.error("❌ 카테고리를 먼저 선택해주세요.");
      return;
    }
    if (!formData.policyId) {
      toast.error("❌ 정책을 선택해주세요.");
      return;
    }
    if (!formData.value.trim()) {
      toast.error("값을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await policyApi.createPolicy({
        policyId: formData.policyId,
        value: formData.value.trim()
      });

      if (response.data) {
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

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered fullscreen="md-down"
           backdrop={isLoading ? "static" : true}>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          ➕ 신규 정책 등록
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div className="row mb-3">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>카테고리 <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  required
                  isInvalid={!formData.categoryId && formData.categoryId !== ""}
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.filter(cat => cat.key !== "").map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.description}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  카테고리를 선택해주세요.
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-12 col-md-6">
              <Form.Group>
                <Form.Label>
                  정책 <span className="text-danger">*</span>
                  {isLoadingPolicies && (
                    <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                  )}
                </Form.Label>
                <Form.Select
                  value={formData.policyId}
                  onChange={(e) => handleChange("policyId", e.target.value)}
                  required
                  disabled={isLoadingPolicies || !formData.categoryId}
                  isInvalid={!formData.policyId && formData.policyId !== ""}
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
                <Form.Control.Feedback type="invalid">
                  정책을 선택해주세요.
                </Form.Control.Feedback>
                {!formData.categoryId ? (
                  <Form.Text className="text-warning">
                    ⚠️ 카테고리를 먼저 선택해주세요.
                  </Form.Text>
                ) : formData.categoryId && filteredPolicies.length > 0 ? (
                  <Form.Text className="text-muted">
                    선택된 카테고리에 맞는 정책들이 표시됩니다.
                  </Form.Text>
                ) : formData.categoryId && filteredPolicies.length === 0 && !isLoadingPolicies ? (
                  <Form.Text className="text-info">
                    💡 이 카테고리에는 사용 가능한 정책이 없습니다.
                  </Form.Text>
                ) : null}
              </Form.Group>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-12">
              <Form.Group>
                <Form.Label>값 <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  placeholder="정책 값을 입력하세요"
                  required
                  isInvalid={!formData.value.trim() && formData.value !== ""}
                />
                <Form.Control.Feedback type="invalid">
                  값을 입력해주세요.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  정책에 적용될 구체적인 값을 입력하세요.
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          {/* 입력 미리보기 */}
          <div className="bg-light p-3 rounded mb-3">
            <h6 className="mb-2">입력 정보 미리보기</h6>
            <div className="row">
              <div className="col-12 col-md-6 mb-2 mb-md-0">
                <small className="text-muted">카테고리:</small>
                <div className="fw-bold">
                  {formData.categoryId ?
                    categories.find(cat => cat.key === formData.categoryId)?.description || formData.categoryId
                    : "-"
                  }
                </div>
              </div>
              <div className="col-12 col-md-6">
                <small className="text-muted">정책:</small>
                <div className="fw-bold">
                  {!formData.categoryId
                    ? "카테고리 선택 필요"
                    : formData.policyId
                      ? filteredPolicies.find(policy => policy.policyId === formData.policyId)?.description || formData.policyId
                      : "-"
                  }
                </div>
              </div>
            </div>
            <div className="mt-2">
              <small className="text-muted">값:</small>
              <div className="fw-bold">{formData.value || "-"}</div>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isLoading}
          className="w-100 w-sm-auto"
        >
          취소
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={isLoading || !formData.categoryId || !formData.policyId || !formData.value.trim()}
          className="w-100 w-sm-auto"
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              등록 중...
            </>
          ) : (
            "등록"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PolicyRegisterModal;
