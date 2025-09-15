import { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import UserStoreHistory from './UserStoreHistory';
import UserReviewHistory from './UserReviewHistory';

const UserActivityHistory = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('stores');

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
            onSelect={(k) => setActiveTab(k)}
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
                <UserStoreHistory userId={userId} />
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
                <UserReviewHistory userId={userId} />
              </div>
            </Tab>

            {/* 방문 이력 탭 (준비 중) */}
            <Tab
              eventKey="visits"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt"></i>
                  방문 이력
                  <span className="badge bg-secondary rounded-pill ms-1" style={{ fontSize: '0.6rem' }}>
                    준비중
                  </span>
                </span>
              }
            >
              <div className="text-center py-5">
                <div className="bg-light rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-geo-alt fs-1 text-secondary"></i>
                </div>
                <h5 className="text-dark mb-2">방문 이력 기능 준비 중</h5>
                <p className="text-muted">곧 방문 이력을 확인할 수 있습니다.</p>
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