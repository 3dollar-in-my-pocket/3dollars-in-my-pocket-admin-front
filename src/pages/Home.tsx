import React, {useEffect} from "react";
import {GOOGLE_AUTH_URL} from "../constants/google";
import {Bounce, ToastContainer} from "react-toastify";

const Home = () => {
  useEffect(() => {
    return () => {
    };
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
      <div className="login-card bg-white shadow-lg rounded-4 p-5 text-center">
        <h1 className="fw-bold mb-2 text-primary fs-3">🚀 가슴속 3천원 관리자</h1>
        <p className="text-muted mb-4">Google 계정으로 시작하세요</p>

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

        <a
          href={GOOGLE_AUTH_URL}
          className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded shadow-sm"
          style={{fontSize: "1rem", fontWeight: 500}}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            style={{width: 20, height: 20}}
          />
          Google로 로그인
        </a>

        <p className="text-muted mt-4 mb-0" style={{fontSize: "0.85rem"}}>
          계정이 없으신가요? <br/> 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  );
};

export default Home;
