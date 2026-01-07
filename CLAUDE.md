# CLAUDE.md

이 문서는 Claude Code (claude.ai/code)가 이 저장소에서 코드를 다룰 때 참고할 가이드입니다.

본 프로젝트는 **TypeScript 기반**의 React 애플리케이션으로, **데스크톱과 모바일 사용자** 모두를 대상으로 하며, 반응형 디자인과 컴포넌트 재사용을 적극 권장합니다. 동일한 코드베이스로 다양한 기기 환경을 유연하게 지원할 수 있어야 합니다.

---

## 개발 명령어

### 패키지 매니저

- 본 프로젝트는 **yarn**을 사용합니다. (`yarn.lock` 존재)

### 핵심 명령어

- `yarn start` - 개발 서버 실행
- `yarn build` - 프로덕션 빌드 생성 (TypeScript 컴파일 포함)
- `yarn test` - react-scripts 기반 테스트 실행
- `yarn outdated` - 패키지 업데이트 상태 확인
- `yarn upgrade` - 패키지 업데이트

### CI/CD

- GitHub Actions에서 Node.js 22.x+ 사용 권장
- CI 실행 시 `yarn install && yarn run build` 수행
- TypeScript 컴파일 검증 포함

---

## 프로젝트 아키텍처

### 기술 스택

- **언어**: TypeScript 5.9.3 (JavaScript에서 마이그레이션 완료)
- **프론트엔드 프레임워크**: React 18.3.1 + React Router DOM 6.11.0
- **상태 관리**: Recoil 0.7.7 (`src/state/LoginStatus.ts`)
- **UI 프레임워크**: React Bootstrap 2.10.3 + Bootstrap 5.3.3 + Bootstrap Icons 1.10.3 + React Icons 5.5.0
- **차트/시각화**: Recharts 3.3.0
- **HTTP 클라이언트**: Axios 1.7.4 (커스텀 인터셉터 포함)
- **알림 시스템**: React Toastify 11.0.5
- **유틸리티**: clsx 2.1.1, qs 6.14.0
- **인증**: Google OAuth 연동
- **환경 설정**: dotenv 17.2.3

### 디렉토리 구조

```
src/
├── adapters/      # 데이터 변환 어댑터
├── api/           # API 레이어 - 기능별 서비스 모듈 (.ts)
│   ├── apiBase.ts        # Axios 인스턴스 + 인터셉터 설정
├── components/    # 재사용 가능한 React 컴포넌트 (.tsx)
├── constants/     # 애플리케이션 상수
├── hooks/         # 커스텀 React 훅 (.ts)
├── pages/         # 기능별 페이지 컴포넌트 (.tsx)
├── router/        # React Router 설정 및 라우트 정의 (.ts/.tsx)
│   ├── Router.tsx        # 메인 라우터 설정
│   ├── PrivateRouter.tsx # 인증 라우트 가드
│   ├── manageRoutes.tsx  # /manage/* 관리 페이지
│   ├── authRoutes.tsx    # 인증 관련 라우트
│   └── infoRoutes.tsx    # 정보 페이지 라우트
├── service/       # 비즈니스 로직 서비스 (.ts)
├── state/         # Recoil 상태 관리 (.ts)
├── styles/        # 스타일 파일
├── types/         # TypeScript 타입 정의 (.ts)
├── utils/         # 유틸리티 함수 (.ts)
```

### 주요 아키텍처 패턴

#### 라우팅 구조

- `src/router/Router.tsx`에서 `createBrowserRouter` 사용
- 라우트 그룹 분리:
  - `manageRoutes.tsx` - `/manage/*` 관리 페이지
  - `infoRoutes.tsx` - 정보 페이지
  - `authRoutes.tsx` - 인증 관련 플로우
- 관리 페이지는 `PrivateRouter`로 보호
- 공통 레이아웃 컴포넌트(`Layout.tsx`)로 일관된 UI 유지

#### API 연동

- 중앙 API 설정: `src/api/apiBase.ts`
- Axios 인스턴스에서 `baseURL` 환경변수 사용
- 요청 인터셉터: LocalStorage에서 토큰 가져와 헤더에 추가
- 응답 인터셉터: 공통 에러 처리 (한국어 메시지)

**API Helper Functions** (`src/api/apiHelpers.ts`):
- `apiGet<T>()` - 타입 안전한 GET 요청
- `apiPost<T>()` - 타입 안전한 POST 요청 (nonce 지원)
- `apiPut<T>()` - 타입 안전한 PUT 요청
- `apiPatch<T>()` - 타입 안전한 PATCH 요청
- `apiDelete<T>()` - 타입 안전한 DELETE 요청
- `apiGetPaginated<T>()` - 커서 기반 페이지네이션 GET 요청

**IMPORTANT**: 새로운 API 모듈을 만들 때는 반드시 `apiHelpers`의 함수를 사용하세요. 직접 axiosInstance를 호출하지 마세요.

