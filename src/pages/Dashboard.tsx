import {useNavigate} from "react-router-dom";
import {menuGroups} from "./Layout";

const Dashboard = () => {
  const navigate = useNavigate();

  // 메뉴 그룹별 색상 및 설명 매핑
  const groupStyles: Record<string, { color: string; icon: string; description: string }> = {
    "유저 관리": {
      color: "primary",
      icon: "bi-people-fill",
      description: "유저와 사장님 정보를 조회하고 관리합니다"
    },
    "사장님 관리": {
      color: "success",
      icon: "bi-person-badge-fill",
      description: "사장님 가입 신청을 관리합니다"
    },
    "가게 관리": {
      color: "success",
      icon: "bi-shop",
      description: "등록된 가게 정보를 검색하고 관리합니다"
    },
    "커뮤니티 관리": {
      color: "info",
      icon: "bi-chat-dots-fill",
      description: "투표 등 커뮤니티 기능을 관리합니다"
    },
    "콘텐츠 & 마케팅": {
      color: "warning",
      icon: "bi-megaphone-fill",
      description: "광고, 푸시, 쿠폰 등 마케팅 기능을 관리합니다"
    },
    "운영 툴": {
      color: "secondary",
      icon: "bi-tools",
      description: "정책, 캐시, 이미지 업로드 등 운영 도구를 관리합니다"
    },
    "통계 & 분석": {
      color: "danger",
      icon: "bi-graph-up",
      description: "서비스 사용 통계와 광고 성과를 확인합니다"
    },
    "시스템 설정": {
      color: "dark",
      icon: "bi-gear-fill",
      description: "관리자 계정 및 시스템 설정을 관리합니다"
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* 환영 메시지 */}
      <div className="mb-5 text-center">
        <h1 className="fw-bold mb-3">가슴속 3천원 어드민</h1>
        <p className="text-muted mb-0">관리자 대시보드에 오신 것을 환영합니다. 아래의 주요 기능과 빠른 링크를 통해 다양한 관리 작업을 수행할 수 있습니다.</p>
      </div>

      {/* 주요 기능 카테고리 */}
      <div className="mb-5">
        <h4 className="fw-semibold mb-4">주요 기능</h4>
        <div className="row g-4">
          {menuGroups.map((group, idx) => {
            const style = groupStyles[group.title] || {
              color: "secondary",
              icon: "bi-folder-fill",
              description: group.title
            };

            return (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`bg-${style.color} bg-opacity-10 p-3 rounded me-3`}>
                        <i className={`bi ${style.icon} fs-3 text-${style.color}`}></i>
                      </div>
                      <div>
                        <h5 className="card-title fw-bold mb-1">{group.title}</h5>
                        <p className="text-muted small mb-0">{style.description}</p>
                      </div>
                    </div>
                    <ul className="list-unstyled mb-0">
                      {group.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="mb-2">
                          <button
                            className="btn btn-link text-decoration-none p-0 text-start"
                            onClick={() => navigate(item.path)}
                          >
                            <i className={`bi ${item.icon} me-2`}></i>
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
