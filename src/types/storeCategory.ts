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
 * 카테고리 분류 타입별 배지 색상
 */
export const getCategoryClassificationBadgeClass = (type: string): string => {
  const badgeMap: Record<string, string> = {
    'TREND_SNACKS': 'bg-danger',
    'SNACKS': 'bg-warning',
    'MEAL': 'bg-primary',
  };

  return badgeMap[type] || 'bg-secondary';
};

/**
 * 카테고리 분류 타입별 아이콘
 */
export const getCategoryClassificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'TREND_SNACKS': 'bi-star-fill',
    'SNACKS': 'bi-basket-fill',
    'MEAL': 'bi-egg-fried',
  };

  return iconMap[type] || 'bi-question-circle-fill';
};
