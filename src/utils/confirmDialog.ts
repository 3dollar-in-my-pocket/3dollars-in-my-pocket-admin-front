/**
 * 표준 확인 다이얼로그
 * @param message 사용자에게 표시할 메시지
 * @returns 사용자가 확인을 누르면 true, 취소를 누르면 false
 */
export const showConfirm = (message: string): boolean => {
  return window.confirm(message);
};

/**
 * 삭제 확인 다이얼로그 (표준 메시지 포함)
 * @param itemName 삭제할 항목의 이름 (선택사항)
 * @returns 사용자가 확인을 누르면 true, 취소를 누르면 false
 */
export const showDeleteConfirm = (itemName?: string): boolean => {
  const message = itemName
    ? `정말로 "${itemName}"을(를) 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    : '정말로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.';
  return window.confirm(message);
};

/**
 * 블라인드 처리 확인 다이얼로그
 * @param itemInfo 블라인드 처리할 항목의 정보 (선택사항)
 * @returns 사용자가 확인을 누르면 true, 취소를 누르면 false
 */
export const showBlindConfirm = (itemInfo?: string): boolean => {
  const message = itemInfo
    ? `정말로 이 항목을 블라인드 처리하시겠습니까?\n\n${itemInfo}\n\n이 작업은 되돌릴 수 없습니다.`
    : '정말로 블라인드 처리하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.';
  return window.confirm(message);
};
