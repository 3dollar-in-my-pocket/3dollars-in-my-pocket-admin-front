import React from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {Bounce, toast, ToastContainer} from "react-toastify";
import {useRecoilState} from "recoil";
import {LoginStatus} from "../state/LoginStatus";
import {LocalStorageService} from "../service/LocalStorageService";

const Layout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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
        <div className="col-md-3 col-lg-2 p-0 bg-dark text-white">
          <div className="d-flex flex-column h-100 p-4">
            <Link to="/manage" className="text-white mb-4 fw-bold text-decoration-none h4">
              🎯 DASHBOARD
            </Link>

            <ToastContainer
              position="top-right"
              limit={1}
              autoClose={2000}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              theme="colored"
              transition={Bounce}
            />

            <div className="mb-4">
              <h5 className="text-white-50 mb-3">서비스 관리</h5>
              <ul className="nav flex-column gap-2">
                <li>
                  <Link
                    to="/manage/advertisement"
                    className={`nav-link ... ${isActive("/manage/advertisement") ? "bg-primary text-white" : "text-white-50"}`}
                  >
                    <i className="bi bi-bullseye fs-5"></i>
                    <span className="fw-medium"> 광고 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/registration"
                    className={`nav-link ... ${isActive("/manage/registration") ? "bg-primary text-white" : "text-white-50"}`}
                  >
                    <i className="bi bi-person-lines-fill fs-5"></i>
                    <span className="fw-medium"> 사장님 가입 신청 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/faq"
                    className={`nav-link ... ${isActive("/manage/faq") ? "bg-primary text-white" : "text-white-50"}`}
                  >
                    <i className="bi bi-question-circle-fill fs-5"></i>
                    <span className="fw-medium"> FAQ 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/policy"
                    className={`nav-link ... ${isActive("/manage/policy") ? "bg-primary text-white" : "text-white-50"}`}
                  >
                    <i className="bi bi-shield-fill-check fs-5"></i>
                    <span className="fw-medium"> 정책 관리</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/push-message"
                    className={`nav-link ... ${isActive("/manage/push-message") ? "bg-primary text-white" : "text-white-50"}`}
                  >
                    <i className="bi bi-send-fill fs-5"></i>
                    <span className="fw-medium"> 푸시 발송 (TBD)</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h5 className="text-white-50 mb-3">운영 툴</h5>
              <ul className="nav flex-column gap-2">
                <li>
                  <Link
                    to="/manage/tool/cache"
                    className={`nav-link ... ${isActive("/manage/tool/cache") ? "bg-primary text-white" : "text-white-50"}`}
                  >
                    <i className="bi bi-brush-fill fs-5"></i>
                    <span className="fw-medium"> 캐시 운영 툴</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/manage/tool/upload"
                    className={`nav-link ... ${isActive("/manage/tool/upload") ? "bg-primary text-white" : "text-white-50"}`}
                  >
                    <i className="bi bi-image-fill fs-5"></i>
                    <span className="fw-medium"> 이미지 업로드 운영 툴</span>
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
                  >
                    <i className="bi bi-bar-chart-line-fill fs-5"></i>
                    <span className="fw-medium"> 푸시 발송 통계</span>
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

        <main className="col-md-9 col-lg-10 bg-light px-5 py-4">
          <div className="bg-white rounded shadow-sm p-4">
            <Outlet/>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
