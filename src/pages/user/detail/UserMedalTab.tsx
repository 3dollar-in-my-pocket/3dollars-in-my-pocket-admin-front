import {Medal} from '@/types/medal';

interface UserMedalTabProps {
  /** 유저가 보유한 메달 목록 */
  medals: Medal[];
  /** 전체 메달 목록 */
  allMedals: Medal[];
  /** 대표 메달 */
  representativeMedal: Medal | null;
  /** 지급 대상으로 선택된 메달 ID */
  selectedMedalForAssign: number | null;
  /** 메달 지급 진행 중 여부 */
  isAssigningMedal: boolean;
  /** 메달 카드 클릭 콜백 */
  onSelectMedal: (medalId: number) => void;
  /** 메달 지급 확인 모달 열기 콜백 */
  onOpenAssignConfirm: () => void;
}

/**
 * 유저 상세 모달의 메달 정보 탭
 */
const UserMedalTab = ({
                        medals,
                        allMedals,
                        representativeMedal,
                        selectedMedalForAssign,
                        isAssigningMedal,
                        onSelectMedal,
                        onOpenAssignConfirm
                      }: UserMedalTabProps) => {
  return (
    <div className="p-1 p-sm-2 p-md-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 p-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-warning bg-opacity-10 rounded-circle p-2">
              <i className="bi bi-award text-warning"></i>
            </div>
            <h5 className="mb-0 fw-bold text-dark">보유 메달</h5>
            {medals.length > 0 && (
              <span className="badge bg-warning ms-auto px-3 py-2 rounded-pill">
                총 {medals.length}개
              </span>
            )}
          </div>
        </div>
        <div className="card-body p-4">
          {/* 대표 메달 섹션 */}
          {representativeMedal && (
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-star-fill text-warning"></i>
                대표 메달
              </h6>
              <div className="card border-warning border-2" style={{
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)',
                borderRadius: '16px'
              }}>
                <div className="card-body p-2 p-sm-3 p-md-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                      <img
                        src={representativeMedal.iconUrl}
                        alt={representativeMedal.name}
                        className="rounded-circle"
                        style={{width: '60px', height: '60px', objectFit: 'cover'}}
                        onError={(e: any) => {
                          e.target.src = representativeMedal.disableIconUrl || '/default-medal.png';
                        }}
                      />
                      <div className="position-absolute top-0 start-100 translate-middle">
                        <i className="bi bi-star-fill text-warning fs-5"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold text-dark mb-1">{representativeMedal.name}</h6>
                      <p className="text-muted mb-2 small">{representativeMedal.introduction}</p>
                      {representativeMedal.acquisition?.description && (
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                            style={{fontSize: '0.7rem'}}>
                            <i className="bi bi-info-circle me-1"></i>
                            {representativeMedal.acquisition.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 전체 메달 목록 */}
          <div>
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-collection text-primary"></i>
              전체 메달
              {allMedals.length > 0 && (
                <span className="badge bg-secondary ms-2">
                  보유: {medals.length} / {allMedals.length}
                </span>
              )}
            </h6>
            {allMedals.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle mx-auto mb-4" style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-award fs-1 text-secondary"></i>
                </div>
                <h5 className="text-dark mb-2">메달 정보를 불러오는 중입니다</h5>
                <p className="text-muted">잠시만 기다려주세요.</p>
              </div>
            ) : (
              <>
                <div className="row g-3">
                  {allMedals.map((medal, index) => {
                    const isOwned = medals.some(m => m.medalId === medal.medalId);
                    const isRepresentative = representativeMedal?.medalId === medal.medalId;
                    const ownedMedal = medals.find(m => m.medalId === medal.medalId);
                    const isSelected = selectedMedalForAssign === medal.medalId;

                    return (
                      <div key={medal.medalId || index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div
                          className={`card border-0 shadow-sm h-100 ${
                            isRepresentative ? 'border-warning border-2' :
                              isSelected ? 'border-primary border-3' : ''
                          }`}
                          style={{
                            background: isRepresentative
                              ? 'linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)'
                              : isSelected
                                ? 'linear-gradient(135deg, #cfe2ff 0%, #ffffff 100%)'
                                : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                            borderRadius: '16px',
                            opacity: isOwned ? 1 : 0.6,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                          }}
                          onClick={() => onSelectMedal(medal.medalId)}
                          onMouseEnter={(e) => {
                            if (!isOwned && !isSelected) {
                              e.currentTarget.style.opacity = '0.8';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isOwned && !isSelected) {
                              e.currentTarget.style.opacity = '0.6';
                            }
                          }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex flex-column align-items-center text-center">
                              <div className="position-relative mb-3">
                                <img
                                  src={isOwned ? medal.iconUrl : medal.disableIconUrl}
                                  alt={medal.name}
                                  className="rounded-circle"
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    filter: isOwned ? 'none' : 'grayscale(100%)'
                                  }}
                                  onError={(e: any) => {
                                    e.target.src = medal.disableIconUrl || '/default-medal.png';
                                  }}
                                />
                                {isRepresentative && (
                                  <div className="position-absolute top-0 start-100 translate-middle">
                                    <i className="bi bi-star-fill text-warning"></i>
                                  </div>
                                )}
                                {!isOwned && !isSelected && (
                                  <div className="position-absolute top-0 start-0 translate-middle">
                                    <i className="bi bi-lock-fill text-secondary"></i>
                                  </div>
                                )}
                                {isSelected && (
                                  <div className="position-absolute top-0 start-0 translate-middle">
                                    <div
                                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                      style={{width: '20px', height: '20px'}}>
                                      <i className="bi bi-check text-white fw-bold"></i>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <h6 className={`fw-bold mb-1 small ${isOwned ? 'text-dark' : 'text-muted'}`}>
                                {medal.name}
                              </h6>
                              <p className="text-muted mb-2 small"
                                 style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
                                {medal.introduction}
                              </p>
                              {isOwned ? (
                                ownedMedal?.acquisition?.description && (
                                  <span
                                    className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                                    style={{fontSize: '0.7rem'}}>
                                    <i className="bi bi-info-circle me-1"></i>
                                    {ownedMedal.acquisition.description}
                                  </span>
                                )
                              ) : isSelected ? (
                                <span
                                  className="badge bg-primary text-white rounded-pill px-2 py-1"
                                  style={{fontSize: '0.7rem'}}>
                                  <i className="bi bi-check-circle me-1"></i>
                                  선택됨
                                </span>
                              ) : (
                                <span
                                  className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1"
                                  style={{fontSize: '0.7rem'}}>
                                  <i className="bi bi-lock me-1"></i>
                                  미획득
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 메달 지급 버튼 */}
                {selectedMedalForAssign && (() => {
                  const isAlreadyOwned = medals.some(m => m.medalId === selectedMedalForAssign);
                  return (
                    <div className="mt-4 d-flex justify-content-center">
                      <button
                        className={`btn px-4 ${isAlreadyOwned ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={onOpenAssignConfirm}
                        disabled={isAssigningMedal || isAlreadyOwned}
                      >
                        <i
                          className={`bi ${isAlreadyOwned ? 'bi-check-circle-fill' : 'bi-award-fill'} me-2`}></i>
                        {isAlreadyOwned ? '이미 보유한 메달입니다' : '선택한 메달 지급하기'}
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMedalTab;
