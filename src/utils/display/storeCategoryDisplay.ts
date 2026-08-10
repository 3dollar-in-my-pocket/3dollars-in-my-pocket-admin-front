/**
 * 가게 카테고리 분류 표시 로직 (배지 클래스, 아이콘)
 *
 * 타입 정의는 types/storeCategory.ts에 있습니다.
 */

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
