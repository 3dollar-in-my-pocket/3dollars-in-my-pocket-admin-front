import {useEffect, useState} from "react";
import {Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import policyApi from "@/api/policyApi";
import {formatDateTime} from "@/utils/dateUtils";
import DetailField from "@/components/common/DetailField";
import {Policy} from "@/types/policy";

/** enum API(PolicyCategoryType / PolicyType) 응답 항목 */
interface PolicyEnumOption {
  key: string;
  description: string;
}

interface PolicyFormData {
  value: string;
}

interface PolicyModalProps {
  show: boolean;
  onHide: () => void;
  policy: Policy | null;
  categories: PolicyEnumOption[];
  policies: PolicyEnumOption[];
  onRefresh: () => void;
  onDelete: (policyId: string) => void;
}

const PolicyModal = ({show, onHide, policy, categories, policies, onRefresh, onDelete}: PolicyModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<PolicyFormData>({value: ""});
  const [originalData, setOriginalData] = useState<PolicyFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (policy) {
      const data = {value: policy.value || ""};
      setFormData(data);
      setOriginalData(data);
      setIsEditMode(false);
    }
  }, [policy]);

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!formData.value.trim()) {
      toast.error("값은 필수 항목입니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await policyApi.modifyPolicy({
        policyId: policy.policyId,
        value: formData.value.trim()
      });

      if (response.ok) {
        toast.success("정책이 수정되었습니다.");
        setIsEditMode(false);
        setOriginalData(formData);
        onRefresh(); // 목록 새로고침
        onHide(); // 모달 닫기
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!policy) return null;

  const getDescriptionFromKey = (key: string, type: "category" | "policy") => {
    if (type === "category") {
      return categories.find((cat) => cat.key === key)?.description || key;
    } else if (type === "policy") {
      return policies.find((pol) => pol.key === key)?.description || key;
    }
    return key;
  };

  return (
    <Modal
      show={show}
      onHide={isLoading ? undefined : onHide}
      centered
      className="app-modal"
      backdrop={isLoading ? "static" : true}
    >
      <Modal.Header closeButton={!isLoading}>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className={`bi ${isEditMode ? "bi-pencil-square" : "bi-shield-fill-check"}`}/>
            {isEditMode ? "정책 수정" : "정책 상세"}
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">{policy.policyId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* 기본 정보 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-info-circle"/>
            기본 정보
          </h3>

          <div className="row g-3">
            <DetailField label="카테고리" className="col-12 col-sm-6">
              {getDescriptionFromKey(policy.categoryId, "category")}
            </DetailField>
            <DetailField label="정책 ID" className="col-12 col-sm-6" monospace>
              {policy.policyId}
            </DetailField>
            <DetailField label="설명" className="col-12" placeholder="설명 없음">
              {policy.description}
            </DetailField>
          </div>
        </div>

        {/* 정책 값 */}
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-sliders"/>
            정책 값
          </h3>

          {isEditMode ? (
            <Form.Group>
              <Form.Label htmlFor="policy-value">
                값 <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="policy-value"
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({value: e.target.value})}
                placeholder="정책 값을 입력하세요"
                autoFocus
                disabled={isLoading}
              />
              <Form.Text>정책에 적용될 새로운 값을 입력하세요.</Form.Text>
            </Form.Group>
          ) : (
            <div className="detail-value-strong">{policy.value}</div>
          )}
        </div>

        {/* 일시 정보 */}
        {!isEditMode && (
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-clock-history"/>
              등록 · 수정 일시
            </h3>

            <div className="row g-3">
              <DetailField label="등록일" className="col-6">
                {formatDateTime(policy.createdAt)}
              </DetailField>
              <DetailField label="수정일" className="col-6">
                {formatDateTime(policy.updatedAt)}
              </DetailField>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {isEditMode ? (
          <>
            <button className="btn btn-outline-secondary" onClick={handleCancel} disabled={isLoading}>
              취소
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
              {isLoading && (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
              )}
              {isLoading ? "저장 중..." : "저장"}
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-outline-danger me-auto"
              onClick={() => onDelete(policy.policyId)}
            >
              <i className="bi bi-trash me-1"/>
              삭제
            </button>
            <button className="btn btn-outline-secondary" onClick={onHide}>
              닫기
            </button>
            <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>
              <i className="bi bi-pencil me-1"/>
              수정
            </button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PolicyModal;
