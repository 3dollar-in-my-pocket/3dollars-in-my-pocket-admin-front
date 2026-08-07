// 푸시 관련 유틸리티 함수들

import {PushRequest} from "@/types/push";

/** 푸시 발송 폼에서 유효성 검사에 사용하는 입력값 */
export interface PushFormData {
  accountIdsInput: string;
  title: string;
  body: string;
  path: string;
  pushType: string;
}

/** 유효성 검사 결과 (성공 시에만 accountIds가 존재) */
export type PushValidationResult =
  | { isValid: false; message: string; accountIds?: undefined }
  | { isValid: true; message?: undefined; accountIds: PushRequest["accountIds"] };

/** 푸시 타입별 미리보기 스타일 */
export interface PushTypeStyles {
  backgroundColor: string;
  borderColor: string;
  appNameSuffix: string;
}

/**
 * 사용자 ID 문자열을 배열로 변환
 * @param {string} accountIdsString - 쉼표로 구분된 사용자 ID 문자열
 * @returns {string[]} - 정리된 사용자 ID 배열
 */
export const parseAccountIds = (accountIdsString: string): string[] => {
  return accountIdsString
    .split(",")
    .map((id: string) => id.trim())
    .filter(Boolean);
};

/**
 * 사용자 ID 배열을 문자열로 변환
 * @param {string[]} accountIds - 사용자 ID 배열
 * @returns {string} - 쉼표로 구분된 문자열
 */
export const formatAccountIds = (accountIds: string[]): string => {
  return accountIds.join(", ");
};

/**
 * 대상 목록에 사용자 추가
 * @param {string} currentIds - 현재 ID 문자열
 * @param {string} newUserId - 추가할 사용자 ID
 * @returns {string} - 업데이트된 ID 문자열
 */
export const addUserToTarget = (currentIds: string, newUserId: string | number): string => {
  const currentArray = parseAccountIds(currentIds);
  const userIdStr = newUserId.toString();

  if (!currentArray.includes(userIdStr)) {
    const newArray = [...currentArray, userIdStr];
    return formatAccountIds(newArray);
  }

  return currentIds;
};

/**
 * 대상 목록에서 사용자 제거
 * @param {string} currentIds - 현재 ID 문자열
 * @param {string} userIdToRemove - 제거할 사용자 ID
 * @returns {string} - 업데이트된 ID 문자열
 */
export const removeUserFromTarget = (currentIds: string, userIdToRemove: string | number): string => {
  const currentArray = parseAccountIds(currentIds);
  const userIdStr = userIdToRemove.toString();
  const newArray = currentArray.filter((id: string) => id !== userIdStr);
  return formatAccountIds(newArray);
};

/**
 * 사용자가 대상 목록에 포함되어 있는지 확인
 * @param {string} currentIds - 현재 ID 문자열
 * @param {string} userId - 확인할 사용자 ID
 * @returns {boolean} - 포함 여부
 */
export const isUserInTarget = (currentIds: string, userId: string | number): boolean => {
  const currentArray = parseAccountIds(currentIds);
  return currentArray.includes(userId.toString());
};

/**
 * 푸시 데이터 유효성 검사
 * @param {Object} pushData - 푸시 데이터
 * @returns {Object} - 유효성 검사 결과
 */
export const validatePushData = (pushData: PushFormData): PushValidationResult => {
  const {accountIdsInput, title, body, pushType, path} = pushData;

  // 푸시 타입 확인
  if (!pushType || pushType.trim() === "") {
    return {
      isValid: false,
      message: "푸시 타입을 선택해주세요."
    };
  }

  const accountIds = parseAccountIds(accountIdsInput);

  if (accountIds.length === 0) {
    return {
      isValid: false,
      message: "발송 대상을 입력해주세요."
    };
  }

  // 제목과 내용 중 하나는 필수
  if (!title?.trim() && !body?.trim()) {
    return {
      isValid: false,
      message: "제목 또는 내용 중 하나는 반드시 입력해주세요."
    };
  }

  // 이동 경로 필수
  if (!path || path.trim() === "") {
    return {
      isValid: false,
      message: "이동 경로를 입력해주세요."
    };
  }

  if (title && title.length > 50) {
    return {
      isValid: false,
      message: "제목은 50자 이하로 입력해주세요."
    };
  }

  if (body && body.length > 200) {
    return {
      isValid: false,
      message: "내용은 200자 이하로 입력해주세요."
    };
  }

  return {
    isValid: true,
    accountIds
  };
};

/**
 * 푸시 타입별 스타일 반환
 * @param {string} pushType - 푸시 타입
 * @returns {Object} - 스타일 객체
 */
export const getPushTypeStyles = (pushType: string): PushTypeStyles => {
  switch (pushType) {
    case "SIMPLE_MARKETING":
      return {
        backgroundColor: "#2d1b69",
        borderColor: "#4c3baf",
        appNameSuffix: " 📈"
      };
    default:
      return {
        backgroundColor: "#2c2c2e",
        borderColor: "#3a3a3c",
        appNameSuffix: ""
      };
  }
};
