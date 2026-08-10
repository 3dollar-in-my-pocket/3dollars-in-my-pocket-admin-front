import {getOsPlatformDisplayName} from '@/utils/display/deviceDisplay';
import {useEffect} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import {usePushForm} from '@/hooks/usePushForm';
import {parseAccountIds} from '@/utils/pushUtils';
import AdNoticeWarning from './AdNoticeWarning';
import PushFormFields from './PushFormFields';
import PushPreview from './PushPreview';

interface PushSendModalProps {
  show: boolean;
  onHide: () => void;
  initialUserIds?: number[];
}

const PUSH_TYPE_LABEL: Record<string, string> = {
  SIMPLE: '정보성 푸시',
  SIMPLE_MARKETING: '광고성 푸시'
};

const PushSendModal = ({show, onHide, initialUserIds = []}: PushSendModalProps) => {
  const {
    formData,
    searchState,
    selectedUsers,
    uiState,
    targetOsPlatforms,
    adNotice,
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
    toggleOsPlatform,
    resetForm
  } = usePushForm();

  useEffect(() => {
    if (show && initialUserIds.length > 0) {
      updateFormData('accountIdsInput', initialUserIds.join(', '));
    }
  }, [show, initialUserIds]);

  const handleConfirmSend = async () => {
    const success = await confirmSendPush();
    if (success) {
      toast.success('푸시가 성공적으로 발송되었습니다.');
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const targetCount = parseAccountIds(formData.accountIdsInput).length;
  const osLabel = Array.from(targetOsPlatforms).map(getOsPlatformDisplayName).join(', ');

  const summary = (
    <div className="form-summary">
      <div className="form-summary__row">
        <span className="form-summary__label">발송 대상</span>
        <span className="form-summary__value">
          {formData.targetType === 'USER' ? '유저' : '사장님'} {targetCount}명
        </span>
      </div>
      <div className="form-summary__row">
        <span className="form-summary__label">대상 OS</span>
        <span className={`form-summary__value ${osLabel ? '' : 'form-summary__value--muted'}`}>
          {osLabel || '미선택'}
        </span>
      </div>
      <div className="form-summary__row">
        <span className="form-summary__label">푸시 타입</span>
        <span className={`form-summary__value ${formData.pushType ? '' : 'form-summary__value--muted'}`}>
          {PUSH_TYPE_LABEL[formData.pushType] || '미선택'}
        </span>
      </div>
      <div className="form-summary__row">
        <span className="form-summary__label">랜딩 링크</span>
        <span className={`form-summary__value ${formData.path ? '' : 'form-summary__value--muted'}`}>
          {formData.path || '미선택'}
        </span>
      </div>
      <div className="form-summary__row">
        <span className="form-summary__label">이미지</span>
        <span className={`form-summary__value ${formData.imageUrl ? '' : 'form-summary__value--muted'}`}>
          {formData.imageUrl ? '첨부됨' : '없음'}
        </span>
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          <i className="bi bi-send-fill me-2 text-primary"/>
          푸시 발송
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {uiState.result && (
          <div className={`alert alert-${uiState.result.type} py-2`} role="alert">
            {uiState.result.message}
          </div>
        )}

        <div className="push-layout">
          <form onSubmit={(e) => e.preventDefault()}>
            <PushFormFields
              formData={formData}
              searchState={searchState}
              selectedUsers={selectedUsers}
              uiState={uiState}
              targetOsPlatforms={targetOsPlatforms}
              adNotice={adNotice}
              updateFormData={updateFormData}
              updateNicknameSearch={updateNicknameSearch}
              searchUserByNickname={searchUserByNickname}
              handleAddUser={handleAddUser}
              handleRemoveUser={handleRemoveUser}
              isUserSelected={isUserSelected}
              uploadImage={uploadImage}
              removeImage={removeImage}
              toggleOsPlatform={toggleOsPlatform}
            />
          </form>

          <aside className="push-layout__aside">
            <div className="section-card">
              <div className="section-card__head">
                <div>
                  <h2 className="section-card__title">
                    <i className="bi bi-phone-fill"/>
                    미리보기
                  </h2>
                  <p className="section-card__desc">입력한 내용이 실시간으로 반영됩니다.</p>
                </div>
              </div>
              <div className="section-card__body">
                <PushPreview
                  title={formData.title}
                  body={formData.body}
                  path={formData.path}
                  pushType={formData.pushType}
                  imageUrl={formData.imageUrl}
                />

                <hr className="my-3"/>
                {summary}
              </div>
            </div>
          </aside>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-light" onClick={handleClose}>
          취소
        </button>
        <button className="btn btn-primary" onClick={showSendConfirm} disabled={!canSend()}>
          <i className="bi bi-send-fill me-1"/>
          푸시 발송
        </button>
      </Modal.Footer>

      {/* 푸시 발송 확인 모달 */}
      <Modal show={uiState.showConfirm} onHide={hideSendConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">
            <i className="bi bi-send-check me-2 text-primary"/>
            푸시 발송 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            아래 내용으로 푸시를 발송합니다. <strong className="text-danger">발송 후에는 취소할 수 없습니다.</strong>
          </p>

          <AdNoticeWarning adNotice={adNotice}/>

          <div className="form-summary mb-3">
            <div className="form-summary__row">
              <span className="form-summary__label">제목</span>
              <span className={`form-summary__value ${formData.title ? '' : 'form-summary__value--muted'}`}>
                {formData.title || '없음'}
              </span>
            </div>
            <div className="form-summary__row">
              <span className="form-summary__label">내용</span>
              <span className={`form-summary__value ${formData.body ? '' : 'form-summary__value--muted'}`}>
                {formData.body || '없음'}
              </span>
            </div>
          </div>

          {summary}

          {selectedUsers.length > 0 && (
            <>
              <div className="form-subhead">
                <span>검색으로 추가한 사용자 {selectedUsers.length}명</span>
              </div>
              <div className="form-chips">
                {selectedUsers.slice(0, 8).map((user) => (
                  <span key={user.id} className="form-chip">{user.nickname}</span>
                ))}
                {selectedUsers.length > 8 && (
                  <span className="form-chip">+{selectedUsers.length - 8}명</span>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-light" onClick={hideSendConfirm} disabled={uiState.loading}>
            취소
          </button>
          <button
            className={`btn ${adNotice.hasMissing ? 'btn-warning' : 'btn-primary'}`}
            onClick={handleConfirmSend}
            disabled={uiState.loading}
          >
            {uiState.loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                발송 중...
              </>
            ) : (
              <>
                <i className="bi bi-send-fill me-1"/>
                {adNotice.hasMissing ? '표기 없이 발송' : '발송 확인'}
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default PushSendModal;
