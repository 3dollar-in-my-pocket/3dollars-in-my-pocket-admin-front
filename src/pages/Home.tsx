import React, {useState} from "react";
import {Navigate} from "react-router-dom";
import {GOOGLE_AUTH_URL} from "@/constants/google";
import {LocalStorageService} from "@/service/LocalStorageService";
import {useAuthStore} from "@/state/authStore";
import "@/styles/login.css";

/**
 * 미로그인 사용자를 위한 로그인 랜딩 화면.
 * 이미 인증된 상태(또는 토큰 보유 상태)라면 대시보드로 이동합니다.
 */
const Home = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  // 새로고침 직후에는 스토어가 비어 있으므로 토큰 존재 여부로 판단하고,
  // 실제 검증은 이동 대상인 PrivateRouter가 수행합니다.
  const [hasToken] = useState(() => Boolean(LocalStorageService.get("AUTH_TOKEN")));
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (isLoggedIn || hasToken) {
    return <Navigate to="/manage" replace/>;
  }

  return (
    <div className="login-page">
      <main className="login-card">
        <img src="/favicon.png" alt="" className="login-card__brand-mark"/>
        <h1 className="login-card__title">가슴속 3천원 관리자</h1>
        <p className="login-card__subtitle">Admin Console</p>

        <a
          href={GOOGLE_AUTH_URL}
          className={`login-card__google ${isRedirecting ? "login-card__google--loading" : ""}`}
          // 중복 클릭으로 OAuth 요청이 반복되지 않도록 이동 중에는 잠근다.
          onClick={() => setIsRedirecting(true)}
          aria-disabled={isRedirecting || undefined}
        >
          {isRedirecting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
              이동 중...
            </>
          ) : (
            <>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt=""
              />
              Google 계정으로 로그인
            </>
          )}
        </a>

        <div className="login-card__divider">도움이 필요하신가요?</div>

        <p className="login-card__help">
          계정이 없거나 접근 권한이 필요하면<br/>
          관리자에게 문의해 주세요.
        </p>
      </main>
    </div>
  );
};

export default Home;
