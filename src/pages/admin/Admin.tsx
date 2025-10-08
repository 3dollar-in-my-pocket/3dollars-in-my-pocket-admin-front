import { useState, useEffect } from 'react';
import AdminRegisterModal from './AdminRegisterModal';
import adminApi from '../../api/adminApi';
import { toast } from 'react-toastify';

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const pageSize = 10;

  const fetchAdmins = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getAdmins({ size: pageSize, page });
      if (response.ok) {
        setAdmins(response.data.contents);
        setTotalPages(response.data.page.totalPage);
        setTotalSize(response.data.page.totalSize);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error('관리자 목록을 불러오는 중 오류가 발생했습니다.');
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(1);
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchAdmins(page);
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    fetchAdmins(1);
    toast.success('관리자가 성공적으로 등록되었습니다.');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2 className="fw-bold">👥 관리자 관리</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowRegisterModal(true)}
        >
          <i className="bi bi-person-plus me-2"></i>
          신규 관리자 등록
        </button>
      </div>

      {/* 관리자 목록 */}
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-white border-0 p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary rounded-circle p-2">
                <i className="bi bi-people-fill text-white"></i>
              </div>
              <h4 className="mb-0 fw-bold text-dark">관리자 목록</h4>
            </div>
            <div className="text-muted">
              총 {totalSize}명
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <h5 className="text-dark mb-1">불러오는 중입니다</h5>
              <p className="text-muted">잠시만 기다려주세요...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div className="mb-4">
                <div className="bg-light rounded-circle mx-auto" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-people fs-1 text-secondary"></i>
                </div>
              </div>
              <h5 className="text-dark mb-2">등록된 관리자가 없습니다</h5>
              <p className="text-muted">신규 관리자를 등록해보세요.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-center">#</th>
                    <th className="px-4 py-3">관리자 ID</th>
                    <th className="px-4 py-3">이메일</th>
                    <th className="px-4 py-3">이름</th>
                    <th className="px-4 py-3 text-center">생성일</th>
                    <th className="px-4 py-3 text-center">수정일</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, index) => (
                    <tr key={admin.adminId}>
                      <td className="px-4 py-3 text-center text-muted">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-person text-primary"></i>
                          </div>
                          <span className="fw-bold text-dark">{admin.adminId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-envelope text-muted"></i>
                          <span className="text-dark">{admin.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="fw-medium text-dark">{admin.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-muted">
                        <small>{formatDate(admin.createdAt)}</small>
                      </td>
                      <td className="px-4 py-3 text-center text-muted">
                        <small>{formatDate(admin.updatedAt)}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-0 p-4">
            <nav>
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* 신규 관리자 등록 모달 */}
      <AdminRegisterModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

export default Admin;