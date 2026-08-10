import {Modal} from "react-bootstrap";
import adminApi from "@/api/adminApi";
import {toast} from "react-toastify";
import useModalForm from "@/hooks/useModalForm";
import {AdminRole} from "@/types/admin";
import {useNonce} from "@/hooks/useNonce";
import {useEffect} from "react";

interface AdminFormData {
  email: string;
  name: string;
  role: AdminRole;
}

interface AdminRegisterModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AdminRegisterModal = ({show, onHide, onSuccess}: AdminRegisterModalProps) => {
  const {nonce, issueNonce, clearNonce} = useNonce();

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm
  } = useModalForm<AdminFormData>({
    initialValues: {
      email: '',
      name: '',
      role: AdminRole.OPERATOR
    },
    validate: (values) => {
      const errors: any = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!values.email.trim()) {
        errors.email = '이메일은 필수 입력 항목입니다.';
      } else if (!emailRegex.test(values.email)) {
        errors.email = '올바른 이메일 형식을 입력해주세요.';
      }

      if (!values.name.trim()) {
        errors.name = '이름은 필수 입력 항목입니다.';
      }

      if (!values.role) {
        errors.role = '역할을 선택해주세요.';
      }

      return errors;
    },
    onSubmit: async (values) => {
      if (!nonce) throw new Error("Nonce 토큰이 없습니다.");
      return await adminApi.createAdmin({
        email: values.email.trim(),
        name: values.name.trim(),
        role: values.role
      }, nonce);
    },
    onSuccess: () => {
      toast.success('관리자가 성공적으로 등록되었습니다.');
      onSuccess();
      onHide();
    }
  });

  // nonce 발급 관리
  useEffect(() => {
    if (show) {
      issueNonce();
    } else {
      clearNonce();
    }
  }, [show, issueNonce, clearNonce]);

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
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="app-modal"
      backdrop={isSubmitting ? "static" : true}
    >
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title as="h2">
          <i className="bi bi-person-plus"/>
          신규 관리자 등록
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label" htmlFor="new-admin-email">
                이메일 <span className="text-danger">*</span>
              </label>
              <input
                id="new-admin-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="admin@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="new-admin-name">
                이름 <span className="text-danger">*</span>
              </label>
              <input
                id="new-admin-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="관리자 이름을 입력하세요"
                disabled={isSubmitting}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="new-admin-role">
                역할 <span className="text-danger">*</span>
              </label>
              <select
                id="new-admin-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                disabled={isSubmitting}
              >
                {Object.values(AdminRole).map(role => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
              <div className="form-text">{getRoleDescription(formData.role)}</div>
            </div>
          </div>

          <div className="page-note mt-3">
            <i className="bi bi-info-circle"/>
            <span>등록된 관리자는 부여된 역할의 권한으로 어드민 콘솔에 접근할 수 있습니다.</span>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.email.trim() || !formData.name.trim() || !formData.role}
          >
            {isSubmitting && (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
            )}
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AdminRegisterModal;
