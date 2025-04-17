import React from "react";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: "광고 관리",
      description: "등록된 광고를 확인하고 관리할 수 있습니다.",
      icon: "bi-bullseye",
      route: "/manage/advertisement"
    },
    {
      title: "사장님 가입 신청",
      description: "신규 가입 요청을 검토하고 승인할 수 있습니다.",
      icon: "bi-person-plus-fill",
      route: "/manage/registration"
    },
    {
      title: "푸시 관리 (TBD)",
      description: "앱 사용자에게 발송할 푸시 메시지를 설정합니다.",
      icon: "bi-bell-fill",
      route: "/manage/push-message"
    },
    {
      title: "캐시 운영 툴",
      description: "서버 캐시를 수동으로 초기화할 수 있습니다.",
      icon: "bi-puzzle-fill",
      route: "/manage/tool/cache"
    },
    {
      title: "이미지 업로드",
      description: "운영용 이미지를 직접 업로드합니다.",
      icon: "bi-image",
      route: "/manage/tool/upload"
    },
  ];

  return (
    <div className="container py-4">
      <div className="mb-4 border-bottom pb-2 d-flex justify-content-between align-items-center">
        <h2 className="fw-bold">📊 관리자 메인 대시보드</h2>
      </div>

      <div className="row g-4">
        {tools.map((tool, idx) => (
          <div className="col-md-6 col-lg-4" key={idx}>
            <div
              className="card shadow-sm h-100 border-0 hover-shadow cursor-pointer"
              onClick={() => navigate(tool.route)}
              role="button"
            >
              <div className="card-body d-flex flex-column">
                <div className="mb-3">
                  <i className={`bi ${tool.icon} fs-2 text-primary`}></i>
                </div>
                <h5 className="card-title fw-bold">{tool.title}</h5>
                <p className="card-text text-muted">{tool.description}</p>
                <div className="mt-auto text-end">
                  <button className="btn btn-outline-primary btn-sm">
                    바로가기 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
