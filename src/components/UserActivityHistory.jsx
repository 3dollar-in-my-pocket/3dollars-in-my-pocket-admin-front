import { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import UserStoreHistory from './UserStoreHistory';
import UserReviewHistory from './UserReviewHistory';
import UserVisitHistory from './UserVisitHistory';
import UserStoreImageHistory from './UserStoreImageHistory';
import UserStoreReportHistory from './UserStoreReportHistory';

const UserActivityHistory = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('stores');
  const [loadedTabs, setLoadedTabs] = useState(new Set(['stores'])); // 처음엔 첫 번째 탭만 로드

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setLoadedTabs(prev => new Set([...prev, tabKey])); // 탭이 선택되면 로드된 탭 목록에 추가
  };

  return (
    <div className="p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 p-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-info bg-opacity-10 rounded-circle p-2">
              <i className="bi bi-activity text-info"></i>
            </div>
            <h5 className="mb-0 fw-bold text-dark">활동 이력</h5>
          </div>
        </div>
        <div className="card-body p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="nav-fill border-0 px-3 pt-3"
            style={{
              background: '#ffffff'
            }}
          >
            {/* 제보한 가게 목록 탭 */}
            <Tab
              eventKey="stores"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-shop"></i>
                  제보한 가게 목록
                </span>
              }
            >
              <div className="pt-0">
                {loadedTabs.has('stores') ? (
                  <UserStoreHistory userId={userId} isActive={activeTab === 'stores'} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">데이터를 불러오는 중...</p>
                  </div>
                )}
              </div>
            </Tab>

            {/* 리뷰 이력 탭 */}
            <Tab
              eventKey="reviews"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-chat-square-text"></i>
                  리뷰 이력
                </span>
              }
            >
              <div className="pt-0">
                {loadedTabs.has('reviews') ? (
                  <UserReviewHistory userId={userId} isActive={activeTab === 'reviews'} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">리뷰 데이터를 불러오는 중...</p>
                  </div>
                )}
              </div>
            </Tab>

            {/* 방문 이력 탭 */}
            <Tab
              eventKey="visits"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt"></i>
                  방문 이력
                </span>
              }
            >
              <div className="pt-0">
                {loadedTabs.has('visits') ? (
                  <UserVisitHistory userId={userId} isActive={activeTab === 'visits'} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">방문 이력을 불러오는 중...</p>
                  </div>
                )}
              </div>
            </Tab>

            {/* 가게 이미지 등록 이력 탭 */}
            <Tab
              eventKey="images"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-image"></i>
                  이미지 등록 이력
                </span>
              }
            >
              <div className="pt-0">
                {loadedTabs.has('images') ? (
                  <UserStoreImageHistory userId={userId} isActive={activeTab === 'images'} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">이미지 등록 이력을 불러오는 중...</p>
                  </div>
                )}
              </div>
            </Tab>

            {/* 가게 신고 이력 탭 */}
            <Tab
              eventKey="reports"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-exclamation"></i>
                  가게 신고 이력
                </span>
              }
            >
              <div className="pt-0">
                {loadedTabs.has('reports') ? (
                  <UserStoreReportHistory userId={userId} isActive={activeTab === 'reports'} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">신고 이력을 불러오는 중...</p>
                  </div>
                )}
              </div>
            </Tab>

            {/* 기타 활동 탭 (준비 중) */}
            <Tab
              eventKey="others"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-three-dots"></i>
                  기타 활동
                  <span className="badge bg-secondary rounded-pill ms-1" style={{ fontSize: '0.6rem' }}>
                    준비중
                  </span>
                </span>
              }
            >
              <div className="text-center py-5">
                <div className="bg-light rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-three-dots fs-1 text-secondary"></i>
                </div>
                <h5 className="text-dark mb-2">기타 활동 기능 준비 중</h5>
                <p className="text-muted">곧 다양한 활동 이력을 확인할 수 있습니다.</p>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserActivityHistory;