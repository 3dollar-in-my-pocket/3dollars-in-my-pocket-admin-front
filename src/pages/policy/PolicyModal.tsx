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

  const getDescriptionFromKey = (key, type) => {
    if (type === "category") {
      return categories.find((cat) => cat.key === key)?.description || key;
    } else if (type === "policy") {
      return policies.find((pol) => pol.key === key)?.description || key;
    }
    return key;
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen="lg-down">
      <Modal.Header closeButton className="border-0"
                    style={{
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      minHeight: '80px'
                    }}>
        <Modal.Title className="text-white d-flex align-items-center gap-3 w-100 justify-content-center">
          <div className="bg-white bg-opacity-20 rounded-circle p-3">
            <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-shield-check'} fs-4`}></i>
          </div>
          <div>
            <h3 className="mb-0 fw-bold">
              {isEditMode ? "정책 수정" : "정책 상세 정보"}
            </h3>
            <small className="text-white-75 opacity-75">ID: {policy.policyId}</small>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0" style={{backgroundColor: '#f8f9fa'}}>
        {/* 정책 기본 정보 섹션 */}
        <div className="bg-white border-bottom px-4 py-3">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-primary-subtle rounded-circle p-2 me-3">
              <i className="bi bi-info-circle text-primary fs-5"></i>
            </div>
            <h5 className="mb-0 text-primary fw-bold">정책 기본 정보</h5>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="bg-light rounded p-3">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-hash me-1"></i>정책 ID
                </small>
                <span className="fw-bold">{policy.policyId}</span>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="bg-light rounded p-3">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-folder me-1"></i>카테고리
                </small>
                <span className="fw-bold">{getDescriptionFromKey(policy.categoryId, "category")}</span>
              </div>
            </div>
            {policy.description && (
              <div className="col-12">
                <div className="border-start border-info border-3 ps-3">
                  <small className="text-muted d-block mb-1">
                    <i className="bi bi-file-text me-1"></i>설명
                  </small>
                  <p className="mb-0">{policy.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 정책 값 섹션 */}
        <div className="bg-white border-bottom px-4 py-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-success-subtle rounded-circle p-2 me-3">
              <i className="bi bi-gear text-success fs-5"></i>
            </div>
            <h5 className="mb-0 text-success fw-bold">정책 값 {isEditMode && "(수정 모드)"}</h5>
          </div>
          <div className="row">
            <div className="col-12">
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <i className="bi bi-sliders me-1"></i>
                  현재 값 {isEditMode && <span className="text-danger">*</span>}
                </Form.Label>
                {isEditMode ? (
                  <div>
                    <Form.Control
                      type="text"
                      value={formData.value}
                      onChange={(e) => handleChange("value", e.target.value)}
                      className="form-control-lg"
                      style={{borderRadius: '8px'}}
                      placeholder="정책 값을 입력하세요"
                    />
                    <Form.Text className="text-info">
                      <i className="bi bi-info-circle me-1"></i>
                      정책에 적용될 새로운 값을 입력하세요.
                    </Form.Text>
                  </div>
                ) : (
                  <div className="bg-light rounded p-4 border-start border-success border-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-check-circle text-success fs-5"></i>
                      <span className="fs-4 fw-bold text-dark">{policy.value}</span>
                    </div>
                  </div>
                )}
              </Form.Group>
            </div>
          </div>
        </div>

        {/* 일시 정보 섹션 */}
        {!isEditMode && (
          <div className="bg-white px-4 py-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-warning-subtle rounded-circle p-2 me-3">
                <i className="bi bi-clock text-warning fs-5"></i>
              </div>
              <h5 className="mb-0 text-warning fw-bold">생성 및 수정 일시</h5>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="bg-light rounded p-3 text-center">
                  <small className="text-muted d-block mb-1">
                    <i className="bi bi-plus-circle me-1"></i>등록일
                  </small>
                  <span className="fw-bold text-success">{formatDateTime(policy.createdAt)}</span>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="bg-light rounded p-3 text-center">
                  <small className="text-muted d-block mb-1">
                    <i className="bi bi-arrow-repeat me-1"></i>수정일
                  </small>
                  <span className="fw-bold text-info">{formatDateTime(policy.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 p-4" style={{background: 'linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="d-flex w-100 gap-3 flex-column flex-sm-row">
          {isEditMode ? (
            <>
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
                style={{
                  padding: '15px 24px',
                  borderRadius: '12px',
                  borderWidth: '2px'
                }}
              >
                <i className="bi bi-x-lg fs-5"></i>
                취소
              </Button>
              <Button
                variant="success"
                onClick={handleSave}
                disabled={isLoading}
                className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
                style={{
                  padding: '15px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  border: 'none'
                }}
              >
                <i className={`bi ${isLoading ? 'bi-arrow-repeat' : 'bi-check-lg'} fs-5 ${isLoading ? 'spinner-border spinner-border-sm' : ''}`}></i>
                {isLoading ? "저장중..." : "저장"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-danger"
                onClick={handleDelete}
                className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
                style={{
                  padding: '15px 24px',
                  borderRadius: '12px',
                  borderWidth: '2px'
                }}
              >
                <i className="bi bi-trash fs-5"></i>
                삭제
              </Button>
              <Button
                variant="outline-secondary"
                onClick={onHide}
                className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
                style={{
                  padding: '15px 24px',
                  borderRadius: '12px',
                  borderWidth: '2px'
                }}
              >
                <i className="bi bi-x-lg fs-5"></i>
                닫기
              </Button>
              <Button
                variant="primary"
                onClick={handleEdit}
                className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
                style={{
                  padding: '15px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <i className="bi bi-pencil fs-5"></i>
                수정
              </Button>
            </>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PolicyModal; 