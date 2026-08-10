import React from "react";

/** pushApi.searchUserByNickname 응답 항목 */
export interface PushSearchUser {
  id: string;
  nickname: string;
  socialType?: string;
  createdAt?: string;
}

/** 발송 대상으로 선택된 사용자 */
export interface PushSelectedUser {
  id: string;
  nickname: string;
}

interface UserSearchProps {
  nicknameSearch: string;
  onNicknameChange: (value: string) => void;
  onSearch: () => void;
  searchLoading?: boolean;
  searchResults: PushSearchUser[];
  isUserSelected: (userId: string) => boolean;
  onUserToggle: (userId: string, nickname?: string) => void;
  selectedUsers?: PushSelectedUser[];
  onUserRemove: (userId: string) => void;
}

const UserSearch = ({
                      nicknameSearch,
                      onNicknameChange,
                      onSearch,
                      searchLoading,
                      searchResults,
                      isUserSelected,
                      onUserToggle,
                      selectedUsers = [],
                      onUserRemove
                    }: UserSearchProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <>
      <div className="form-field">
        <label className="form-field__label" htmlFor="push-nickname">
          <i className="bi bi-search"/>
          닉네임으로 사용자 검색
        </label>
        <div className="form-inline-search">
          <input
            id="push-nickname"
            type="text"
            className="form-control"
            placeholder="닉네임을 입력하세요"
            value={nicknameSearch}
            onChange={(e) => onNicknameChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onSearch}
            disabled={searchLoading || !nicknameSearch.trim()}
          >
            {searchLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
            ) : (
              <>
                <i className="bi bi-search me-1"/>
                검색
              </>
            )}
          </button>
        </div>

        {searchResults.length > 0 && (
          <>
            <div className="form-subhead">
              <span>검색 결과 {searchResults.length}명 · 클릭하면 대상에 추가됩니다</span>
            </div>
            <div className="form-chips">
              {searchResults.map((user) => {
                const selected = isUserSelected(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    className={`form-chip ${selected ? "form-chip--selected" : "form-chip--addable"}`}
                    onClick={() => !selected && onUserToggle(user.id, user.nickname)}
                    disabled={selected}
                    title={selected ? "이미 추가된 사용자입니다" : "클릭하여 대상에 추가"}
                  >
                    <i className={`bi ${selected ? "bi-check-circle-fill" : "bi-plus-circle"}`}/>
                    <span>{user.nickname}</span>
                    <span className="form-chip__id">{user.id}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {!searchResults.length && (
          <p className="form-field__hint">
            검색 결과를 클릭하면 아래 대상 목록에 추가됩니다.
          </p>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <div className="form-field">
          <div className="form-subhead" style={{marginTop: 0}}>
            <span>선택된 사용자 {selectedUsers.length}명</span>
            <button
              type="button"
              className="form-subhead__clear"
              onClick={() => selectedUsers.forEach((user) => onUserRemove(user.id))}
            >
              전체 해제
            </button>
          </div>
          <div className="form-chips">
            {selectedUsers.map((user) => (
              <span key={user.id} className="form-chip">
                <i className="bi bi-person-check-fill text-success"/>
                <span>{user.nickname}</span>
                <span className="form-chip__id">{user.id}</span>
                <button
                  type="button"
                  className="form-chip__remove"
                  onClick={() => onUserRemove(user.id)}
                  aria-label={`${user.nickname} 선택 해제`}
                  title="선택 해제"
                >
                  <i className="bi bi-x-lg"/>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearch;
