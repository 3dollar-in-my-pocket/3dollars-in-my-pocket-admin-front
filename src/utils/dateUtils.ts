/**
 * 표준 날짜시간 포맷: YYYY-MM-DD HH:mm
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

/**
 * 한국 로케일 날짜시간 포맷: YYYY년 MM월 DD일 HH:mm:ss
 */
export const formatDateTimeKo = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '없음';
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 짧은 한국 로케일 날짜시간 포맷: YYYY. MM. DD HH:mm
 */
export const formatDateTimeShortKo = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '없음';
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 날짜만 포맷: YYYY-MM-DD
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

/**
 * 시간만 포맷: HH:mm
 */
export const formatTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};
