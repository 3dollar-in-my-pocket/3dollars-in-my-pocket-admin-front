/** 통계 차트 공통 테마 (Recharts) */

/** 시리즈 색상 - 대시보드 액센트 계열과 맞춘 팔레트 */
export const CHART_COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  danger: "#ef4444",
  neutral: "#94a3b8",
};

/** 축·그리드 공통 스타일 */
export const CHART_AXIS_PROPS = {
  tick: {fill: "#94a3b8", fontSize: 11},
  stroke: "#e2e8f0",
} as const;

export const CHART_GRID_PROPS = {
  stroke: "#f1f5f9",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export const CHART_TOOLTIP_PROPS = {
  contentStyle: {
    border: "1px solid #e9edf3",
    borderRadius: 10,
    fontSize: 12,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  },
} as const;

export const CHART_LEGEND_PROPS = {
  wrapperStyle: {fontSize: 12},
} as const;

/** 차트 높이 */
export const CHART_HEIGHT = 280;

/** Y축 큰 숫자 축약 (1.23K / 1.23M) */
export const formatAxisNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
};

/** 천 단위 구분 기호 */
export const formatNumber = (num: number): string => num.toLocaleString("ko-KR");

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-08-10" -> "2026-08-10 (월)" */
export const formatDateWithDay = (dateStr: string): string => {
  const dayOfWeek = DAY_LABELS[new Date(dateStr).getDay()];
  return `${dateStr} (${dayOfWeek})`;
};

/** "2026-08-10" -> "08-10 (월)" - 차트 X축용 */
export const formatShortDateWithDay = (dateStr: string): string => {
  const dayOfWeek = DAY_LABELS[new Date(dateStr).getDay()];
  return `${dateStr.substring(5)} (${dayOfWeek})`;
};
