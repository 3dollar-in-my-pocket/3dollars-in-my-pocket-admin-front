import React, {useState} from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {Bounce, toast, ToastContainer} from "react-toastify";
import {useRecoilState} from "recoil";
import {LoginStatus} from "../state/LoginStatus";
import {LocalStorageService} from "../service/LocalStorageService";

const Layout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className={`sidebar bg-dark text-white ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="d-flex flex-column h-100 p-4">
            <Link to="/manage" className="text-white mb-4 fw-bold text-decoration-none h4" onClick={closeSidebar}>
              🎯 DASHBOARD
            </Link>


            <div className="mb-4">
              <h5 className="text-white-50 mb-3">서비스 관리</h5>
              <ul className="nav flex-column gap-2">
              <li>
                  <Link
                    to="/manage/registration"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/registration") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-person-lines-fill fs-5"></i>
                    <span className="fw-medium">사장님 가입 신청 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/advertisement"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/advertisement") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-bullseye fs-5"></i>
                    <span className="fw-medium">광고 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/user-search"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/user-search") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-search fs-5"></i>
                    <span className="fw-medium">유저 검색</span>
                  </Link>
                </li>

                 <li>
                  <Link
                    to="/manage/store-search"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/store-search") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-shop fs-5"></i>
                    <span className="fw-medium">가게 검색</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/poll"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/poll") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-bar-chart-fill fs-5"></i>
                    <span className="fw-medium">투표 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/faq"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/faq") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-question-circle-fill fs-5"></i>
                    <span className="fw-medium">FAQ 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/push-message"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/push-message") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-send-fill fs-5"></i>
                    <span className="fw-medium">푸시 발송</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h5 className="text-white-50 mb-3">운영 툴</h5>
              <ul className="nav flex-column gap-2">
                <li>
                  <Link
                    to="/manage/policy"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/policy") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-shield-fill-check fs-5"></i>
                    <span className="fw-medium">정책 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/tool/cache"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/tool/cache") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-brush-fill fs-5"></i>
                    <span className="fw-medium">캐시 운영 툴</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/tool/upload"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/tool/upload") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-image-fill fs-5"></i>
                    <span className="fw-medium">이미지 업로드 운영 툴</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h5 className="text-white-50 mb-3">통계</h5>
              <ul className="nav flex-column gap-2">
                <li>
                  <Link
                    to="/info/push-statistics"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/info/push-statistics") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-bar-chart-line-fill fs-5"></i>
                    <span className="fw-medium"> 푸시 발송 통계</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h5 className="text-white-50 mb-3">관리자 관리</h5>
              <ul className="nav flex-column gap-2">
                <li>
                  <Link
                    to="/manage/admin"
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                      isActive("/manage/admin") ? "bg-primary text-white" : "text-white-50"
                    }`}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-people-fill fs-5"></i>
                    <span className="fw-medium">관리자 계정 관리</span>
                  </Link>
                </li>
              </ul>
            </div>

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

        <main className="main-content bg-light">
          <div className="mobile-header d-md-none bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
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
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default Layout;
