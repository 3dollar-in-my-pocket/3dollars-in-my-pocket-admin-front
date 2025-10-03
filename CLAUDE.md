# CLAUDE.md

이 문서는 Claude Code (claude.ai/code)가 이 저장소에서 코드를 다룰 때 참고할 가이드입니다.

본 프로젝트는 **데스크톱과 모바일 사용자** 모두를 대상으로 하며, 반응형 디자인과 컴포넌트 재사용을 적극 권장합니다. 동일한 코드베이스로 다양한 기기 환경을 유연하게 지원할 수 있어야 합니다.

---

## 개발 명령어

### 패키지 매니저

- 본 프로젝트는 **yarn**을 사용합니다. (`yarn.lock` 존재)

### 핵심 명령어

- `yarn start` - 개발 서버 실행
- `yarn build` - 프로덕션 빌드 생성
- `yarn test` - react-scripts 기반 테스트 실행

### CI/CD

- GitHub Actions에서 Node.js 16.x 사용
- CI 실행 시 `yarn install && yarn run build` 수행

---

## 프로젝트 아키텍처

### 기술 스택

- **프론트엔드 프레임워크**: React 18.3.1 + React Router DOM 6.11.0
- **상태 관리**: Recoil 0.7.7 (`src/state/LoginStatus.js`)
- **UI 프레임워크**: React Bootstrap 2.10.3 + Bootstrap 5.3.3 + Bootstrap Icons
- **HTTP 클라이언트**: Axios 1.7.4 (커스텀 인터셉터 포함)
- **알림 시스템**: React Toastify 11.0.5
- **인증**: Google OAuth 연동

### 디렉토리 구조

```
src/
├── api/           # API layer with service modules
├── components/    # Reusable React components
├── constants/     # Application constants (Google auth config)
├── pages/         # Page components organized by feature
├── router/        # React Router configuration and route definitions
├── service/       # Business logic services (LocalStorage)
├── state/         # Recoil state atoms
├── types/         # Type definitions
└── utils/         # Utility functions
```

### 주요 아키텍처 패턴

#### 라우팅 구조

- `src/router/Router.js`에서 `createBrowserRouter` 사용
- 라우트 그룹 분리:
    - `manageRoutes.js` - `/manage/*` 관리 페이지
    - `infoRoutes.js` - 정보 페이지
    - `authRoutes.js` - 인증 관련 플로우
- 관리 페이지는 `PrivateRouter`로 보호
- 공통 레이아웃 컴포넌트로 일관된 UI 유지

#### API 연동

- 중앙 API 설정: `src/api/apiBase.js`
- Axios 인스턴스에서 `baseURL` 환경변수 사용
- 요청 인터셉터: LocalStorage에서 토큰 가져와 헤더에 추가
- 응답 인터셉터: 공통 에러 처리 (한국어 메시지)
- 기능별 API 모듈 (adminApi, advertisementApi 등)

#### 인증 흐름

- Google OAuth: `/auth/google/callback` 리다이렉트 콜백
- 토큰 저장: `LocalStorageService`
- 로그인 상태: Recoil `LoginStatus` atom으로 관리
- 환경변수: OAuth Client ID, Secret, Redirect URI

#### 상태 관리

- Recoil 기반 전역 상태 관리
- 주요 상태 atom: `LoginStatus`
- LocalStorage 연동으로 데이터 지속성 유지

---

## 주요 기능 영역

- **광고 관리**: 다단계 폼 기반 광고 등록/수정
- **유저 관리**: 유저 검색 및 상세 정보/메달 관리
- **FAQ 관리**: FAQ 생성 및 편집
- **정책 설정**: 정책 설정 툴
- **푸시 알림**: 푸시 메시지 관리
- **회원 관리**: 사용자 가입 관리
- **관리자 도구**: 캐시 관리, 파일 업로드 등

---

## 코드 스타일

- EditorConfig: 2칸 들여쓰기, LF, UTF-8
- 최대 줄 길이: 120자
- JSX: `.jsx`, JS: `.js`
- 사용자 메시지 및 에러: 한국어 사용

---

## 💡 React 베스트 프랙티스

### 📝 컴포넌트 설계 원칙

- 단일 책임 원칙: 하나의 컴포넌트는 하나의 목적
- 상속보다 합성 우선
- 명확한 Props 인터페이스 설계
- 공통 로직은 커스텀 훅으로 추출
- Error Boundary 활용
- 접근성 고려 (ARIA, 시멘틱 HTML)

### 🎯 성능 최적화

- `React.memo`로 불필요한 리렌더링 방지
- `useMemo`, `useCallback`으로 연산 메모이제이션
- 코드 스플리팅 / Lazy loading
- 대용량 리스트는 Virtual Scrolling
- 번들 분석 및 최적화
- 이미지 최적화 (Lazy load, WebP)

### 📜 더보기 기반 페이지네이션

GET /api?cursor={{cursor}}&size=20

```json
{
    "contents": [{}], // 현재 페이지 내의 아이템 목록
    "cursor": {
        "hasMore": true, // 다음 페이지가 더 있는지 여부
        "nextCursor": "{{CURSOR}}" // (hasMore=true 한정) 다음 페이지를 조회하기 위한 커서
    }
}
```

서버에서 위와 같은 공통 모델의 커서 기반 페이지네이션을 응답하고 있음.

- UI에서 현재 페이지의 모든 항목을 조회하면 다음 페이지 호출
- 총 갯수 값이 서버에서 제공되지 않는 경우 전체 페이지 수 UI를 표시하지 않음.
- 비정상적으로 API가 반복 호출되지 않도록 주의


### 🔄 API 호출 최적화

- 중복 호출 방지
- useEffect 의존성 배열 신중 관리
- 디바운싱 적용
- 조건부 요청
- 필요할 때만 호출

👉 서버와 연동되는 버튼은 응답 완료 전까지 중복 호출 불가하게 구현

### 🔧 코드 재사용 & 공통 패턴

- 공통 컴포넌트: components/ 디렉토리에 구현
- 예: SearchForm, InputField, Button, Modal, Card, List
- 유틸 함수: utils/에 정의
- 날짜/시간 포맷, 데이터 변환, 검증
- 타입 정의: types/에 공통 정의
- 상수 관리: constants/에서 일괄 관리
- 커스텀 훅: useSearch, useApi, usePagination 등
- 어댑터 패턴: API 응답을 UI 친화적으로 변환

### 🔒 React 보안 체크리스트

- XSS 방지 (DOMPurify)
- CSRF 보호
- 안전한 인증 처리
- 입력값 검증
- dangerouslySetInnerHTML 최소화
- HTTPS API 통신
- 환경변수 보안
- Content Security Policy 설정

### UI/UX 가이드

8. UI/UX 가이드
- 버튼, 입력창, 모달 → 재사용 가능한 컴포넌트
- 반응형 원칙
- 로딩 상태 관리
- Skeleton / Spinner / Placeholder 적극 활용
- 알림 UX
- Toastify 사용 시 위치/중복 처리 규칙 정의