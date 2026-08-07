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
