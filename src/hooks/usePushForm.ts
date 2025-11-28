import { useState, useEffect } from "react";
import pushApi from "../api/pushApi";
import uploadApi from "../api/uploadApi";
import {
  validatePushData,
  addUserToTarget,
  removeUserFromTarget,
  parseAccountIds
} from "../utils/pushUtils";
import { useNonce } from "./useNonce";
import { OS_PLATFORM, OsPlatform } from "../types/push";

export const usePushForm = () => {
  const { nonce, issueNonce, clearNonce } = useNonce();

  // 훅이 처음 마운트될 때 Nonce 토큰 발급
  useEffect(() => {
    issueNonce();

    // 클린업 함수로 언마운트 시 토큰 초기화
    return () => {
      clearNonce();
    };
  }, [issueNonce, clearNonce]);
  // 폼 상태
  const [formData, setFormData] = useState({
    accountIdsInput: "",
    title: "",
    body: "",
    path: "",
    pushType: "SIMPLE",
    imageUrl: "",
    targetType: "USER" // USER 또는 BOSS
  });

  const [targetOsPlatforms, setTargetOsPlatforms] = useState<Set<OsPlatform>>(
    new Set([OS_PLATFORM.AOS, OS_PLATFORM.IOS])
  );

  // 검색 상태
  const [searchState, setSearchState] = useState({
    nicknameSearch: "",
    searchResults: [],
    searchLoading: false
  });

  // 선택된 사용자 목록 (닉네임 포함)
  const [selectedUsers, setSelectedUsers] = useState([]);

  // UI 상태
  const [uiState, setUiState] = useState({
    result: null,
    loading: false,
    showConfirm: false,
    uploading: false
  });

  // 폼 데이터 업데이트
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 결과 메시지 설정
  const setResult = (type, message) => {
    setUiState(prev => ({
      ...prev,
      result: { type, message }
    }));
  };

  // 사용자 검색
  const searchUserByNickname = async () => {
    if (!searchState.nicknameSearch.trim()) {
      setResult("warning", "검색할 닉네임을 입력해주세요.");
      return;
    }

    setSearchState(prev => ({ ...prev, searchLoading: true }));

    try {
      const response = await pushApi.searchUserByNickname(searchState.nicknameSearch);

      if (response.ok) {
        setSearchState(prev => ({
          ...prev,
          searchResults: response.data,
          searchLoading: false
        }));

        if (response.data.length === 0) {
          setResult("info", "검색 결과가 없습니다.");
        } else {
          setResult("success", `${response.data.length}명의 사용자를 찾았습니다.`);
        }
      } else {
        setSearchState(prev => ({
          ...prev,
          searchResults: [],
          searchLoading: false
        }));
        setResult("danger", response.error);
      }
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        searchResults: [],
        searchLoading: false
      }));
      setResult("danger", "사용자 검색 중 오류가 발생했습니다.");
    }
  };

  // 검색어 업데이트
  const updateNicknameSearch = (value) => {
    setSearchState(prev => ({
      ...prev,
      nicknameSearch: value
    }));
  };

  // 대상에 사용자 추가
  const handleAddUser = (userId, nickname) => {
    // 이미 선택된 사용자인지 확인
    if (isUserSelected(userId)) {
      return; // 중복 선택 방지
    }

    const newIds = addUserToTarget(formData.accountIdsInput, userId.toString());
    updateFormData("accountIdsInput", newIds);

    // 선택된 사용자 목록에 추가 (중복 방지)
    if (nickname && !selectedUsers.find(user => user.id.toString() === userId.toString())) {
      setSelectedUsers(prev => [...prev, { id: userId.toString(), nickname }]);
    }
  };

  // 대상에서 사용자 제거
  const handleRemoveUser = (userId) => {
    const newIds = removeUserFromTarget(formData.accountIdsInput, userId.toString());
    updateFormData("accountIdsInput", newIds);

    // 선택된 사용자 목록에서도 제거
    setSelectedUsers(prev => prev.filter(user => user.id.toString() !== userId.toString()));
  };

  // 사용자가 선택되어 있는지 확인
  const isUserSelected = (userId) => {
    const currentIds = parseAccountIds(formData.accountIdsInput);
    return currentIds.includes(userId.toString());
  };

  // 이미지 업로드
  const uploadImage = async (file) => {
    if (!file) return;

    setUiState(prev => ({ ...prev, uploading: true }));

    try {
      const response = await uploadApi.uploadImage("PUSH_IMAGE", file);

      if (response.ok) {
        updateFormData("imageUrl", response.data);
        setResult("success", "이미지가 성공적으로 업로드되었습니다.");
      } else {
        setResult("danger", response.message || "이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      setResult("danger", "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUiState(prev => ({ ...prev, uploading: false }));
    }
  };

  // 이미지 제거
  const removeImage = () => {
    updateFormData("imageUrl", "");
    setResult("success", "이미지가 제거되었습니다.");
  };

  // OS 플랫폼 토글
  const toggleOsPlatform = (platform: OsPlatform) => {
    setTargetOsPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  };

  // 푸시 발송 확인 모달 표시
  const showSendConfirm = () => {
    // 유효성 검사
    const validation = validatePushData(formData);
    if (!validation.isValid) {
      setResult("danger", validation.message);
      return;
    }

    // OS 플랫폼 검증
    if (targetOsPlatforms.size === 0) {
      setResult("danger", "최소 하나의 OS를 선택해주세요.");
      return;
    }

    setUiState(prev => ({ ...prev, showConfirm: true }));
  };

  // 푸시 발송 확인 모달 닫기
  const hideSendConfirm = () => {
    setUiState(prev => ({ ...prev, showConfirm: false }));
  };

  // 실제 푸시 발송
  const confirmSendPush = async () => {
    const validation = validatePushData(formData);

    // Nonce 토큰 검증
    if (!nonce) {
      setResult("danger", "Nonce 토큰이 발급되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setUiState(prev => ({ ...prev, loading: true, showConfirm: false }));

    try {
      const pushData = {
        accountIds: validation.accountIds,
        accountType: "USER_ACCOUNT",
        title: formData.title.trim(),
        body: formData.body.trim(),
        path: formData.path.trim(),
        imageUrl: formData.imageUrl || null,
        targetOsPlatforms: Array.from(targetOsPlatforms)
      };

      const response = await pushApi.sendPush(formData.pushType, pushData, nonce);

      if (response.ok) {
        setResult("success", "✅ 푸시 발송 성공!");
        // 폼 초기화
        setFormData({
          accountIdsInput: "",
          title: "",
          body: "",
          path: "",
          pushType: "SIMPLE",
          imageUrl: "",
          targetType: "USER"
        });
        setSearchState({
          nicknameSearch: "",
          searchResults: [],
          searchLoading: false
        });
        setSelectedUsers([]);
        setTargetOsPlatforms(new Set([OS_PLATFORM.AOS, OS_PLATFORM.IOS]));
        // 새로운 Nonce 토큰 발급
        issueNonce();
      } else {
        setResult("danger", response.error || "❌ 푸시 발송 실패");
      }
    } catch (error) {
      setResult("danger", "⚠️ 서버 오류 발생");
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  // 발송 가능 여부 확인
  const canSend = () => {
    const validation = validatePushData(formData);
    return validation.isValid && !uiState.loading && targetOsPlatforms.size > 0;
  };

  return {
    // 상태
    formData,
    searchState,
    selectedUsers,
    uiState,
    targetOsPlatforms,

    // 액션
    updateFormData,
    updateNicknameSearch,
    searchUserByNickname,
    handleAddUser,
    handleRemoveUser,
    isUserSelected,
    uploadImage,
    removeImage,
    showSendConfirm,
    hideSendConfirm,
    confirmSendPush,
    canSend,
    toggleOsPlatform
  };
};
