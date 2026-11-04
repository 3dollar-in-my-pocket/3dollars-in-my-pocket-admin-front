import {SimpleStore, StoreFoodCategory, StoreMenu} from './store';

export const STORE_DUPLICATE_CANDIDATE_STATUS = {
  PENDING: 'PENDING',
  MERGED: 'MERGED',
  IGNORED: 'IGNORED',
} as const;

export type StoreDuplicateCandidateStatus =
  typeof STORE_DUPLICATE_CANDIDATE_STATUS[keyof typeof STORE_DUPLICATE_CANDIDATE_STATUS];

/** CandidateStoreImage — 후보 가게의 최근 활성 이미지 */
export interface CandidateStoreImage {
  imageId: number;
  url: string;
  createdAt: string;
}

/**
 * CandidateStore — 어느 쪽을 남길지 판단하기 위한 가게 정보 + 데이터 규모
 * 개수는 집계 카운터 값이라 상세 화면과 순간적으로 다를 수 있습니다.
 */
export interface CandidateStore {
  store: SimpleStore;
  /** 가게 메뉴 전체 (등록 순서). 비활성 카테고리의 메뉴는 제외 */
  menus: StoreMenu[];
  reviewCount: number;
  subscriberCount: number;
  /** 전체 이미지 수. recentImages는 활성 이미지만 담아 이 값이 0보다 커도 비어 있을 수 있음 */
  imageCount: number;
  /** 최근 등록된 활성 이미지 최대 3개 (최신순) */
  recentImages: CandidateStoreImage[];
}

/** StoreDuplicateCandidateResponse — 배치가 찾아낸 중복 의심 가게 쌍 */
export interface StoreDuplicateCandidate {
  candidateId: string;
  status: StoreDuplicateCandidateStatus;
  /** 두 가게 사이 거리(m). 후보 생성 시점 값 */
  distanceMeters: number;
  /** 이름 유사도 0.0~1.0. 후보 생성 시점 값 */
  nameSimilarity: number;
  /** 공통 음식 카테고리. 비활성 카테고리는 제외되어 빈 배열일 수 있음 */
  overlappingCategories: StoreFoodCategory[];
  /** storeId가 작은 쪽. 가게 조회에 실패하면 null (원본/대상 의미 없음) */
  firstStore: CandidateStore | null;
  /** storeId가 큰 쪽. 가게 조회에 실패하면 null */
  secondStore: CandidateStore | null;
  createdAt: string;
}
