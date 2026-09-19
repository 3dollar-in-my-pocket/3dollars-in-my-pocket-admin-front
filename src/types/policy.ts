/**
 * 정책(Policy) 도메인 응답 타입
 *
 * api-docs.json(OpenAPI)의 PolicyResponse / PolicyTypeResponse와 1:1로 대응합니다.
 */

/**
 * 정책 카테고리 식별자
 *
 * 문서상 enum이지만 값이 매우 많아(60개 이상) 유지보수를 위해 string으로 둡니다.
 */
export type PolicyCategoryId = string;

/**
 * 정책 식별자
 *
 * 문서상 enum이지만 값이 매우 많아(60개 이상) 유지보수를 위해 string으로 둡니다.
 */
export type PolicyId = string;

/** 정책 값의 저장·검증 방식. 서버의 PolicyValueType enum과 대응합니다. */
export type PolicyValueType = 'STRING' | 'BOOLEAN' | 'INTEGER' | 'DECIMAL' | 'DURATION';

/** PolicyResponse — 정책 상세 */
export interface Policy {
  categoryId: PolicyCategoryId;
  policyId: PolicyId;
  valueType: PolicyValueType;
  value: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

/** PolicyTypeResponse — 등록 가능한 정책 타입 */
export interface PolicyType {
  /** 문서상 필드명은 categoryId가 아닌 category입니다. */
  category: PolicyCategoryId;
  policyId: PolicyId;
  valueType: PolicyValueType;
  description: string;
}
