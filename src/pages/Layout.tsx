import React, {useState} from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {Bounce, toast, ToastContainer} from "react-toastify";
import {useRecoilState} from "recoil";
import {LoginStatus} from "../state/LoginStatus";
import {LocalStorageService} from "../service/LocalStorageService";

// 메뉴 항목 타입 정의
export interface MenuItem {
  path: string;
  label: string;
  icon: string; // Bootstrap Icons 클래스명 (예: "bi-search")
}

// 메뉴 그룹 타입 정의
export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

/**
 * 사이드바 메뉴 그룹 정의
 *
 * 새로운 메뉴를 추가하려면 아래 배열에서 원하는 그룹의 items 배열에 객체를 추가하세요.
 *
 * 예시:
 * {path: "/manage/new-menu", label: "새 메뉴", icon: "bi-star"}
 */
export const menuGroups: MenuGroup[] = [
  {
    title: "유저 관리",
    items: [
      {path: "/manage/user-search", label: "유저 검색", icon: "bi-search"},
      {path: "/manage/tool/random-name", label: "유저 랜덤 닉네임 관리", icon: "bi-person-badge"},
      {path: "/manage/user-ranking", label: "유저 랭킹 관리", icon: "bi-trophy-fill"},
    ],
  },
  {
    title: "사장님 관리",
    items: [
      {path: "/manage/registration", label: "사장님 가입 신청 관리", icon: "bi-person-lines-fill"},
    ],
  },
  {
    title: "가게 관리",
    items: [
      {path: "/manage/store-search", label: "가게 검색", icon: "bi-shop"},
      {path: "/manage/popular-neighborhood-stores", label: "인기 가게", icon: "bi-star-fill"},
      {path: "/manage/review", label: "가게 리뷰 관리", icon: "bi-chat-square-text"},
      {path: "/manage/coupon", label: "가게 쿠폰 관리", icon: "bi-ticket-perforated"},
      {path: "/manage/store-message", label: "가게 메시지 이력", icon: "bi-chat-left-text"},
    ],
  },
  {
    title: "콘텐츠",
    items: [
      {path: "/manage/advertisement", label: "광고 관리", icon: "bi-bullseye"},
      {path: "/manage/medal", label: "메달 관리", icon: "bi-award-fill"},
      {path: "/manage/faq", label: "FAQ 관리", icon: "bi-question-circle-fill"},
    ]
  },
  {
    title: "커뮤니티 관리",
    items: [
      {path: "/manage/poll", label: "투표 관리", icon: "bi-bar-chart-fill"},
    ],
  },
  {
    title: "운영 툴",
    items: [
      {path: "/manage/push-message", label: "푸시 발송", icon: "bi-send-fill"},
      {path: "/manage/policy", label: "정책 설정", icon: "bi-shield-fill-check"},
      {path: "/manage/tool/cache", label: "캐시 툴", icon: "bi-brush-fill"},
      {path: "/manage/tool/upload", label: "이미지 업로드 툴", icon: "bi-image-fill"},
    ],
  },
  {
    title: "통계 & 분석",
    items: [
      {path: "/info/service-statistics", label: "서비스 통계", icon: "bi-graph-up"},
      {path: "/info/ad-statistics", label: "광고 통계", icon: "bi-badge-ad"},
      {path: "/info/push-statistics", label: "푸시 통계", icon: "bi-bar-chart-line-fill"},
    ],
  },
  {
    title: "시스템 설정",
    items: [
      {path: "/manage/admin", label: "관리자 관리", icon: "bi-people-fill"},
      {path: "/info/etc-link", label: "기타 링크", icon: "bi-link-45deg"},
    ],
  },
];

const Layout = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 모바일용
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // 데스크톱용

  const [isLoginState, setIsLoginState] = useRecoilState(LoginStatus);
  const navigator = useNavigate();

  const handleLogout = () => {
    if (!window.confirm("정말로 로그아웃 하시겠습니까?")) {
      return;
    }

    setIsLoginState(false);
    LocalStorageService.delete("AUTH_TOKEN");

    toast.info("로그아웃 되었습니다.");

    navigator('/');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (!isLoginState) {
    return (
      <div className="min-vh-100 bg-light px-5 py-4">
        <Outlet/>
      </div>
    );
  }

  return (
    <div className="container-fluid h-100">
      <div className="row min-vh-100">
        <div
          className={`sidebar bg-dark text-white ${isSidebarOpen ? 'sidebar-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="d-flex flex-column h-100 p-4">
            <Link to="/manage" className="text-white mb-4 fw-bold text-decoration-none h4" onClick={closeSidebar}>
              🎯 DASHBOARD
            </Link>

            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                <h5 className="text-white-50 mb-3">{group.title}</h5>
                <ul className="nav flex-column gap-2">
                  {group.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link
                        to={item.path}
                        className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                          isActive(item.path) ? "bg-primary text-white" : "text-white-50"
                        }`}
                        onClick={closeSidebar}
                      >
                        <i className={`bi ${item.icon} fs-5`}></i>
                        <span className="fw-medium">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {isLoginState && (
              <div className="mt-auto">
                <button
                  className="btn btn-danger w-100 mt-4"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>

        {isSidebarOpen && (
          <div
            className="sidebar-backdrop d-md-none"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className={`main-content bg-light ${isSidebarCollapsed ? 'main-content-expanded' : ''}`}>
          <button
            className="btn btn-dark d-none d-md-flex align-items-center justify-content-center toggle-sidebar-btn-fixed"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <i className={`bi ${isSidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-5`}></i>
          </button>

          <div
            className="mobile-header d-md-none bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-dark border-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <i className="bi bi-list fs-4"></i>
            </button>
            <h5 className="mb-0 fw-bold text-primary">Dashboard</h5>
          </div>

          <div className="content-wrapper p-2 p-md-4">
            <div className="bg-white rounded shadow-sm p-2 p-md-4">
              <Outlet/>
            </div>
          </div>
        </main>
      </div>

      <ToastContainer
        position="top-right"
        limit={1}
        autoClose={2000}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
        transition={Bounce}
        style={{zIndex: 9999}}
      />
    </div>
  );
};

export default Layout;