**Nonce 토큰 패턴**:
- 멱등성 없는 API의 중복 요청 방지를 위해 Nonce 토큰 사용
- `useNonce` 훅으로 토큰 발급 및 관리
- POST 요청 시 `apiPost`의 `options.nonce` 파라미터로 전달
- 예: FAQ 생성, 쿠폰 생성 등

**기능별 API 모듈**:
  - `adminApi` - 관리자 관리
  - `advertisementApi` - 광고 관리
  - `authApi` - 인증
  - `couponApi` - 쿠폰 관리
  - `deviceApi` - 디바이스 관리
  - `faqApi` - FAQ 관리
  - `medalApi` - 메달 관리
  - `policyApi` - 정책 관리
  - `pollApi` - 투표 관리
  - `pushApi` - 푸시 알림
  - `registrationApi` - 회원가입 관리
  - `reviewApi` - 리뷰 관리
  - `statisticsApi` - 통계
  - `storeApi` - 스토어 관리
  - `storeImageApi` - 스토어 이미지 관리
  - `storeMessageApi` - 스토어 메시지 관리
  - `storeReportApi` - 스토어 신고 관리
  - `uploadApi` - 파일 업로드
  - `userApi` - 유저 관리
  - `userRankingApi` - 유저 랭킹 관리
  - `visitApi` - 방문 관리

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

### 관리 페이지 (`/manage/*`)

- **대시보드** (`/manage`): 통계 및 현황 대시보드
- **광고 관리** (`/manage/advertisement`): 다단계 폼 기반 광고 등록/수정
- **유저 관리** (`/manage/user-search`): 유저 검색 및 상세 정보 조회, 리뷰/방문/신고 이력, 뱃지/푸시 발송
- **유저 랭킹** (`/manage/user-ranking`): 유저 랭킹 조회 및 메달 지급 기능
- **스토어 관리** (`/manage/store-search`): 스토어 검색 및 상세 정보, 이미지/메시지/게시물/리뷰/방문/신고 이력 관리
- **리뷰 관리** (`/manage/review`): 리뷰 조회 및 관리
- **스토어 메시지 관리** (`/manage/store-message`): 스토어 메시지 관리
- **메달 관리** (`/manage/medal`): 메달 생성/수정, 아이콘 업로드, 획득 조건 설정
- **쿠폰 관리** (`/manage/coupon`): 쿠폰 생성 및 관리
- **FAQ 관리** (`/manage/faq`): FAQ 생성 및 편집
- **정책 관리** (`/manage/policy`): 정책 설정 및 수정
- **푸시 알림** (`/manage/push-message`): 푸시 메시지 타겟팅 및 발송 관리
- **투표 관리** (`/manage/poll`): 투표 생성 및 관리
- **회원 가입 관리** (`/manage/registration`): 사용자 가입 요청 승인/거부
- **관리자 관리** (`/manage/admin`): 관리자 계정 관리 및 등록

### 관리 도구 (`/manage/tool/*`)

- **캐시 관리** (`/manage/tool/cache`): 시스템 캐시 관리
- **파일 업로드** (`/manage/tool/upload`): 이미지 및 파일 업로드
- **랜덤 이름 생성** (`/manage/tool/random-name`): 랜덤 이름 생성 도구

### 정보 페이지 (`/info/*`)

- **푸시 통계** (`/info/push-stat`): 푸시 발송 통계 및 분석

---

## 코드 스타일

### TypeScript

- **파일 확장자**:
  - React 컴포넌트: `.tsx`
  - 일반 TypeScript: `.ts`
- **타입 정의**: `src/types/` 디렉토리에 모듈별로 정리
  - `api.ts` - API 공통 타입 (CursorResponse 등)
  - `common.ts` - 공통 타입
- **tsconfig.json**: React 개발에 최적화된 설정
  - `baseUrl: "src"` + path alias `@/*` 설정
  - `strict: false`, `noImplicitAny: false` (점진적 타입 강화)

### 일반 규칙

- EditorConfig: 2칸 들여쓰기, LF, UTF-8
- 최대 줄 길이: 120자
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

**공통 컴포넌트** (`src/components/common/`):
- `EmptyState.tsx` - 빈 상태 UI 컴포넌트 (아이콘, 타이틀, 설명, 선택적 액션 버튼)
- `Loading.tsx` - 로딩 인디케이터
- 예: SearchForm, InputField, Button, Modal, Card, List

**재사용 가능한 커스텀 훅** (`src/hooks/`):
- `useInfiniteScroll` - IntersectionObserver 기반 무한 스크롤 구현
  - 리턴값: `{ scrollContainerRef, loadMoreRef }`
  - 파라미터: `{ hasMore, isLoading, onLoadMore, threshold }`
