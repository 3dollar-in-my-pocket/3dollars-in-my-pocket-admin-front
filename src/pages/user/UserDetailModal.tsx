import {useEffect, useState} from 'react';
import {Modal, Tab, Tabs} from 'react-bootstrap';
import {toast} from 'react-toastify';
import deviceApi from "@/api/deviceApi";
import enumApi from "@/api/enumApi";
import medalApi from '@/api/medalApi';
import userApi from '@/api/userApi';
import ActivityHistory from '@/components/ActivityHistory';
import DetailModalTabTitle from '@/components/common/DetailModalTabTitle';
import ErrorState from '@/components/common/ErrorState';
import Loading from '@/components/common/Loading';
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
      className="app-modal detail-modal"
      fullscreen="md-down"
    >
      <Modal.Header closeButton>
        <div className="detail-modal__avatar">
          <i className="bi bi-person" aria-hidden="true"/>
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="detail-modal__heading">
            <Modal.Title as="h2" className="text-truncate">
              {user.nickname}
            </Modal.Title>
            <span className="detail-modal__id font-monospace">#{user.userId}</span>
          </div>
          <p className="app-modal__subtitle">유저 상세 정보</p>
        </div>
        <button
          className="btn btn-sm btn-outline-primary flex-shrink-0"
          onClick={handleSendPush}
        >
          <i className="bi bi-send me-1"/>
          <span className="d-none d-sm-inline">푸시 발송</span>
        </button>
      </Modal.Header>

      <Modal.Body>
        {isLoading ? (
          <div className="py-5">
            <Loading/>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUserDetail}/>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="border-0"
          >
            {/* 기본 정보 탭 */}
            <Tab
              eventKey="basic"
              title={<DetailModalTabTitle icon="bi-person-vcard" label="기본 정보"/>}
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
              title={<DetailModalTabTitle icon="bi-phone" label="디바이스 정보" count={devices.length}/>}
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
              title={<DetailModalTabTitle icon="bi-award" label="메달 정보" count={medals.length}/>}
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
              title={<DetailModalTabTitle icon="bi-activity" label="활동 이력"/>}
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

      <Modal.Footer>
        <button className="btn btn-outline-secondary" onClick={handleClose}>
          닫기
        </button>
      </Modal.Footer>

      {/* 메달 지급 확인 모달 */}
      <Modal show={showAssignConfirm} onHide={() => setShowAssignConfirm(false)} centered className="app-modal">
        <Modal.Header closeButton>
          <Modal.Title as="h2">
            <i className="bi bi-award"/>
            메달 지급 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMedalForAssign && (() => {
            const selectedMedal = allMedals.find(m => m.medalId === selectedMedalForAssign);
            return selectedMedal ? (
              <>
                <div className="text-center mb-3">
                  <img
                    src={selectedMedal.iconUrl}
                    alt={selectedMedal.name}
                    className="rounded-circle mb-2"
                    style={{width: '72px', height: '72px', objectFit: 'cover'}}
                  />
                  <h3 className="h6 fw-bold mb-1">{selectedMedal.name}</h3>
                  <p className="text-body-secondary small mb-0">{selectedMedal.introduction}</p>
                </div>
                <div className="alert alert-warning d-flex gap-2 mb-0">
                  <i className="bi bi-exclamation-triangle flex-shrink-0"/>
                  <div>
                    <strong>{user.nickname}</strong>님에게 이 메달을 지급하시겠습니까?
                    <div className="small mt-1">지급 후 취소할 수 없습니다.</div>
                  </div>
                </div>
              </>
            ) : null;
          })()}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-secondary"
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
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                지급 중...
              </>
            ) : (
              <>
                <i className="bi bi-award me-1"/>
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
