import '../../styles/mobile-tabs.css';
import {useEffect, useState} from 'react';
import {Modal, Tab, Tabs} from 'react-bootstrap';
import {toast} from 'react-toastify';
import deviceApi from "@/api/deviceApi";
import enumApi from "@/api/enumApi";
import medalApi from '@/api/medalApi';
import userApi from '@/api/userApi';
import ActivityHistory from '@/components/ActivityHistory';
import UserReviewHistory from './detail/UserReviewHistory';
import UserStoreHistory from './detail/UserStoreHistory';
import UserStoreImageHistory from './detail/UserStoreImageHistory';
import UserStoreReportHistory from './detail/UserStoreReportHistory';
import UserVisitHistory from './detail/UserVisitHistory';
import UserBasicInfoTab from './detail/UserBasicInfoTab';
import UserDeviceTab from './detail/UserDeviceTab';
import UserMedalTab from './detail/UserMedalTab';
import PushSendModal from '@/components/push/PushSendModal';
import {Device} from '@/types/device';
import {Medal} from '@/types/medal';
import {User, UserRoleOption, UserSettings} from '@/types/user';
import {getUserRoleLabel} from '@/utils/display/userDisplay';

interface UserDetailModalProps {
  show: boolean;
  onHide: () => void;
  /**
   * 목록/이력에서 넘어온 유저 요약 정보 (상세 로딩 전 폴백).
   * 호출부마다 User, 랭킹/신고 응답의 유저 객체 등 형태가 달라 any로 둡니다.
   */
  user: any;
  /** 제보 가게 클릭 콜백. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: any) => void) | null;
}

const UserDetailModal = ({show, onHide, user, onStoreClick}: UserDetailModalProps) => {
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [representativeMedal, setRepresentativeMedal] = useState<Medal | null>(null);
  const [medals, setMedals] = useState<Medal[]>([]);
  const [allMedals, setAllMedals] = useState<Medal[]>([]);
  const [userRoleOptions, setUserRoleOptions] = useState<UserRoleOption[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);
  const [selectedMedalForAssign, setSelectedMedalForAssign] = useState<number | null>(null);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [isAssigningMedal, setIsAssigningMedal] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);

  useEffect(() => {
    if (show && user) {
      fetchUserDetail();
    }
  }, [show, user]);

  const fetchUserDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userResponse, devicesResponse, allMedalsResponse, enumResponse] = await Promise.all([
        userApi.getUserDetail(user.userId),
        deviceApi.getUserDevices(user.userId),
        medalApi.getMedals(),
        enumApi.getEnum()
      ]);

      if (!userResponse.ok) {
        setError('유저 정보를 불러오지 못했습니다.');
        return;
      }

      const userData = userResponse.data;

      setUserDetail(userData.user);
      setSelectedRole(userData.user?.role || '');
      setSettings(userData.setting);
      setRepresentativeMedal(userData.representativeMedal);
      setMedals(userData.medals || []);
      setUserRoleOptions(enumResponse?.data?.UserRole || []);

      if (devicesResponse.ok) {
        setDevices(devicesResponse.data || []);
      } else {
        setDevices([]);
      }

      if (allMedalsResponse.ok && allMedalsResponse.data) {
        setAllMedals(allMedalsResponse.data.contents);
      } else {
        setAllMedals([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserDetail(null);
    setDevices([]);
    setSettings(null);
    setRepresentativeMedal(null);
    setMedals([]);
    setAllMedals([]);
    setUserRoleOptions([]);
    setSelectedRole('');
    setSelectedMedalForAssign(null);
    setShowAssignConfirm(false);
    setActiveTab('basic');
    setError(null);
    onHide();
  };

  // 디바이스 삭제 핸들러
  const handleDeleteDevice = async (deviceId: string) => {
    if (!window.confirm('정말로 이 디바이스를 삭제하시겠습니까?')) return;
    setIsLoading(true);
    try {
      const response = await deviceApi.deleteDevice(deviceId);

      if (response.ok) {
        setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
        toast.success('디바이스가 성공적으로 삭제되었습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 메달 선택 핸들러
  const handleSelectMedal = (medalId: number) => {
    if (selectedMedalForAssign === medalId) {
      setSelectedMedalForAssign(null); // 같은 메달 클릭 시 선택 해제
    } else {
      setSelectedMedalForAssign(medalId); // 메달 선택
    }
  };

  // 메달 지급 확인 모달 열기
  const handleOpenAssignConfirm = () => {
    if (!selectedMedalForAssign) {
      toast.warning('지급할 메달을 선택해주세요.');
      return;
    }
    setShowAssignConfirm(true);
  };

  // 메달 지급 핸들러
  const handleAssignMedal = async () => {
    if (isAssigningMedal || !selectedMedalForAssign) return;

    setIsAssigningMedal(true);
    setShowAssignConfirm(false);

    try {
      const response = await medalApi.assignMedalToUsers(selectedMedalForAssign, [parseInt(user.userId)]);

      if (response.ok) {
        toast.success('메달이 지급되었습니다.');
        setSelectedMedalForAssign(null);
        await fetchUserDetail();
      }
    } finally {
      setIsAssigningMedal(false);
    }
  };

  // 푸시 발송 핸들러
  const handleSendPush = () => {
    setShowPushModal(true);
  };

  const handleUpdateRole = async () => {
    if (isUpdatingRole || !userDetail?.userId || !selectedRole || selectedRole === userDetail?.role) return;

    if (!window.confirm(`${userDetail.nickname}님의 권한을 ${getUserRoleLabel(selectedRole, userRoleOptions)}(으)로 변경하시겠습니까?`)) {
      return;
    }

    setIsUpdatingRole(true);
    try {
      const response = await userApi.updateUserRole(userDetail.userId, selectedRole);

      if (response?.ok) {
        const updatedUser = response.data;
        setUserDetail((prev) => ({
          ...prev,
          ...updatedUser,
          // 서버는 userId를 숫자로 내려주지만 화면에서는 문자열로 다룹니다.
          userId: updatedUser?.userId != null ? String(updatedUser.userId) : prev?.userId,
          // 서버 UserResponse에는 nickname이 없어 name을 닉네임으로 사용합니다.
          nickname: updatedUser?.name || prev?.nickname,
        }));
        setSelectedRole(updatedUser?.role || selectedRole);
        toast.success('유저 권한이 변경되었습니다.');
      }
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (!show || !user) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      centered
      className="user-detail-modal"
      fullscreen="md-down"
      style={{maxWidth: '98vw'}}
      dialogClassName="modal-95w"
    >
      <Modal.Header
        closeButton
        className="border-0 pb-0"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        <div className="w-100">
          <div className="d-flex align-items-center justify-content-between gap-3 text-white">
            <div>
              <Modal.Title className="mb-0 fs-4 fs-md-3 fw-bold">
                사용자 상세 정보
              </Modal.Title>
              <p className="mb-0 opacity-90 small">
                {user.nickname}님의 정보를 확인하세요
              </p>
            </div>
            <button
              className="btn btn-light btn-sm d-flex align-items-center gap-2"
              onClick={handleSendPush}
            >
              <i className="bi bi-send-fill"></i>
              <span className="d-none d-md-inline">푸시 발송</span>
            </button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">정보를 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요.</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">
            <div className="mb-4">
              <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
              </div>
            </div>
            <h5 className="text-dark mb-2">오류가 발생했습니다</h5>
            <p className="text-muted mb-3">{error}</p>
            <button
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => fetchUserDetail()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              다시 시도
            </button>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="nav-fill border-0 mobile-optimized-tabs"
            style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              overflowX: 'auto',
              flexWrap: 'nowrap'
            }}
          >
            {/* 기본 정보 탭 */}
            <Tab
              eventKey="basic"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2 px-1 py-2" style={{
                  fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}>
                  <i className="bi bi-person-vcard" style={{fontSize: '0.9rem'}}></i>
                  <span className="d-none d-sm-inline fw-medium">기본 정보</span>
                  <span className="d-sm-none fw-medium">기본</span>
                </span>
              }
            >
              <UserBasicInfoTab
                userDetail={userDetail}
                settings={settings}
                userRoleOptions={userRoleOptions}
                selectedRole={selectedRole}
                isUpdatingRole={isUpdatingRole}
                onSelectedRoleChange={setSelectedRole}
                onUpdateRole={handleUpdateRole}
              />
            </Tab>

            {/* 디바이스 정보 탭 */}
            <Tab
              eventKey="devices"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2 px-1 py-2" style={{
                  fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}>
                  <i className="bi bi-phone" style={{fontSize: '0.9rem'}}></i>
                  <span className="d-none d-sm-inline fw-medium">디바이스 정보</span>
                  <span className="d-sm-none fw-medium">기기</span>
                  {devices.length > 0 && (
                    <span className="badge bg-info rounded-pill ms-1" style={{
                      fontSize: '0.7rem',
                      minWidth: '1.2rem',
                      height: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>{devices.length}</span>
                  )}
                </span>
              }
            >
              <UserDeviceTab
                devices={devices}
                isLoading={isLoading}
                onDeleteDevice={handleDeleteDevice}
              />
            </Tab>

            {/* 메달 정보 탭 */}
            <Tab
              eventKey="medals"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2 px-1 py-2" style={{
                  fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}>
                  <i className="bi bi-award" style={{fontSize: '0.9rem'}}></i>
                  <span className="d-none d-sm-inline fw-medium">메달 정보</span>
                  <span className="d-sm-none fw-medium">메달</span>
                  {medals.length > 0 && (
                    <span className="badge bg-warning rounded-pill ms-1" style={{
                      fontSize: '0.7rem',
                      minWidth: '1.2rem',
                      height: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>{medals.length}</span>
                  )}
                </span>
              }
            >
              <UserMedalTab
                medals={medals}
                allMedals={allMedals}
                representativeMedal={representativeMedal}
                selectedMedalForAssign={selectedMedalForAssign}
                isAssigningMedal={isAssigningMedal}
                onSelectMedal={handleSelectMedal}
                onOpenAssignConfirm={handleOpenAssignConfirm}
              />
            </Tab>

            {/* 활동 이력 탭 */}
            <Tab
              eventKey="activity"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2 px-1 py-2" style={{
                  fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}>
                  <i className="bi bi-activity" style={{fontSize: '0.9rem'}}></i>
                  <span className="d-none d-sm-inline fw-medium">활동 이력</span>
                  <span className="d-sm-none fw-medium">활동</span>
                </span>
              }
            >
              <ActivityHistory
                type="user"
                entityId={user?.userId}
                onStoreClick={onStoreClick}
                tabs={[
                  {
                    key: 'stores',
                    title: '제보한 가게 목록',
                    icon: 'bi-shop',
                    component: UserStoreHistory,
                    spinnerColor: 'text-success',
                    loadingText: '데이터를 불러오는 중...'
                  },
                  {
                    key: 'reviews',
                    title: '리뷰 이력',
                    icon: 'bi-chat-square-text',
                    component: UserReviewHistory,
                    spinnerColor: 'text-primary',
                    loadingText: '리뷰 데이터를 불러오는 중...'
                  },
                  {
                    key: 'visits',
                    title: '방문 이력',
                    icon: 'bi-geo-alt',
                    component: UserVisitHistory,
                    spinnerColor: 'text-warning',
                    loadingText: '방문 이력을 불러오는 중...'
                  },
                  {
                    key: 'images',
                    title: '이미지 등록 이력',
                    icon: 'bi-image',
                    component: UserStoreImageHistory,
                    spinnerColor: 'text-info',
                    loadingText: '이미지 등록 이력을 불러오는 중...'
                  },
                  {
                    key: 'reports',
                    title: '가게 신고 이력',
                    icon: 'bi-shield-exclamation',
                    component: UserStoreReportHistory,
                    spinnerColor: 'text-danger',
                    loadingText: '신고 이력을 불러오는 중...'
                  }
                ]}
              />
            </Tab>
          </Tabs>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <button
          className="btn btn-secondary rounded-pill px-4"
          onClick={handleClose}
        >
          <i className="bi bi-x-lg me-2"></i>
          닫기
        </button>
      </Modal.Footer>

      {/* 메달 지급 확인 모달 */}
      <Modal show={showAssignConfirm} onHide={() => setShowAssignConfirm(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="bi bi-award-fill me-2 text-warning"></i>
            메달 지급 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {selectedMedalForAssign && (() => {
            const selectedMedal = allMedals.find(m => m.medalId === selectedMedalForAssign);
            return selectedMedal ? (
              <div className="text-center">
                <div className="mb-4">
                  <img
                    src={selectedMedal.iconUrl}
                    alt={selectedMedal.name}
                    className="rounded-circle mb-3"
                    style={{width: '80px', height: '80px', objectFit: 'cover'}}
                  />
                  <h5 className="fw-bold text-dark mb-2">{selectedMedal.name}</h5>
                  <p className="text-muted mb-0">{selectedMedal.introduction}</p>
                </div>
                <div className="alert alert-warning d-flex align-items-center mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div className="text-start">
                    <strong>{user.nickname}</strong>님에게 이 메달을 지급하시겠습니까?
                    <div className="small text-muted mt-1">지급 후 취소할 수 없습니다.</div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button
            className="btn btn-secondary"
            onClick={() => setShowAssignConfirm(false)}
            disabled={isAssigningMedal}
          >
            취소
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAssignMedal}
            disabled={isAssigningMedal}
          >
            {isAssigningMedal ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                지급 중...
              </>
            ) : (
              <>
                <i className="bi bi-award-fill me-2"></i>
                메달 지급하기
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 푸시 발송 모달 */}
      <PushSendModal
        show={showPushModal}
        onHide={() => setShowPushModal(false)}
        initialUserIds={[parseInt(user.userId)]}
      />
    </Modal>
  );
};

export default UserDetailModal;