- `useModalForm<T>` - 모달 폼 상태 관리 (validation, submission, error 처리)
  - 리턴값: `{ formData, errors, isSubmitting, handleChange, handleSubmit, resetForm, setFormData, setFieldValue }`
  - 파라미터: `{ initialValues, onSubmit, onSuccess, validate, resetOnSuccess }`
- `useNonce` - Nonce 토큰 발급 및 관리 (중복 요청 방지)
  - 리턴값: `{ nonce, issueNonce, clearNonce, isLoading }`
- `useSearch` - 검색 및 커서 기반 페이지네이션
- `usePushForm` - 푸시 메시지 폼 관리

**유틸리티 함수** (`src/utils/`):
- `apiUtils.ts` - API 응답 처리, 커서 파라미터 빌드, Nonce 헤더 빌드
- `dateUtils.ts` - 날짜/시간 포맷
- 데이터 변환, 검증 등

**타입 정의** (`src/types/`):
- `api.ts` - API 공통 타입 (CursorResponse, ApiResponse, PaginatedResponse 등)
- `common.ts` - 공통 UI 컴포넌트 타입 (EmptyStateProps, InfiniteScrollConfig, ModalFormConfig)
- `auth.ts` - 인증 관련 타입
- 각 도메인별 타입 (store, user, review, coupon 등)

**상수 관리**: `constants/`에서 일괄 관리

**어댑터 패턴** (`src/adapters/`): API 응답을 UI 친화적으로 변환

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

- 버튼, 입력창, 모달 → 재사용 가능한 컴포넌트
- 반응형 원칙
- 로딩 상태 관리
- Skeleton / Spinner / Placeholder 적극 활용
- 알림 UX
- Toastify 사용 시 위치/중복 처리 규칙 정의


### 기타
- 신규 페이지 추가시 홈 및 네비 탭에 추가

---

## 🎯 공통 개발 패턴

### 새로운 API 모듈 만들기

```typescript
// src/api/exampleApi.ts
import { apiGet, apiPost, apiPut, apiDelete } from './apiHelpers';
import { ExampleType } from '../types/example';

const exampleApi = {
  getAll: async () => {
    return apiGet<ExampleType[]>('/v1/examples');
  },

  create: async (data: CreateExampleRequest, nonce: string) => {
    return apiPost<ExampleType>('/v1/examples', data, { nonce });
  },

  update: async (id: string, data: UpdateExampleRequest) => {
    return apiPut<ExampleType>(`/v1/examples/${id}`, data);
  },

  delete: async (id: string) => {
    return apiDelete(`/v1/examples/${id}`);
  }
};

export default exampleApi;
```

### 무한 스크롤 페이지 만들기

```typescript
import { useState, useCallback } from 'react';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import EmptyState from '../../components/common/EmptyState';

const ExampleList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchItems = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await exampleApi.getAll(reset ? null : cursor, 20);
      if (!response?.ok) return;

      const { contents = [], cursor: newCursor } = response.data || {};

      if (reset) {
        setItems(contents);
      } else {
        setItems(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  const { scrollContainerRef, loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchItems(false),
    threshold: 0.1
  });

  return (
    <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 280px)', overflowY: 'auto'}}>
      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon="bi-inbox"
          title="항목이 없습니다"
          description="등록된 항목이 없습니다."
        />
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      )}

      {hasMore && items.length > 0 && (
        <div ref={loadMoreRef}>
          {isLoading && <div className="spinner-border" />}
        </div>
      )}
    </div>
  );
};
```

### 모달 폼 만들기

```typescript
import { Modal } from "react-bootstrap";
import useModalForm from "../../hooks/useModalForm";
import { useNonce } from "../../hooks/useNonce";

interface FormData {
  name: string;
  email: string;
}

const ExampleModal = ({ show, onHide, selectedItem, onSuccess }) => {
  const { nonce, issueNonce, clearNonce } = useNonce();

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm
  } = useModalForm<FormData>({
    initialValues: { name: '', email: '' },
    validate: (values) => {
      const errors: any = {};
      if (!values.name.trim()) {
        errors.name = '이름은 필수입니다.';
      }
      if (!values.email.trim()) {
        errors.email = '이메일은 필수입니다.';
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (selectedItem) {
        return await exampleApi.update(selectedItem.id, values);
      } else {
        // 신규 등록 시 nonce 필요
        if (!nonce) throw new Error("Nonce 토큰이 없습니다.");
        return await exampleApi.create(values, nonce);
      }
    },
    onSuccess: () => {
      toast.success(selectedItem ? '수정되었습니다' : '등록되었습니다');
      onSuccess();
      onHide();
    }
  });

  // 신규 등록 시 nonce 발급
  useEffect(() => {
    if (show && !selectedItem) {
      issueNonce();
    } else if (!show) {
      clearNonce();
    }
  }, [show, selectedItem]);

  return (
    <Modal show={show} onHide={onHide}>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'is-invalid' : ''}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </Modal.Body>
        <Modal.Footer>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '저장'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
```
