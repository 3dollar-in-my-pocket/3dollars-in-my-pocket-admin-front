/// <reference types="vite/client" />

// CRA 시절의 REACT_APP_ 접두사를 유지합니다.
// vite.config.ts의 envPrefix 설정과 반드시 일치해야 합니다.
interface ImportMetaEnv {
  readonly REACT_APP_API_URI: string;
  readonly REACT_APP_CLIENT_ID: string;
  readonly REACT_APP_CLIENT_SECRET: string;
  readonly REACT_APP_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
