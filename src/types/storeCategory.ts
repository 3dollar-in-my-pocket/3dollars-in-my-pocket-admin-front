/**
 * 가게 카테고리 분류 타입
 */
export interface StoreCategoryClassification {
  type: string;
  description: string;
  priority: number;
}

/**
 * 가게 카테고리
 */
export interface StoreCategory {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  classification: StoreCategoryClassification;
  isNew: boolean;
  displayOrder: number | null;
}

/**
 * 가게 카테고리 응답
 */
export interface StoreCategoryResponse {
  contents: StoreCategory[];
}

/**
 * 하위 호환용 re-export
 *
 * 표시 로직은 utils/display/storeCategoryDisplay.ts로 옮겼습니다.
 * 새 코드는 원본 경로에서 직접 import하세요.
 */
export {
  getCategoryClassificationBadgeClass,
  getCategoryClassificationIcon
} from '../utils/display/storeCategoryDisplay';
