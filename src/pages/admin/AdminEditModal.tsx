import { Modal } from "react-bootstrap";
import adminApi from "../../api/adminApi";
import { toast } from "react-toastify";
import useModalForm from "../../hooks/useModalForm";
import { AdminRole, Admin as AdminType } from "../../types/admin";
import { useEffect } from "react";

interface AdminEditFormData {
  name: string;
  role: AdminRole;
}

interface AdminEditModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  selectedAdmin: AdminType | null;
}

const AdminEditModal = ({ show, onHide, onSuccess, selectedAdmin }: AdminEditModalProps) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData
  } = useModalForm<AdminEditFormData>({
    initialValues: {
      name: '',
      role: AdminRole.OPERATOR
    },
    validate: (values) => {
      const errors: any = {};

      if (!values.name.trim()) {
        errors.name = '이름은 필수 입력 항목입니다.';
      }

      if (!values.role) {
        errors.role = '역할을 선택해주세요.';
      }

      return errors;
    },
    onSubmit: async (values) => {
      if (!selectedAdmin) throw new Error("수정할 관리자를 선택해주세요.");

      // 변경된 필드만 전송 (부분 업데이트)
      const updateData: any = {};
      if (values.name.trim() !== selectedAdmin.name) {
        updateData.name = values.name.trim();
      }
      if (values.role !== selectedAdmin.role) {
        updateData.role = values.role;
      }

      // 변경사항이 없으면 에러
      if (Object.keys(updateData).length === 0) {
        throw new Error("변경된 내용이 없습니다.");
      }

      return await adminApi.updateAdmin(selectedAdmin.adminId, updateData);
    },
    onSuccess: () => {
      toast.success('관리자 정보가 성공적으로 수정되었습니다.');
      onSuccess();
      onHide();
    }
  });

  // selectedAdmin이 변경되면 폼 데이터 초기화
  useEffect(() => {
    if (show && selectedAdmin) {
      setFormData({
        name: selectedAdmin.name || '',
        role: selectedAdmin.role || AdminRole.OPERATOR
      });
    }
  }, [show, selectedAdmin?.adminId]); // adminId로 의존성을 제한

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onHide();
    }
  };

  const getRoleDisplayName = (role: AdminRole) => {
    switch (role) {
      case AdminRole.OWNER:
        return '소유자';
      case AdminRole.OPERATOR:
        return '서비스 운영자';
      case AdminRole.VIEWER:
        return '뷰어';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: AdminRole) => {
    switch (role) {
      case AdminRole.OWNER:
        return '모든 권한을 가진 소유자';
      case AdminRole.OPERATOR:
        return '일반적인 관리 권한을 가진 서비스 운영자';
      case AdminRole.VIEWER:
        return '읽기 전용 권한을 가진 뷰어';
      default:
        return '';
    }
  };


  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-person-gear me-2 text-warning"></i>
          관리자 정보 수정
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <div className="mb-4">
            <label className="form-label fw-semibold text-dark mb-2">
              <i className="bi bi-envelope me-2 text-muted"></i>
              이메일
            </label>
            <input
              type="email"
              value={selectedAdmin?.email || ''}
              className="form-control form-control-lg bg-light"
              disabled
              style={{ borderRadius: '8px' }}
            />
            <small className="text-muted">이메일은 수정할 수 없습니다.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark mb-2">
              <i className="bi bi-person me-2 text-success"></i>
              이름 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
              placeholder="관리자 이름을 입력하세요"
              disabled={isSubmitting}
              style={{ borderRadius: '8px' }}
            />
            {errors.name && (
              <div className="invalid-feedback">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.name}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark mb-2">
              <i className="bi bi-shield-check me-2 text-warning"></i>
              역할 <span className="text-danger">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`form-select form-select-lg ${errors.role ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
              style={{ borderRadius: '8px' }}
            >
              {Object.values(AdminRole).map(role => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)} - {getRoleDescription(role)}
                </option>
              ))}
            </select>
            {errors.role && (
              <div className="invalid-feedback">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.role}
              </div>
            )}
          </div>

          <div className="bg-light rounded p-3 mt-4">
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-info-circle me-2"></i>
              <small>
                변경된 권한은 다음 로그인 시부터 적용됩니다.
              </small>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <div className="w-100 d-flex gap-2">
            <button
              type="button"
              className="btn btn-light flex-fill py-2"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{ borderRadius: '8px' }}
            >
              <i className="bi bi-x-lg me-1"></i>
              취소
            </button>
            <button
              type="submit"
              className="btn btn-warning flex-fill py-2"
              disabled={isSubmitting || !formData.name.trim() || !formData.role}
              style={{ borderRadius: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  수정 중...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-1"></i>
                  수정하기
                </>
              )}
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AdminEditModal;