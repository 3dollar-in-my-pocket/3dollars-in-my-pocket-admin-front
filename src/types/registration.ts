/**
 * 사장님 가입 신청(BossRegistration) 도메인 응답 타입
 *
 * api-docs.json(OpenAPI)의 BossRegistration*Response와 1:1로 대응합니다.
 */

import {OsPlatform} from './device';

/**
 * 소셜 로그인 타입
 *
 * 문서상 enum이지만 값 변동이 잦아 string으로 둡니다.
 */
export type BossSocialType = string;

/** BossRegistrationAccountResponse — 신청자(대표자) 정보 */
export interface BossRegistrationAccount {
  socialType: BossSocialType;
  name: string;
  businessNumber: string;
}

/** BossRegistrationStoreResponse — 신청 가게 정보 */
export interface BossRegistrationStore {
  name: string;
  categories: string[];
  certificationPhotoUrl: string;
}

/** BossRegistrationRequestContextResponse — 신청 환경 정보 */
export interface BossRegistrationRequestContext {
  osPlatform: OsPlatform;
  appVersion: string;
}

/** BossRegistrationResponse — 가입 신청 상세 */
export interface BossRegistration {
  registrationId: string;
  boss: BossRegistrationAccount;
  store: BossRegistrationStore;
  context?: BossRegistrationRequestContext | null;
  createdAt?: string;
  updatedAt?: string;
}
