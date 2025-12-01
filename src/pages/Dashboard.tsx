import {useNavigate} from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const serviceTools = [
    {
      title: "사장님 가입 신청",
      description: "신규 가입 요청을 검토하고 승인할 수 있습니다.",
      icon: "bi-person-plus-fill",
      route: "/manage/registration"
    },
    {
      title: "유저 관리",
      description: "유저를 검색하고 상세 정보를 확인할 수 있습니다.",
      icon: "bi-search",
      route: "/manage/user-search"
    },
    {
      title: "유저 랜덤 닉네임 관리",
      description: "유저에게 할당되는 랜덤 닉네임의 현황을 확인할 수 있습니다.",
      icon: "bi-person-badge",
      route: "/manage/tool/random-name"
    },
    {
      title: "유저 랭킹 관리",
      description: "랭킹 타입별 유저 랭킹을 조회하고 관리할 수 있습니다.",
      icon: "bi-trophy-fill",
      route: "/manage/user-ranking"
    },
    {
      title: "가게 관리",
      description: "가게를 검색하고 상세 정보를 확인할 수 있습니다.",
      icon: "bi-shop",
      route: "/manage/store-search"
    },
    {
      title: "가게 리뷰 관리",
      description: "가게에 등록된 리뷰를 조회하고 관리할 수 있습니다.",
      icon: "bi-chat-square-text",
      route: "/manage/review"
    },
    {
      title: "가게 쿠폰 관리",
      description: "전체 가게에 등록된 쿠폰을 조회하고 관리할 수 있습니다.",
      icon: "bi-ticket-perforated",
      route: "/manage/coupon"
    },
    {
      title: "가게 메시지 발송 이력",
      description: "가게에 등록된 메시지를 조회하고 관리할 수 있습니다.",
      icon: "bi-chat-left-text",
      route: "/manage/store-message"
    },
    {
      title: "커뮤니티 투표 관리",
      description: "투표를 생성하고 관리할 수 있습니다.",
      icon: "bi-bar-chart-fill",
      route: "/manage/poll"
    },
  ];

  const contentTools = [
    {
      title: "광고 관리",
      description: "등록된 광고를 확인하고 관리할 수 있습니다.",
      icon: "bi-bullseye",
      route: "/manage/advertisement"
    },
    {
      title: "FAQ 관리",
      description: "FAQ를 추가, 수정 및 삭제할 수 있습니다.",
      icon: "bi-question-circle-fill",
      route: "/manage/faq"
    },
    {
      title: "메달 관리",
      description: "앱에서 사용되는 메달 정보를 조회할 수 있습니다.",
      icon: "bi-award-fill",
      route: "/manage/medal"
    },
  ];

  const toolTools = [
    {
      title: "푸시 발송",
      description: "앱 사용자에게 발송할 푸시 메시지를 설정합니다.",
      icon: "bi-bell-fill",
      route: "/manage/push-message"
    },
    {
      title: "정책 관리",
      description: "시스템 정책을 등록하고 관리할 수 있습니다.",
      icon: "bi-shield-fill-check",
      route: "/manage/policy"
    },
    {
      title: "캐시 툴",
      description: "서버 캐시를 수동으로 초기화할 수 있습니다.",
      icon: "bi-puzzle-fill",
      route: "/manage/tool/cache"
    },
    {
      title: "이미지 업로드 툴",
      description: "운영용 이미지를 직접 업로드합니다.",
      icon: "bi-image",
      route: "/manage/tool/upload"
    },
  ];

  const statTools = [
    {
      title: "서비스 통계",
      description: "Firebase Analytics를 통해 각 앱의 서비스 사용 통계를 확인할 수 있습니다.",
      icon: "bi-graph-up",
      route: "/info/service-statistics"
    },
    {
      title: "광고 통계",
      description: "Google Analytics 및 AdMob을 통해 광고 관련 통계를 확인할 수 있습니다.",
      icon: "bi-badge-ad",
      route: "/info/ad-statistics"
    },
    {
      title: "푸시 통계",
      description: "Firebase에서 발송된 푸시 메시지의 통계를 확인할 수 있습니다.",
      icon: "bi-bar-chart-line-fill",
      route: "/info/push-statistics"
    },
  ];

  const etcTools = [
    {
      title: "기타 링크",
      description: "서비스 소개서, 사장님 앱 소개서, 광고 상품 소개서 등의 문서를 확인할 수 있습니다.",
      icon: "bi-link-45deg",
      route: "/info/etc-link"
    },
  ];

  const adminTools = [
    {
      title: "관리자 계정 관리",
      description: "관리자 계정을 조회하고 신규 관리자를 등록할 수 있습니다.",
      icon: "bi-people-fill",
      route: "/manage/admin"
    },
  ];

  return (
    <div className="container py-4">
      <div className="mb-4 border-bottom pb-2 d-flex justify-content-between align-items-center">
        <h2 className="fw-bold">📊 관리자 메인 대시보드</h2>
      </div>

      <div className="mb-4">
        <h4 className="fw-semibold">서비스 관리</h4>
        <div className="row g-4">
          {serviceTools.map((tool, idx) => (
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

      <div className="mb-4">
        <h4 className="fw-semibold">컨텐츠 관리</h4>
        <div className="row g-4">
          {contentTools.map((tool, idx) => (
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

      <div>
        <h4 className="fw-semibold">운영툴</h4>
        <div className="row g-4">
          {toolTools.map((tool, idx) => (
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

      <div className="mt-5">
        <h4 className="fw-semibold">지표/통계</h4>
        <div className="row g-4">
          {statTools.map((tool, idx) => (
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

      <div className="mt-5">
        <h4 className="fw-semibold">기타</h4>
        <div className="row g-4">
          {etcTools.map((tool, idx) => (
            <div className="col-md-6 col-lg-4" key={idx}>
              <div
                className="card shadow-sm h-100 border-0 hover-shadow cursor-pointer"
                onClick={() => navigate(tool.route)}
                role="button"
              >
                <div className="card-body d-flex flex-column">
                  <div className="mb-3">
                    <i className={`bi ${tool.icon} fs-2 text-info`}></i>
                  </div>
                  <h5 className="card-title fw-bold">{tool.title}</h5>
                  <p className="card-text text-muted">{tool.description}</p>
                  <div className="mt-auto text-end">
                    <button className="btn btn-outline-info btn-sm">
                      바로가기 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="fw-semibold">관리자 관리</h4>
        <div className="row g-4">
          {adminTools.map((tool, idx) => (
            <div className="col-md-6 col-lg-4" key={idx}>
              <div
                className="card shadow-sm h-100 border-0 hover-shadow cursor-pointer"
                onClick={() => navigate(tool.route)}
                role="button"
              >
                <div className="card-body d-flex flex-column">
                  <div className="mb-3">
                    <i className={`bi ${tool.icon} fs-2 text-success`}></i>
                  </div>
                  <h5 className="card-title fw-bold">{tool.title}</h5>
                  <p className="card-text text-muted">{tool.description}</p>
                  <div className="mt-auto text-end">
                    <button className="btn btn-outline-success btn-sm">
                      바로가기 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
