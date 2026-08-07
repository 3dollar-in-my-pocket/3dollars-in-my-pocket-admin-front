import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // CRA 시절부터 사용해온 REACT_APP_ 접두사를 그대로 인식시킵니다.
  // 배포 환경(Netlify 등)에 등록된 환경변수를 수정하지 않기 위함입니다.
  envPrefix: ["VITE_", "REACT_APP_"],
  resolve: {
    // tsconfig.json의 baseUrl / paths(@/*) 설정을 그대로 사용
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Netlify 배포(--dir=build)와 기존 CI 설정을 유지하기 위해 CRA와 동일한 출력 경로 사용
    outDir: "build",
    sourcemap: true,
  },
});
