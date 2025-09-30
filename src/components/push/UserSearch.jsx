import { Button, Form } from "react-bootstrap";

const UserSearch = ({
  nicknameSearch,
  onNicknameChange,
  onSearch,
  searchLoading,
  searchResults,
  isUserSelected,
  onUserToggle,
  selectedUsers,
  onUserRemove
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  const handleUserClick = (user) => {
    const selected = isUserSelected(user.id);

    if (selected) {
      // 이미 선택된 사용자인 경우 제거
      onUserToggle(user.id);
    } else {
      // 새로운 사용자인 경우 추가 (중복 방지)
      onUserToggle(user.id, user.nickname);
    }
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-search me-2"></i>닉네임으로 사용자 검색
        </Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nicknameSearch}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="border-2"
            onKeyPress={handleKeyPress}
          />
          <Button
            variant="outline-primary"
            onClick={onSearch}
            disabled={searchLoading || !nicknameSearch.trim()}
            style={{minWidth: '100px'}}
          >
            {searchLoading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <>
                <i className="bi bi-search me-1"></i>
                검색
              </>
            )}
          </Button>
        </div>
        <Form.Text className="text-muted small">
          닉네임으로 사용자를 검색하여 대상에 추가할 수 있습니다 (중복 추가 방지)
        </Form.Text>
      </Form.Group>

      {/* 선택된 사용자 목록 */}
      {selectedUsers && selectedUsers.length > 0 && (
        <div className="mb-3">
          <div className="bg-success-subtle rounded p-3 border border-success">
            <h6 className="fw-semibold mb-2 text-success">
              <i className="bi bi-check-circle-fill me-1"></i>
              선택된 사용자 ({selectedUsers.length}명)
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="d-flex align-items-center gap-2 p-2 rounded bg-white border border-success"
                  style={{cursor: 'pointer'}}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-check-fill text-success"></i>
                    <span className="fw-medium text-success">{user.nickname}</span>
                    <small className="text-muted">({user.id})</small>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserRemove(user.id);
                      }}
                      style={{width: '24px', height: '24px', fontSize: '10px'}}
                      title="선택 해제"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      {searchResults.length > 0 && (
        <div className="mb-3">
          <div className="bg-light rounded p-3 border">
            <h6 className="fw-semibold mb-2">
              <i className="bi bi-person-search me-1"></i>
              검색 결과 ({searchResults.length}명)
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {searchResults.map((user) => {
                const selected = isUserSelected(user.id);
                return (
                  <div
                    key={user.id}
                    className={`d-flex align-items-center gap-2 p-2 rounded border ${
                      selected
                        ? 'bg-success-subtle border-success'
                        : 'bg-white border-secondary'
                    }`}
                    style={{
                      cursor: selected ? 'not-allowed' : 'pointer',
                      opacity: selected ? 0.7 : 1
                    }}
                    onClick={() => !selected && handleUserClick(user)}
                    title={selected ? '이미 선택된 사용자입니다' : '클릭하여 선택'}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${
                        selected
                          ? 'bi-check-circle-fill text-success'
                          : 'bi-plus-circle text-primary'
                      }`}></i>
                      <span className={`fw-medium ${selected ? 'text-success' : 'text-dark'}`}>
                        {user.nickname}
                      </span>
                      <small className="text-muted">({user.id})</small>
                      {selected && (
                        <small className="text-success fw-bold">✓ 선택됨</small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {searchResults.filter(user => isUserSelected(user.id)).length > 0 && (
              <small className="text-muted d-block mt-2">
                <i className="bi bi-info-circle me-1"></i>
                이미 선택된 사용자는 중복 추가되지 않습니다
              </small>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearch;