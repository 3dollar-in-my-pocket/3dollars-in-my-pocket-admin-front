import React, {Suspense, useEffect, useMemo, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import Loading from "@/components/common/Loading";
import Sidebar from "@/components/layout/Sidebar";
import {Bounce, toast, ToastContainer} from "react-toastify";
import {useAuthStore} from "@/state/authStore";
import {setGlobalNavigate} from "@/api/apiBase";
import useMenuGroups from "@/hooks/useMenuGroups";

const SIDEBAR_COLLAPSED_KEY = "admin.sidebarCollapsed";

const Layout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 모바일용
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  ); // 데스크톱용

  const isLoginState = useAuthStore((state) => state.isLoggedIn);
  const adminAuth = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const navigator = useNavigate();
  const menuGroups = useMenuGroups();

  // 전역 네비게이션 함수 설정
  useEffect(() => {
    setGlobalNavigate(navigator);
  }, [navigator]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // 모바일에서 사이드바가 열려 있으면 배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // ESC 로 모바일 사이드바 닫기
  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  // 현재 경로에 해당하는 메뉴 정보 (상단바 제목용)
  const currentMenu = useMemo(() => {
    for (const group of menuGroups) {
      const item = group.items.find(menuItem => menuItem.path === location.pathname);
      if (item) {
        return {group: group.title, label: item.label};
      }
    }
    return null;
  }, [menuGroups, location.pathname]);

  const handleLogout = () => {
    if (!window.confirm("정말로 로그아웃 하시겠습니까?")) {
      return;
    }

    logout();
    toast.info("로그아웃 되었습니다.");
    navigator('/');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  if (!isLoginState) {
    return (
      <div className="min-vh-100 bg-light px-3 px-md-5 py-4">
        <Suspense fallback={<Loading/>}>
          <Outlet/>
        </Suspense>
      </div>
    );
  }

  return (
    <>
      <Sidebar
        groups={menuGroups}
        admin={adminAuth}
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={closeSidebar}
        onLogout={handleLogout}
      />

      {isSidebarOpen && (
        <div className="app-backdrop d-lg-none" onClick={closeSidebar} aria-hidden="true"/>
      )}

      <main className={`app-main ${isSidebarCollapsed ? "app-main--expanded" : ""}`}>
        <header className="app-topbar">
          <button
            type="button"
            className="app-topbar__toggle d-lg-none"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="메뉴 열기"
          >
            <i className="bi bi-list"/>
          </button>

          <button
            type="button"
            className="app-topbar__toggle d-none d-lg-grid"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <i className={`bi ${isSidebarCollapsed ? "bi-layout-sidebar-inset" : "bi-layout-sidebar-inset-reverse"}`}/>
          </button>

          <div className="d-flex align-items-baseline gap-2 min-w-0">
            {currentMenu && (
              <span className="app-topbar__breadcrumb d-none d-sm-inline">{currentMenu.group} /</span>
            )}
            <h1 className="app-topbar__title">{currentMenu?.label ?? "대시보드"}</h1>
          </div>
        </header>

        <div className="app-content">
          <div className="app-content__surface">
            <Suspense fallback={<Loading/>}>
              <Outlet/>
            </Suspense>
          </div>
        </div>
      </main>

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
    </>
  );
};

export default Layout;
