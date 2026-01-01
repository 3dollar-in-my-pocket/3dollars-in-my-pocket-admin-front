import {Modal} from "react-bootstrap";
import {useState} from "react";
import adminApi from "../../api/adminApi";
import {toast} from "react-toastify";

const AdminRegisterModal = ({show, onHide, onSuccess}: any) => {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수 입력 항목입니다.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수 입력 항목입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 에러 메시지 실시간 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await adminApi.createAdmin({
        email: formData.email.trim(),
        name: formData.name.trim()
      });

      if (response.ok) {
        onSuccess();
        setFormData({email: '', name: ''});
        setErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({email: '', name: ''});
      setErrors({});
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-person-plus me-2 text-primary"></i>
          신규 관리자 등록
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <div className="mb-4">
            <label className="form-label fw-semibold text-dark mb-2">
              <i className="bi bi-envelope me-2 text-primary"></i>
              이메일 <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
              placeholder="admin@example.com"
              disabled={isSubmitting}
              style={{borderRadius: '8px'}}
            />
            {errors.email && (
              <div className="invalid-feedback">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.email}
              </div>
            )}
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
              style={{borderRadius: '8px'}}
            />
            {errors.name && (
              <div className="invalid-feedback">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.name}
              </div>
            )}
          </div>

          <div className="bg-light rounded p-3 mt-4">
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-info-circle me-2"></i>
              <small>
                등록된 관리자는 관리자 권한으로 시스템에 접근할 수 있습니다.
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
              style={{borderRadius: '8px'}}
            >
              <i className="bi bi-x-lg me-1"></i>
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-fill py-2"
              disabled={isSubmitting || !formData.email.trim() || !formData.name.trim()}
              style={{borderRadius: '8px'}}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  등록 중...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-1"></i>
                  등록하기
                </>
              )}
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AdminRegisterModal;
