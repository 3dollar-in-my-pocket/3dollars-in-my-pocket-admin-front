import {useEffect, useState} from 'react';
import AdminRegisterModal from './AdminRegisterModal';
import adminApi from '@/api/adminApi';
import {toast} from 'react-toastify';
import {AdminRole} from '@/types/admin';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import DataTable from '@/components/common/DataTable';

import {formatDateTimeNumeric as formatDate} from '@/utils/dateUtils';

/** 페이지네이션에 한 번에 노출할 최대 페이지 번호 개수 */
const PAGE_WINDOW = 5;

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // 인라인 편집 상태 관리
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'role' | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const pageSize = 10;

  const fetchAdmins = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getAdmins({size: pageSize, page});
      if (response.ok) {
        setAdmins(response.data.contents);
        setTotalPages(response.data.page.totalPage);
        setTotalSize(response.data.page.totalSize);
        setCurrentPage(page);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isLoading) {
      fetchAdmins(page);
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    fetchAdmins(1);
  };

  // 인라인 편집 시작
  const startEditing = (adminId: string, field: 'name' | 'role', currentValue: string) => {
    setEditingId(adminId);
    setEditingField(field);
    setEditingValue(currentValue);
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditingId(null);
    setEditingField(null);
    setEditingValue('');
  };

  // 편집 저장
  const saveEdit = async () => {
    if (!editingId || !editingField || !editingValue.trim()) return;

    setIsUpdating(true);
    try {
      const updateData: any = {};
      updateData[editingField] = editingField === 'role' ? editingValue as AdminRole : editingValue.trim();

      const response = await adminApi.updateAdmin(editingId, updateData);
      if (response?.ok) {
        toast.success('관리자 정보가 성공적으로 수정되었습니다.');
        fetchAdmins(currentPage);
        cancelEditing();
      }
    } catch (error) {
      console.error('관리자 정보 수정 실패:', error);
      toast.error('관리자 정보 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
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

  const getRoleBadgeClass = (role: AdminRole) => {
    switch (role) {
      case AdminRole.OWNER:
        return 'text-bg-danger';
      case AdminRole.OPERATOR:
        return 'text-bg-primary';
      case AdminRole.VIEWER:
        return 'text-bg-secondary';
      default:
        return 'text-bg-secondary';
    }
  };

  /** 현재 페이지 주변 번호만 노출 (전체 페이지를 모두 그리지 않도록) */
  const getVisiblePages = () => {
    const half = Math.floor(PAGE_WINDOW / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + PAGE_WINDOW - 1);
    start = Math.max(1, end - PAGE_WINDOW + 1);

    return Array.from({length: end - start + 1}, (_, i) => start + i);
  };

  /** 이름/역할 편집 확정·취소 버튼 */
  const renderEditActions = (disableSave = false) => (
    <>
      <button
        className="btn btn-primary btn-sm"
        onClick={saveEdit}
        disabled={isUpdating || disableSave}
        title="저장"
      >
        <i className="bi bi-check-lg"/>
      </button>
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={cancelEditing}
        disabled={isUpdating}
        title="취소"
      >
        <i className="bi bi-x-lg"/>
      </button>
    </>
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="py-5">
          <Loading/>
        </div>
      );
    }

    if (admins.length === 0) {
      return (
        <EmptyState
          icon="bi-people"
          title="등록된 관리자가 없습니다"
          description="신규 관리자를 등록해보세요."
        />
      );
    }

    return (
      <DataTable>
        <thead>
        <tr>
          <th style={{width: '56px'}} className="text-center">#</th>
          <th>관리자 ID</th>
          <th>이메일</th>
          <th style={{width: '220px'}}>이름</th>
          <th style={{width: '200px'}} className="text-center">역할</th>
          <th style={{width: '150px'}} className="text-center">생성일</th>
          <th style={{width: '150px'}} className="text-center">수정일</th>
        </tr>
        </thead>
        <tbody>
        {admins.map((admin, index) => (
          <tr key={admin.adminId}>
            <td className="text-center text-body-tertiary">
              {(currentPage - 1) * pageSize + index + 1}
            </td>
            <td className="fw-semibold">{admin.adminId}</td>
            <td className="text-body-secondary">{admin.email}</td>
            <td>
              {editingId === admin.adminId && editingField === 'name' ? (
                <div className="d-flex align-items-center gap-1">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="form-control form-control-sm"
                    autoFocus
                    disabled={isUpdating}
                  />
                  {renderEditActions(!editingValue.trim())}
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="fw-medium">{admin.name}</span>
                  <button
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => startEditing(admin.adminId, 'name', admin.name)}
                    disabled={editingId !== null}
                    title="이름 수정"
                  >
                    <i className="bi bi-pencil"/>
                  </button>
                </div>
              )}
            </td>
            <td>
              {editingId === admin.adminId && editingField === 'role' ? (
                <div className="d-flex align-items-center gap-1">
                  <select
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="form-select form-select-sm"
                    disabled={isUpdating}
                  >
                    {Object.values(AdminRole).map(role => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
                  {renderEditActions()}
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <span className={`badge ${getRoleBadgeClass(admin.role)}`}>
                    {getRoleDisplayName(admin.role)}
                  </span>
                  <button
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => startEditing(admin.adminId, 'role', admin.role)}
                    disabled={editingId !== null}
                    title="역할 수정"
                  >
                    <i className="bi bi-pencil"/>
                  </button>
                </div>
              )}
            </td>
            <td className="text-center text-body-tertiary num">
              {formatDate(admin.createdAt)}
            </td>
            <td className="text-center text-body-tertiary num">
              {formatDate(admin.updatedAt)}
            </td>
          </tr>
        ))}
        </tbody>
      </DataTable>
    );
  };

  return (
    <div>
      <PageHeader
        description="어드민 콘솔에 접근할 수 있는 관리자 계정과 권한을 관리합니다. 이름과 역할은 표에서 바로 수정할 수 있습니다."
        actions={
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
            <i className="bi bi-person-plus me-1"/>
            신규 관리자 등록
          </button>
        }
      />

      <SectionCard
        title="관리자 목록"
        icon="bi-people-fill"
        aside={!isLoading && <span className="page-count">총 {totalSize}명</span>}
        flush
      >
        {renderBody()}
      </SectionCard>

      {totalPages > 1 && (
        <div className="page-pager">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            aria-label="이전 페이지"
          >
            <i className="bi bi-chevron-left"/>
          </button>

          {getVisiblePages().map(page => (
            <button
              key={page}
              className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            aria-label="다음 페이지"
          >
            <i className="bi bi-chevron-right"/>
          </button>

          <span className="page-pager__status ms-2">
            {currentPage} / {totalPages}
          </span>
        </div>
      )}

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
