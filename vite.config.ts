import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
