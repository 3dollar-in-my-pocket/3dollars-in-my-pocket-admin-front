/**
 * 숫자·평점 등 값 표시 포맷
 *
 * 날짜 포맷은 utils/dateUtils.ts를 사용하세요.
 */

/** 평점 표시: 리뷰가 없으면 안내 문구를 반환합니다. */
export const formatRating = (rating?: number): string => {
  if (!rating || rating <= 0) {
    return '아직 리뷰가 없어요';
  }
  return `${rating.toFixed(1)}점`;
};

/** 1000 이상은 k 단위로 축약합니다. */
export const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toLocaleString();
};
