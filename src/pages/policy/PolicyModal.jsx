import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import policyApi from "../../api/policyApi";
import {formatDateTime} from "../../utils/dateUtils";

const PolicyModal = ({show, onHide, policy, categories, policies, onRefresh, onDelete}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    value: ""
  });
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (policy) {
      const data = {
        value: policy.value || ""
      };
      setFormData(data);
      setOriginalData(data);
      setIsEditMode(false);
    }
  }, [policy]);

  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

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

      if (response.data) {
        toast.success("정책이 수정되었습니다.");
        setIsEditMode(false);
        setOriginalData(formData);
        onRefresh(); // 목록 새로고침
        onHide(); // 모달 닫기
      } else {
        toast.error("정책 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("정책 수정 실패:", error);
      toast.error("정책 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    onDelete(policy.policyId);
  };

  if (!policy) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          {isEditMode ? "정책 수정" : "정책 상세 정보"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div className="row mb-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>정책 ID</Form.Label>
                <Form.Control 
                  type="text" 
                  value={policy.policyId} 
                  disabled 
                  className="bg-light"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>값 <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={isEditMode ? formData.value : policy.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  disabled={!isEditMode}
                  className={!isEditMode ? "bg-light" : ""}
                  required
                  placeholder="정책 값을 입력하세요"
                />
                {isEditMode && (
                  <Form.Text className="text-muted">
                    정책에 적용될 새로운 값을 입력하세요.
                  </Form.Text>
                )}
              </Form.Group>
            </div>
          </div>

          {!isEditMode && (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>등록일</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={formatDateTime(policy.createdAt)} 
                      disabled 
                      className="bg-light"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>수정일</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={formatDateTime(policy.updatedAt)} 
                      disabled 
                      className="bg-light"
                    />
                  </Form.Group>
                </div>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {isEditMode ? (
          <>
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button 
              variant="success" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "저장중..." : "저장"}
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              className="me-auto"
            >
              🗑️ 삭제
            </Button>
            <Button 
              variant="secondary" 
              onClick={onHide}
            >
              닫기
            </Button>
            <Button 
              variant="primary" 
              onClick={handleEdit}
            >
              ✏️ 수정
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PolicyModal; 